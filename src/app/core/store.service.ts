import { Injectable } from '@angular/core';
import { AlertRow, Animal, ComplianceFinding, Farm, SimulationEvent, SimulationRun, SimulationSnapshot, WelfarePhoto, WelfareRecord } from './models';
import { AuthService } from './auth.service';
import * as cloud from './cloud.repository';
import { newId, nowIso } from './crypto';
import { database, ensureSeed } from './database';
import { canAccessFarm, runDiscreteEventSimulation, SimulationDraft, visibleAlerts, visibleAnimals, visibleFarms } from './simulation';
import { isCloud } from './supabase.client';
import { heatStressLevel, minimumSpaceM2, scoreWelfare } from './welfare-scoring';

export interface DashboardData {
  averageWelfareIndex: number;
  farmCount: number;
  animalCount: number;
  openAlertCount: number;
  nonCompliantCount: number;
  compliance: { level: WelfareRecord['complianceLevel']; count: number }[];
  species: { species: Animal['species']; count: number }[];
  recentAlerts: AlertRow[];
  riskAnimals: { animal: Animal; farm: Farm; record: WelfareRecord }[];
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  constructor(private readonly auth: AuthService) {}

  async farms(): Promise<Farm[]> {
    const user = this.auth.requireUser();
    await ensureSeed();
    const rows = isCloud() ? await cloud.listFarms() : await database.farms.toArray();
    return visibleFarms(user, rows).sort((left, right) => left.name.localeCompare(right.name));
  }

  async farm(id: string): Promise<Farm> {
    const farm = isCloud() ? await cloud.getFarm(id) : await database.farms.get(id);
    if (!farm || !canAccessFarm(this.auth.requireUser(), farm)) throw new Error('Farm not found');
    return farm;
  }

  async saveFarm(input: Omit<Farm, 'id' | 'ownerId' | 'createdAt'> & { id?: string }): Promise<Farm> {
    const user = this.auth.requireUser();
    if (input.id) {
      const current = await this.farm(input.id);
      const farm = { ...current, ...input, id: current.id, ownerId: current.ownerId };
      if (isCloud()) return cloud.upsertFarm(farm);
      await database.farms.put(farm);
      return farm;
    }
    const farm: Farm = { ...input, id: newId(), ownerId: user.id, createdAt: nowIso() };
    if (isCloud()) return cloud.upsertFarm(farm);
    await database.farms.add(farm);
    return farm;
  }

  async deleteFarm(id: string): Promise<void> {
    await this.farm(id);
    if (isCloud()) {
      await cloud.removeFarm(id);
      return;
    }
    const animals = await database.animals.where('farmId').equals(id).toArray();
    for (const animal of animals) await this.deleteAnimal(animal.id);
    await database.alerts.where('farmId').equals(id).delete();
    await database.farms.delete(id);
  }

  async animals(farmId?: string): Promise<Animal[]> {
    const user = this.auth.requireUser();
    await ensureSeed();
    const farms = isCloud() ? await cloud.listFarms() : await database.farms.toArray();
    const rows = isCloud() ? await cloud.listAnimals() : await database.animals.toArray();
    let animals = visibleAnimals(user, farms, rows);
    if (farmId) animals = animals.filter((animal) => animal.farmId === farmId);
    return animals.sort((left, right) => left.tagId.localeCompare(right.tagId));
  }

  async animal(id: string): Promise<Animal> {
    const animal = isCloud() ? await cloud.getAnimal(id) : await database.animals.get(id);
    if (!animal) throw new Error('Animal not found');
    await this.farm(animal.farmId);
    return animal;
  }

  async saveAnimal(input: Omit<Animal, 'id' | 'createdAt'> & { id?: string }): Promise<Animal> {
    await this.farm(input.farmId);
    const siblings = isCloud()
      ? (await cloud.listAnimals()).filter((animal) => animal.farmId === input.farmId)
      : await database.animals.where('farmId').equals(input.farmId).toArray();
    if (siblings.some((animal) => animal.tagId === input.tagId.trim() && animal.id !== input.id)) {
      throw new Error('Tag already exists on this farm');
    }
    if (input.species === 'GOAT' && !input.hornType) throw new Error('Horn type is required for goats');
    if (input.species === 'SWINE' && !input.swineStage) throw new Error('Production stage is required for swine');
    const animal: Animal = {
      ...input,
      id: input.id ?? newId(),
      tagId: input.tagId.trim(),
      breed: input.breed.trim(),
      hornType: input.species === 'GOAT' ? input.hornType : null,
      electricFenceAssociated: input.species === 'CATTLE' ? Boolean(input.electricFenceAssociated) : null,
      swineStage: input.species === 'SWINE' ? input.swineStage : null,
      environmentalEnrichment: input.species === 'SWINE' ? Boolean(input.environmentalEnrichment) : null,
      createdAt: input.id ? (await this.animal(input.id)).createdAt : nowIso()
    };
    if (isCloud()) return cloud.upsertAnimal(animal);
    await database.animals.put(animal);
    return animal;
  }

  async deleteAnimal(id: string): Promise<void> {
    const animal = await this.animal(id);
    if (isCloud()) {
      await cloud.removeAnimal(animal.id);
      return;
    }
    const records = await database.welfareRecords.where('animalId').equals(id).toArray();
    for (const record of records) {
      await database.complianceFindings.where('welfareRecordId').equals(record.id).delete();
      await database.welfarePhotos.where('welfareRecordId').equals(record.id).delete();
      await database.welfareRecords.delete(record.id);
    }
    const runs = await database.simulationRuns.where('animalId').equals(id).toArray();
    for (const run of runs) {
      await database.simulationSnapshots.where('simulationRunId').equals(run.id).delete();
      await database.simulationEvents.where('simulationRunId').equals(run.id).delete();
      await database.simulationRuns.delete(run.id);
    }
    await database.alerts.where('animalId').equals(id).delete();
    await database.animals.delete(animal.id);
  }

  async recordsForAnimal(animalId: string): Promise<WelfareRecord[]> {
    await this.animal(animalId);
    if (isCloud()) return cloud.listRecordsForAnimal(animalId);
    return (await database.welfareRecords.where('animalId').equals(animalId).toArray())
      .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt));
  }

  async record(id: string): Promise<WelfareRecord> {
    const record = isCloud() ? await cloud.getRecord(id) : await database.welfareRecords.get(id);
    if (!record) throw new Error('Welfare record not found');
    await this.animal(record.animalId);
    return record;
  }

  async findings(recordId: string): Promise<ComplianceFinding[]> {
    if (isCloud()) return cloud.listFindings(recordId);
    return database.complianceFindings.where('welfareRecordId').equals(recordId).toArray();
  }

  async photos(recordId: string): Promise<WelfarePhoto[]> {
    if (isCloud()) return cloud.listPhotos(recordId);
    return database.welfarePhotos.where('welfareRecordId').equals(recordId).toArray();
  }

  async createRecord(input: Omit<WelfareRecord, 'id' | 'evaluatorId' | 'nutritionScore' | 'environmentScore' | 'healthScore' | 'behaviorScore' | 'mentalScore' | 'welfareIndex' | 'complianceLevel' | 'temperatureHumidityIndex'>): Promise<WelfareRecord> {
    const animal = await this.animal(input.animalId);
    const user = this.auth.requireUser();
    const scored = scoreWelfare(animal, input);
    const record: WelfareRecord = {
      ...input,
      id: newId(),
      evaluatorId: user.id,
      nutritionScore: scored.nutritionScore,
      environmentScore: scored.environmentScore,
      healthScore: scored.healthScore,
      behaviorScore: scored.behaviorScore,
      mentalScore: scored.mentalScore,
      welfareIndex: scored.welfareIndex,
      complianceLevel: scored.complianceLevel,
      temperatureHumidityIndex: scored.temperatureHumidityIndex
    };
    if (isCloud()) {
      await cloud.insertRecord(record, scored.findings);
    } else {
      await database.welfareRecords.add(record);
      await database.complianceFindings.bulkAdd(scored.findings.map((finding) => ({
        id: newId(),
        welfareRecordId: record.id,
        code: finding.code,
        domain: finding.domain,
        severity: finding.severity
      })));
    }
    await this.refreshAlerts(animal, record, scored.heatStressLevel);
    return record;
  }

  async addPhoto(recordId: string, file: File): Promise<WelfarePhoto> {
    await this.record(recordId);
    if (file.size > 2 * 1024 * 1024) throw new Error('Photos cannot exceed 2 MB');
    if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed');
    const photo: WelfarePhoto = {
      id: newId(),
      welfareRecordId: recordId,
      fileName: file.name,
      contentType: file.type,
      objectUrl: URL.createObjectURL(file),
      createdAt: nowIso()
    };
    if (isCloud()) return cloud.insertPhoto(photo, file, `${recordId}/${photo.id}`);
    await database.welfarePhotos.add(photo);
    return photo;
  }

  async alerts(): Promise<AlertRow[]> {
    const user = this.auth.requireUser();
    await ensureSeed();
    const farms = isCloud() ? await cloud.listFarms() : await database.farms.toArray();
    const rows = isCloud() ? await cloud.listAlerts() : await database.alerts.toArray();
    return visibleAlerts(user, farms, rows).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async acknowledge(alertId: string): Promise<void> {
    const alert = isCloud() ? await cloud.getAlert(alertId) : await database.alerts.get(alertId);
    if (!alert) throw new Error('Alert not found');
    await this.farm(alert.farmId);
    if (isCloud()) {
      await cloud.acknowledgeAlert(alertId);
      return;
    }
    await database.alerts.update(alertId, { acknowledged: true });
  }

  async dashboard(): Promise<DashboardData> {
    const farms = await this.farms();
    const animals = await this.animals();
    const records = isCloud() ? await cloud.listRecords() : await database.welfareRecords.toArray();
    const latest = new Map<string, WelfareRecord>();
    for (const record of [...records].sort((left, right) => right.recordedAt.localeCompare(left.recordedAt))) {
      if (!latest.has(record.animalId)) latest.set(record.animalId, record);
    }
    const complianceCount = { COMPLIANT: 0, ATTENTION: 0, NON_COMPLIANT: 0 };
    const speciesCount: Record<string, number> = {};
    const riskAnimals: DashboardData['riskAnimals'] = [];
    let indexSum = 0;
    let scored = 0;
    for (const animal of animals) {
      speciesCount[animal.species] = (speciesCount[animal.species] ?? 0) + 1;
      const record = latest.get(animal.id);
      if (!record) continue;
      indexSum += record.welfareIndex;
      scored += 1;
      complianceCount[record.complianceLevel] += 1;
      if (record.complianceLevel !== 'COMPLIANT') {
        const farm = farms.find((item) => item.id === animal.farmId);
        if (farm) riskAnimals.push({ animal, farm, record });
      }
    }
    riskAnimals.sort((left, right) => left.record.welfareIndex - right.record.welfareIndex);
    const alerts = (await this.alerts()).filter((alert) => !alert.acknowledged);
    return {
      averageWelfareIndex: scored ? Math.round((indexSum / scored) * 10) / 10 : 0,
      farmCount: farms.length,
      animalCount: animals.length,
      openAlertCount: alerts.length,
      nonCompliantCount: complianceCount.NON_COMPLIANT,
      compliance: [
        { level: 'COMPLIANT', count: complianceCount.COMPLIANT },
        { level: 'ATTENTION', count: complianceCount.ATTENTION },
        { level: 'NON_COMPLIANT', count: complianceCount.NON_COMPLIANT }
      ],
      species: Object.entries(speciesCount).map(([species, count]) => ({ species: species as Animal['species'], count })),
      recentAlerts: alerts.slice(0, 8),
      riskAnimals: riskAnimals.slice(0, 8)
    };
  }

  async simulations(): Promise<SimulationRun[]> {
    const animals = await this.animals();
    const ids = new Set(animals.map((animal) => animal.id));
    const runs = isCloud() ? await cloud.listRuns() : await database.simulationRuns.toArray();
    return runs.filter((run) => ids.has(run.animalId)).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async simulation(id: string): Promise<{ run: SimulationRun; snapshots: SimulationSnapshot[]; events: SimulationEvent[] }> {
    const run = isCloud() ? await cloud.getRun(id) : await database.simulationRuns.get(id);
    if (!run) throw new Error('Simulation not found');
    await this.farm(run.farmId);
    if (isCloud()) {
      return { run, snapshots: await cloud.listSnapshots(id), events: await cloud.listEvents(id) };
    }
    return {
      run,
      snapshots: (await database.simulationSnapshots.where('simulationRunId').equals(id).toArray()).sort((left, right) => left.dayIndex - right.dayIndex),
      events: (await database.simulationEvents.where('simulationRunId').equals(id).toArray()).sort((left, right) => left.dayIndex - right.dayIndex)
    };
  }

  async createSimulation(draft: SimulationDraft): Promise<SimulationRun> {
    const animal = await this.animal(draft.animalId);
    const farm = await this.farm(animal.farmId);
    const records = await this.recordsForAnimal(animal.id);
    const result = runDiscreteEventSimulation(animal, farm, this.auth.requireUser(), records[0]?.welfareIndex ?? 75, draft);
    const run: SimulationRun = { ...result.run, id: newId(), createdAt: nowIso() };
    const snapshots = result.snapshots.map((snapshot) => ({ ...snapshot, id: newId(), simulationRunId: run.id }));
    const events = result.events.map((event) => ({ ...event, id: newId(), simulationRunId: run.id }));
    if (isCloud()) {
      await cloud.insertSimulation(run, snapshots, events);
      return run;
    }
    await database.simulationRuns.add(run);
    await database.simulationSnapshots.bulkAdd(snapshots);
    await database.simulationEvents.bulkAdd(events);
    return run;
  }

  heatFor(animal: Animal, record: WelfareRecord) {
    return heatStressLevel(animal.species, record.temperatureHumidityIndex);
  }

  spaceMinimum(animal: Animal) {
    return minimumSpaceM2(animal.species, animal.swineStage);
  }

  private async refreshAlerts(animal: Animal, record: WelfareRecord, heat: ReturnType<typeof heatStressLevel>): Promise<void> {
    await this.upsertAlert(animal, 'LOW_WELFARE_INDEX', record.complianceLevel === 'NON_COMPLIANT', 'HIGH');
    await this.upsertAlert(animal, 'HEAT_STRESS', heat === 'DANGER' || heat === 'EMERGENCY', 'CRITICAL');
    await this.upsertAlert(animal, 'VACCINATION_OVERDUE', !record.vaccinationUpToDate, 'HIGH');
    await this.upsertAlert(animal, 'SPACE_BELOW_MINIMUM', record.spacePerAnimalM2 < minimumSpaceM2(animal.species, animal.swineStage), 'HIGH');
  }

  private async upsertAlert(animal: Animal, code: string, shouldExist: boolean, severity: AlertRow['severity']): Promise<void> {
    const open = isCloud()
      ? (await cloud.openAlertsForAnimal(animal.id)).find((alert) => alert.code === code)
      : (await database.alerts.where('animalId').equals(animal.id).toArray()).find((alert) => alert.code === code && !alert.acknowledged);
    if (shouldExist && !open) {
      const alert: AlertRow = {
        id: newId(),
        farmId: animal.farmId,
        animalId: animal.id,
        severity,
        code,
        acknowledged: false,
        createdAt: nowIso()
      };
      if (isCloud()) {
        await cloud.insertAlert(alert);
        return;
      }
      await database.alerts.add(alert);
    }
  }
}
