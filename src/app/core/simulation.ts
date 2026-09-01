import { AlertRow, Animal, Farm, Profile, SimulationEvent, SimulationRun, SimulationSnapshot, WelfarePhoto, WelfareRecord } from './models';
import { baseDailyGainKg, environmentModifier, productionStage, scenarioWelfareShift, targetWeightKg } from './welfare-scoring';

export interface SimulationDraft {
  name: string;
  animalId: string;
  feedType: SimulationRun['feedType'];
  scenario: SimulationRun['scenario'];
  horizonDays: number;
  startDate: string;
}

export interface SimulationResult {
  run: Omit<SimulationRun, 'id' | 'createdAt'>;
  snapshots: Omit<SimulationSnapshot, 'id' | 'simulationRunId'>[];
  events: Omit<SimulationEvent, 'id' | 'simulationRunId'>[];
}

export function runDiscreteEventSimulation(
  animal: Animal,
  farm: Farm,
  user: Profile,
  latestIndex: number,
  draft: SimulationDraft
): SimulationResult {
  let weight = animal.currentWeightKg;
  let welfareIndex = latestIndex;
  const targetWeight = targetWeightKg(animal.species, animal.purpose);
  let stage = productionStage(animal.species, weight, animal.swineStage);
  let targetDate: string | null = null;
  let complianceDate: string | null = latestIndex >= 80 ? draft.startDate : null;
  const snapshots: SimulationResult['snapshots'] = [];
  const events: SimulationResult['events'] = [];
  const random = mulberry32(hashSeed(animal.id + draft.horizonDays));
  const modifier = environmentModifier(draft.scenario);
  const shift = scenarioWelfareShift(draft.scenario);

  events.push({
    dayIndex: 0,
    eventDate: draft.startDate,
    eventType: 'ICA_CHECKPOINT',
    fromStage: null,
    toStage: stage,
    relatedValue: welfareIndex
  });

  for (let day = 1; day <= draft.horizonDays; day += 1) {
    const date = addDays(draft.startDate, day);
    const welfareModifier = 0.6 + (welfareIndex / 100) * 0.4;
    let dailyGain = baseDailyGainKg(animal.species, draft.feedType) * modifier * welfareModifier;
    if (random() < Math.max(0.01, (80 - welfareIndex) / 800)) {
      dailyGain *= 0.55;
      events.push({ dayIndex: day, eventDate: date, eventType: 'HEALTH_INCIDENT', fromStage: stage, toStage: stage, relatedValue: round(dailyGain) });
      welfareIndex = Math.max(35, welfareIndex - 4);
    }
    weight += dailyGain;
    welfareIndex = clamp(welfareIndex + shift / draft.horizonDays + (dailyGain > 0 ? 0.02 : -0.05));
    const nextStage = productionStage(animal.species, weight, animal.swineStage);
    if (nextStage !== stage) {
      events.push({ dayIndex: day, eventDate: date, eventType: 'STAGE_TRANSITION', fromStage: stage, toStage: nextStage, relatedValue: round(weight) });
      stage = nextStage;
    }
    const reached = weight >= targetWeight;
    if (reached && !targetDate) {
      targetDate = date;
      events.push({ dayIndex: day, eventDate: date, eventType: 'WEIGHT_TARGET', fromStage: stage, toStage: stage, relatedValue: round(weight) });
    }
    const recentDrop = events.some((event) => event.eventType === 'WELFARE_DROP' && day - event.dayIndex < 14);
    if (welfareIndex < 60 && !recentDrop) {
      events.push({ dayIndex: day, eventDate: date, eventType: 'WELFARE_DROP', fromStage: stage, toStage: stage, relatedValue: round(welfareIndex) });
    }
    if (!complianceDate && welfareIndex >= 80) {
      complianceDate = date;
      events.push({ dayIndex: day, eventDate: date, eventType: 'ICA_CHECKPOINT', fromStage: stage, toStage: stage, relatedValue: round(welfareIndex) });
    }
    snapshots.push({
      dayIndex: day,
      simulatedDate: date,
      weightKg: round(weight),
      averageDailyGainKg: round(dailyGain),
      welfareIndex: round(welfareIndex),
      productionStage: stage,
      icaWeightTargetReached: reached
    });
  }

  return {
    run: {
      farmId: farm.id,
      animalId: animal.id,
      createdById: user.id,
      name: draft.name,
      feedType: draft.feedType,
      scenario: draft.scenario,
      horizonDays: draft.horizonDays,
      startDate: draft.startDate,
      estimatedComplianceDate: complianceDate,
      estimatedTargetWeightDate: targetDate,
      finalWeightKg: round(weight),
      finalWelfareIndex: round(welfareIndex)
    },
    snapshots,
    events
  };
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function clamp(value: number): number {
  return Math.max(20, Math.min(100, value));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), 1 | t);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function latestRecordMap(records: WelfareRecord[]): Map<string, WelfareRecord> {
  const map = new Map<string, WelfareRecord>();
  const sorted = [...records].sort((left, right) => right.recordedAt.localeCompare(left.recordedAt));
  for (const record of sorted) {
    if (!map.has(record.animalId)) map.set(record.animalId, record);
  }
  return map;
}

export function canAccessFarm(user: Profile, farm: Farm): boolean {
  return user.role !== 'PRODUCER' || farm.ownerId === user.id;
}

export function visibleFarms(user: Profile, farms: Farm[]): Farm[] {
  return farms.filter((farm) => canAccessFarm(user, farm));
}

export function visibleAnimals(user: Profile, farms: Farm[], animals: Animal[]): Animal[] {
  const farmIds = new Set(visibleFarms(user, farms).map((farm) => farm.id));
  return animals.filter((animal) => farmIds.has(animal.farmId));
}

export function visibleAlerts(user: Profile, farms: Farm[], alerts: AlertRow[]): AlertRow[] {
  const farmIds = new Set(visibleFarms(user, farms).map((farm) => farm.id));
  return alerts.filter((alert) => farmIds.has(alert.farmId));
}

export function visiblePhotos(photos: WelfarePhoto[], records: WelfareRecord[]): WelfarePhoto[] {
  const ids = new Set(records.map((record) => record.id));
  return photos.filter((photo) => ids.has(photo.welfareRecordId));
}
