import { Animal, ComplianceLevel, EnvironmentScenario, FeedType, HandlingQuality, HeatStressLevel, LamenessScore, SocialInteraction, Species, SwineStage, WelfareDomain, WelfareRecord } from './models';

export interface FindingDraft {
  code: string;
  domain: WelfareDomain;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ScoreResult {
  nutritionScore: number;
  environmentScore: number;
  healthScore: number;
  behaviorScore: number;
  mentalScore: number;
  welfareIndex: number;
  temperatureHumidityIndex: number;
  heatStressLevel: HeatStressLevel;
  complianceLevel: ComplianceLevel;
  findings: FindingDraft[];
}

export function temperatureHumidityIndex(temperatureC: number, relativeHumidity: number): number {
  return (1.8 * temperatureC + 32) - ((0.55 - 0.0055 * relativeHumidity) * (1.8 * temperatureC - 26));
}

export function heatStressLevel(species: Species, index: number): HeatStressLevel {
  if (species === 'SWINE') {
    if (index >= 84) return 'EMERGENCY';
    if (index >= 79) return 'DANGER';
    if (index >= 74) return 'ALERT';
    return 'NORMAL';
  }
  if (index >= 90) return 'EMERGENCY';
  if (index >= 79) return 'DANGER';
  if (index >= 72) return 'ALERT';
  return 'NORMAL';
}

export function complianceLevel(welfareIndex: number): ComplianceLevel {
  if (welfareIndex >= 80) return 'COMPLIANT';
  if (welfareIndex >= 60) return 'ATTENTION';
  return 'NON_COMPLIANT';
}

export function minimumSpaceM2(species: Species, swineStage: SwineStage | null): number {
  if (species === 'CATTLE') return 4.5;
  if (species === 'GOAT') return 1.5;
  switch (swineStage ?? 'FATTENING') {
    case 'GESTATION': return 2;
    case 'FARROWING': return 3.5;
    case 'WEANING': return 0.3;
    case 'BREEDING': return 2.5;
    default: return 0.85;
  }
}

export function targetWeightKg(species: Species, purpose: Animal['purpose']): number {
  if (species === 'CATTLE') {
    if (purpose === 'MEAT') return 450;
    if (purpose === 'MILK') return 380;
    return 420;
  }
  if (species === 'GOAT') {
    if (purpose === 'MEAT') return 35;
    if (purpose === 'MILK') return 40;
    return 38;
  }
  return purpose === 'MEAT' ? 105 : 160;
}

export function productionStage(species: Species, weightKg: number, swineStage: SwineStage | null): string {
  if (species === 'CATTLE') {
    if (weightKg < 180) return 'CALF';
    if (weightKg < 320) return 'YEARLING';
    return 'ADULT';
  }
  if (species === 'GOAT') return weightKg < 18 ? 'KID' : 'ADULT';
  return swineStage ?? 'FATTENING';
}

export function baseDailyGainKg(species: Species, feedType: FeedType): number {
  const cattle = { GRAZING: 0.55, SUPPLEMENTED_GRAZING: 0.85, CONCENTRATE: 1.1, MIXED_RATION: 0.95, MILK: 0.7 };
  const goat = { GRAZING: 0.08, SUPPLEMENTED_GRAZING: 0.12, CONCENTRATE: 0.16, MIXED_RATION: 0.14, MILK: 0.18 };
  const swine = { GRAZING: 0.35, SUPPLEMENTED_GRAZING: 0.5, CONCENTRATE: 0.75, MIXED_RATION: 0.65, MILK: 0.4 };
  if (species === 'CATTLE') return cattle[feedType];
  if (species === 'GOAT') return goat[feedType];
  return swine[feedType];
}

export function environmentModifier(scenario: EnvironmentScenario): number {
  return { NORMAL: 1, DROUGHT: 0.7, HEAT_WAVE: 0.85, IMPROVED_HOUSING: 1.08, FEED_RESTRICTION: 0.55 }[scenario];
}

export function scenarioWelfareShift(scenario: EnvironmentScenario): number {
  return { NORMAL: 0, DROUGHT: -12, HEAT_WAVE: -10, IMPROVED_HOUSING: 8, FEED_RESTRICTION: -14 }[scenario];
}

export function scoreWelfare(animal: Animal, record: Pick<WelfareRecord, 'bodyConditionScore' | 'hydrationTimesPerDay' | 'beddingStatus' | 'shadePercentage' | 'ambientTemperatureC' | 'relativeHumidity' | 'lameness' | 'skinLesions' | 'vaccinationUpToDate' | 'spacePerAnimalM2' | 'socialInteraction' | 'handlingQuality'>): ScoreResult {
  const nutrition = nutritionScore(record.bodyConditionScore, record.hydrationTimesPerDay);
  const environment = environmentScore(animal.species, record.beddingStatus, record.shadePercentage, record.ambientTemperatureC);
  const health = healthScore(record.lameness, record.skinLesions, record.vaccinationUpToDate);
  const behavior = behaviorScore(animal, record.spacePerAnimalM2, record.socialInteraction);
  const mental = mentalScore(record.handlingQuality);
  const welfareIndex = round(0.25 * nutrition + 0.2 * environment + 0.25 * health + 0.15 * behavior + 0.15 * mental);
  const thi = round(temperatureHumidityIndex(record.ambientTemperatureC, record.relativeHumidity));
  const heat = heatStressLevel(animal.species, thi);
  return {
    nutritionScore: round(nutrition),
    environmentScore: round(environment),
    healthScore: round(health),
    behaviorScore: round(behavior),
    mentalScore: round(mental),
    welfareIndex,
    temperatureHumidityIndex: thi,
    heatStressLevel: heat,
    complianceLevel: complianceLevel(welfareIndex),
    findings: findings(animal, record, nutrition, environment, health, behavior, mental, heat)
  };
}

function nutritionScore(bodyConditionScore: number, hydrationTimesPerDay: number): number {
  const condition = bodyConditionScore === 3 ? 100 : bodyConditionScore === 2 || bodyConditionScore === 4 ? 70 : bodyConditionScore === 1 || bodyConditionScore === 5 ? 25 : 0;
  const hydration = hydrationTimesPerDay >= 3 ? 100 : hydrationTimesPerDay === 2 ? 70 : hydrationTimesPerDay === 1 ? 40 : 10;
  return (condition + hydration) / 2;
}

function environmentScore(species: Species, beddingStatus: WelfareRecord['beddingStatus'], shadePercentage: number, temperatureC: number): number {
  const bedding = { EXCELLENT: 100, ADEQUATE: 75, POOR: 40, CRITICAL: 15 }[beddingStatus];
  const shade = Math.max(0, Math.min(100, shadePercentage));
  return (bedding + shade + thermalComfort(species, temperatureC)) / 3;
}

function healthScore(lameness: LamenessScore, skinLesions: boolean, vaccinationUpToDate: boolean): number {
  const gait = { ABSENT: 100, MILD: 60, MODERATE: 30, SEVERE: 5 }[lameness];
  return (gait + (skinLesions ? 35 : 100) + (vaccinationUpToDate ? 100 : 0)) / 3;
}

function behaviorScore(animal: Animal, spacePerAnimalM2: number, socialInteraction: SocialInteraction): number {
  const required = minimumSpaceM2(animal.species, animal.swineStage);
  const density = Math.max(0, Math.min(100, (spacePerAnimalM2 / required) * 100));
  const social = { ADEQUATE: 100, LIMITED: 55, ISOLATED: 15 }[socialInteraction];
  let score = (density + social) / 2;
  if (animal.species === 'SWINE' && animal.environmentalEnrichment === false) score = Math.min(score, 70);
  return score;
}

function mentalScore(handlingQuality: HandlingQuality): number {
  return { CALM: 100, ADEQUATE: 70, STRESSFUL: 20 }[handlingQuality];
}

function thermalComfort(species: Species, temperatureC: number): number {
  const range = species === 'SWINE' ? [16, 22] : species === 'GOAT' ? [12, 27] : [10, 24];
  if (temperatureC >= range[0] && temperatureC <= range[1]) return 100;
  const distance = temperatureC < range[0] ? range[0] - temperatureC : temperatureC - range[1];
  return Math.max(0, 100 - distance * 8);
}

function findings(
  animal: Animal,
  record: Pick<WelfareRecord, 'bodyConditionScore' | 'hydrationTimesPerDay' | 'beddingStatus' | 'shadePercentage' | 'lameness' | 'skinLesions' | 'vaccinationUpToDate' | 'spacePerAnimalM2' | 'handlingQuality'>,
  nutrition: number,
  environment: number,
  health: number,
  behavior: number,
  mental: number,
  heat: HeatStressLevel
): FindingDraft[] {
  const items: FindingDraft[] = [];
  if (record.bodyConditionScore <= 2 || record.bodyConditionScore >= 5) items.push({ code: 'BCS_OUT_OF_RANGE', domain: 'NUTRITION', severity: 'HIGH' });
  if (record.hydrationTimesPerDay < 2) items.push({ code: 'LOW_HYDRATION', domain: 'NUTRITION', severity: 'HIGH' });
  if (record.beddingStatus === 'POOR' || record.beddingStatus === 'CRITICAL') items.push({ code: 'POOR_RESTING_SURFACE', domain: 'ENVIRONMENT', severity: 'MEDIUM' });
  if (record.shadePercentage < 30) items.push({ code: 'INSUFFICIENT_SHADE', domain: 'ENVIRONMENT', severity: 'MEDIUM' });
  if (heat === 'DANGER' || heat === 'EMERGENCY') items.push({ code: 'HEAT_STRESS', domain: 'ENVIRONMENT', severity: 'CRITICAL' });
  if (record.lameness === 'MODERATE' || record.lameness === 'SEVERE') items.push({ code: 'LAMENESS', domain: 'HEALTH', severity: 'HIGH' });
  if (record.skinLesions) items.push({ code: 'SKIN_LESIONS', domain: 'HEALTH', severity: 'MEDIUM' });
  if (!record.vaccinationUpToDate) items.push({ code: 'VACCINATION_OVERDUE', domain: 'HEALTH', severity: 'HIGH' });
  if (record.spacePerAnimalM2 < minimumSpaceM2(animal.species, animal.swineStage)) items.push({ code: 'SPACE_BELOW_MINIMUM', domain: 'BEHAVIOR', severity: 'HIGH' });
  if (animal.species === 'SWINE' && animal.environmentalEnrichment === false) items.push({ code: 'MISSING_ENRICHMENT', domain: 'BEHAVIOR', severity: 'MEDIUM' });
  if (record.handlingQuality === 'STRESSFUL') items.push({ code: 'STRESSFUL_HANDLING', domain: 'MENTAL', severity: 'HIGH' });
  if (nutrition < 60) items.push({ code: 'NUTRITION_DOMAIN_RISK', domain: 'NUTRITION', severity: 'MEDIUM' });
  if (environment < 60) items.push({ code: 'ENVIRONMENT_DOMAIN_RISK', domain: 'ENVIRONMENT', severity: 'MEDIUM' });
  if (health < 60) items.push({ code: 'HEALTH_DOMAIN_RISK', domain: 'HEALTH', severity: 'HIGH' });
  if (behavior < 60) items.push({ code: 'BEHAVIOR_DOMAIN_RISK', domain: 'BEHAVIOR', severity: 'MEDIUM' });
  if (mental < 60) items.push({ code: 'MENTAL_DOMAIN_RISK', domain: 'MENTAL', severity: 'MEDIUM' });
  return items;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
