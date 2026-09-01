import Dexie, { Table } from 'dexie';
import { AlertRow, Animal, ComplianceFinding, Farm, Profile, SimulationEvent, SimulationRun, SimulationSnapshot, WelfarePhoto, WelfareRecord } from './models';
import { hashSecret, newId, nowIso } from './crypto';
import { isCloud } from './supabase.client';
import { scoreWelfare } from './welfare-scoring';

export class AnimalWelfareDatabase extends Dexie {
  profiles!: Table<Profile, string>;
  farms!: Table<Farm, string>;
  animals!: Table<Animal, string>;
  welfareRecords!: Table<WelfareRecord, string>;
  complianceFindings!: Table<ComplianceFinding, string>;
  welfarePhotos!: Table<WelfarePhoto, string>;
  alerts!: Table<AlertRow, string>;
  simulationRuns!: Table<SimulationRun, string>;
  simulationSnapshots!: Table<SimulationSnapshot, string>;
  simulationEvents!: Table<SimulationEvent, string>;

  constructor() {
    super('animal-welfare-platform');
    this.version(1).stores({
      profiles: 'id, email, role',
      farms: 'id, ownerId, name',
      animals: 'id, farmId, tagId, species',
      welfareRecords: 'id, animalId, evaluatorId, recordedAt',
      complianceFindings: 'id, welfareRecordId, code',
      welfarePhotos: 'id, welfareRecordId',
      alerts: 'id, farmId, animalId, code, acknowledged, createdAt',
      simulationRuns: 'id, farmId, animalId, createdById, createdAt',
      simulationSnapshots: 'id, simulationRunId, dayIndex',
      simulationEvents: 'id, simulationRunId, dayIndex'
    });
  }
}

export const database = new AnimalWelfareDatabase();

export async function ensureSeed(): Promise<void> {
  if (isCloud()) return;
  if (await database.profiles.count()) return;

  const producerId = newId();
  const vetId = newId();
  const adminId = newId();
  const highlandId = newId();
  const valleyId = newId();
  const createdAt = nowIso();

  await database.profiles.bulkAdd([
    { id: producerId, fullName: 'Camila Restrepo', email: 'producer@farm.local', passwordHash: await hashSecret('Producer123!'), documentId: '1029384756', phone: '3001234567', role: 'PRODUCER', createdAt },
    { id: vetId, fullName: 'Andres Molina', email: 'vet@farm.local', passwordHash: await hashSecret('Vet123!'), documentId: 'TP-44120', phone: '3109876543', role: 'VETERINARIAN', createdAt },
    { id: adminId, fullName: 'David Ramirez', email: 'admin@farm.local', passwordHash: await hashSecret('Admin123!'), documentId: '79800112', phone: '3205558899', role: 'ADMINISTRATOR', createdAt }
  ]);

  await database.farms.bulkAdd([
    { id: highlandId, ownerId: producerId, name: 'El Recuerdo', vaccinationRegistry: 'RUV-CUN-2045', hectares: 42.5, latitude: 4.711, longitude: -74.0721, waterSource: 'SPRING', soilType: 'Andisol', department: 'Cundinamarca', municipality: 'Zipaquira', createdAt },
    { id: valleyId, ownerId: producerId, name: 'La Esperanza', vaccinationRegistry: 'RUV-TOL-1188', hectares: 18, latitude: 4.4389, longitude: -75.2322, waterSource: 'RIVER', soilType: 'Inceptisol', department: 'Tolima', municipality: 'Ibague', createdAt }
  ]);

  const lucero: Animal = { id: newId(), farmId: highlandId, tagId: 'BOV-102', species: 'CATTLE', breed: 'Brahman', birthDate: daysAgo(540), sex: 'FEMALE', initialWeightKg: 280, currentWeightKg: 318, reproductiveStatus: 'OPEN', purpose: 'DUAL_PURPOSE', hornType: null, electricFenceAssociated: true, swineStage: null, environmentalEnrichment: null, createdAt };
  const nimbus: Animal = { id: newId(), farmId: highlandId, tagId: 'BOV-087', species: 'CATTLE', breed: 'Holstein', birthDate: daysAgo(900), sex: 'FEMALE', initialWeightKg: 390, currentWeightKg: 412, reproductiveStatus: 'LACTATING', purpose: 'MILK', hornType: null, electricFenceAssociated: true, swineStage: null, environmentalEnrichment: null, createdAt };
  const luna: Animal = { id: newId(), farmId: highlandId, tagId: 'CAP-014', species: 'GOAT', breed: 'Saanen', birthDate: daysAgo(420), sex: 'FEMALE', initialWeightKg: 28, currentWeightKg: 34, reproductiveStatus: 'PREGNANT', purpose: 'MILK', hornType: 'POLLED', electricFenceAssociated: null, swineStage: null, environmentalEnrichment: null, createdAt };
  const ceiba: Animal = { id: newId(), farmId: valleyId, tagId: 'POR-331', species: 'SWINE', breed: 'Landrace', birthDate: daysAgo(150), sex: 'MALE', initialWeightKg: 42, currentWeightKg: 78, reproductiveStatus: 'CASTRATED', purpose: 'MEAT', hornType: null, electricFenceAssociated: null, swineStage: 'FATTENING', environmentalEnrichment: true, createdAt };
  const bruma: Animal = { id: newId(), farmId: valleyId, tagId: 'POR-218', species: 'SWINE', breed: 'Pietrain', birthDate: daysAgo(240), sex: 'FEMALE', initialWeightKg: 55, currentWeightKg: 96, reproductiveStatus: 'PREGNANT', purpose: 'MEAT', hornType: null, electricFenceAssociated: null, swineStage: 'GESTATION', environmentalEnrichment: false, createdAt };
  await database.animals.bulkAdd([lucero, nimbus, luna, ceiba, bruma]);

  await saveAssessment(lucero, producerId, hoursAgo(12 * 24), { bodyConditionScore: 3, hydrationTimesPerDay: 3, beddingStatus: 'ADEQUATE', shadePercentage: 55, ambientTemperatureC: 24, relativeHumidity: 68, lameness: 'ABSENT', skinLesions: false, vaccinationUpToDate: true, spacePerAnimalM2: 6, socialInteraction: 'ADEQUATE', handlingQuality: 'CALM', notes: '' });
  await saveAssessment(nimbus, producerId, hoursAgo(4 * 24), { bodyConditionScore: 2, hydrationTimesPerDay: 2, beddingStatus: 'POOR', shadePercentage: 20, ambientTemperatureC: 31.5, relativeHumidity: 82, lameness: 'MILD', skinLesions: true, vaccinationUpToDate: false, spacePerAnimalM2: 3.8, socialInteraction: 'LIMITED', handlingQuality: 'STRESSFUL', notes: 'Heat and low shade during afternoon grazing' });
  await saveAssessment(luna, producerId, hoursAgo(7 * 24), { bodyConditionScore: 3, hydrationTimesPerDay: 4, beddingStatus: 'EXCELLENT', shadePercentage: 70, ambientTemperatureC: 22, relativeHumidity: 60, lameness: 'ABSENT', skinLesions: false, vaccinationUpToDate: true, spacePerAnimalM2: 2.2, socialInteraction: 'ADEQUATE', handlingQuality: 'CALM', notes: '' });
  await saveAssessment(ceiba, producerId, hoursAgo(2 * 24), { bodyConditionScore: 3, hydrationTimesPerDay: 3, beddingStatus: 'ADEQUATE', shadePercentage: 40, ambientTemperatureC: 26, relativeHumidity: 75, lameness: 'ABSENT', skinLesions: false, vaccinationUpToDate: true, spacePerAnimalM2: 1.1, socialInteraction: 'ADEQUATE', handlingQuality: 'ADEQUATE', notes: '' });
  await saveAssessment(bruma, producerId, hoursAgo(24), { bodyConditionScore: 2, hydrationTimesPerDay: 1, beddingStatus: 'CRITICAL', shadePercentage: 15, ambientTemperatureC: 33, relativeHumidity: 88, lameness: 'MODERATE', skinLesions: true, vaccinationUpToDate: false, spacePerAnimalM2: 1.2, socialInteraction: 'ISOLATED', handlingQuality: 'STRESSFUL', notes: 'Crowded gestation pen without enrichment' });
}

async function saveAssessment(
  animal: Animal,
  evaluatorId: string,
  recordedAt: string,
  input: Omit<WelfareRecord, 'id' | 'animalId' | 'evaluatorId' | 'recordedAt' | 'nutritionScore' | 'environmentScore' | 'healthScore' | 'behaviorScore' | 'mentalScore' | 'welfareIndex' | 'complianceLevel' | 'temperatureHumidityIndex'>
): Promise<void> {
  const scored = scoreWelfare(animal, input);
  const id = newId();
  await database.welfareRecords.add({
    id,
    animalId: animal.id,
    evaluatorId,
    recordedAt,
    ...input,
    nutritionScore: scored.nutritionScore,
    environmentScore: scored.environmentScore,
    healthScore: scored.healthScore,
    behaviorScore: scored.behaviorScore,
    mentalScore: scored.mentalScore,
    welfareIndex: scored.welfareIndex,
    complianceLevel: scored.complianceLevel,
    temperatureHumidityIndex: scored.temperatureHumidityIndex
  });
  await database.complianceFindings.bulkAdd(scored.findings.map((finding) => ({
    id: newId(),
    welfareRecordId: id,
    code: finding.code,
    domain: finding.domain,
    severity: finding.severity
  })));
  if (scored.complianceLevel === 'NON_COMPLIANT') {
    await database.alerts.add({ id: newId(), farmId: animal.farmId, animalId: animal.id, severity: 'HIGH', code: 'LOW_WELFARE_INDEX', acknowledged: false, createdAt: recordedAt });
  }
  if (scored.heatStressLevel === 'DANGER' || scored.heatStressLevel === 'EMERGENCY') {
    await database.alerts.add({ id: newId(), farmId: animal.farmId, animalId: animal.id, severity: 'CRITICAL', code: 'HEAT_STRESS', acknowledged: false, createdAt: recordedAt });
  }
  if (!input.vaccinationUpToDate) {
    await database.alerts.add({ id: newId(), farmId: animal.farmId, animalId: animal.id, severity: 'HIGH', code: 'VACCINATION_OVERDUE', acknowledged: false, createdAt: recordedAt });
  }
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}
