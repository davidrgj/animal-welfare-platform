export type UserRole = 'PRODUCER' | 'VETERINARIAN' | 'ADMINISTRATOR';
export type Species = 'CATTLE' | 'GOAT' | 'SWINE';
export type Sex = 'MALE' | 'FEMALE';
export type AnimalPurpose = 'MEAT' | 'MILK' | 'DUAL_PURPOSE';
export type ReproductiveStatus = 'OPEN' | 'PREGNANT' | 'LACTATING' | 'BREEDING' | 'CASTRATED' | 'NOT_APPLICABLE';
export type WaterSource = 'WELL' | 'RIVER' | 'AQUEDUCT' | 'POND' | 'SPRING';
export type SwineStage = 'GESTATION' | 'FARROWING' | 'WEANING' | 'FATTENING' | 'BREEDING';
export type HornType = 'POLLED' | 'SCURRED' | 'HORNED';
export type BeddingStatus = 'EXCELLENT' | 'ADEQUATE' | 'POOR' | 'CRITICAL';
export type SocialInteraction = 'ADEQUATE' | 'LIMITED' | 'ISOLATED';
export type HandlingQuality = 'CALM' | 'ADEQUATE' | 'STRESSFUL';
export type LamenessScore = 'ABSENT' | 'MILD' | 'MODERATE' | 'SEVERE';
export type FeedType = 'GRAZING' | 'SUPPLEMENTED_GRAZING' | 'CONCENTRATE' | 'MIXED_RATION' | 'MILK';
export type EnvironmentScenario = 'NORMAL' | 'DROUGHT' | 'HEAT_WAVE' | 'IMPROVED_HOUSING' | 'FEED_RESTRICTION';
export type ComplianceLevel = 'COMPLIANT' | 'ATTENTION' | 'NON_COMPLIANT';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HeatStressLevel = 'NORMAL' | 'ALERT' | 'DANGER' | 'EMERGENCY';
export type WelfareDomain = 'NUTRITION' | 'ENVIRONMENT' | 'HEALTH' | 'BEHAVIOR' | 'MENTAL';
export type SimulationEventType = 'STAGE_TRANSITION' | 'HEALTH_INCIDENT' | 'ICA_CHECKPOINT' | 'WEIGHT_TARGET' | 'WELFARE_DROP';

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  documentId: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface Farm {
  id: string;
  ownerId: string;
  name: string;
  vaccinationRegistry: string;
  hectares: number;
  latitude: number;
  longitude: number;
  waterSource: WaterSource;
  soilType: string;
  department: string;
  municipality: string;
  createdAt: string;
}

export interface Animal {
  id: string;
  farmId: string;
  tagId: string;
  species: Species;
  breed: string;
  birthDate: string;
  sex: Sex;
  initialWeightKg: number;
  currentWeightKg: number;
  reproductiveStatus: ReproductiveStatus;
  purpose: AnimalPurpose;
  hornType: HornType | null;
  electricFenceAssociated: boolean | null;
  swineStage: SwineStage | null;
  environmentalEnrichment: boolean | null;
  createdAt: string;
}

export interface WelfareRecord {
  id: string;
  animalId: string;
  evaluatorId: string;
  recordedAt: string;
  bodyConditionScore: number;
  hydrationTimesPerDay: number;
  beddingStatus: BeddingStatus;
  shadePercentage: number;
  ambientTemperatureC: number;
  relativeHumidity: number;
  lameness: LamenessScore;
  skinLesions: boolean;
  vaccinationUpToDate: boolean;
  spacePerAnimalM2: number;
  socialInteraction: SocialInteraction;
  handlingQuality: HandlingQuality;
  notes: string;
  nutritionScore: number;
  environmentScore: number;
  healthScore: number;
  behaviorScore: number;
  mentalScore: number;
  welfareIndex: number;
  complianceLevel: ComplianceLevel;
  temperatureHumidityIndex: number;
}

export interface ComplianceFinding {
  id: string;
  welfareRecordId: string;
  code: string;
  domain: WelfareDomain;
  severity: AlertSeverity;
}

export interface WelfarePhoto {
  id: string;
  welfareRecordId: string;
  fileName: string;
  contentType: string;
  objectUrl: string;
  createdAt: string;
}

export interface AlertRow {
  id: string;
  farmId: string;
  animalId: string | null;
  severity: AlertSeverity;
  code: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface SimulationRun {
  id: string;
  farmId: string;
  animalId: string;
  createdById: string;
  name: string;
  feedType: FeedType;
  scenario: EnvironmentScenario;
  horizonDays: number;
  startDate: string;
  estimatedComplianceDate: string | null;
  estimatedTargetWeightDate: string | null;
  finalWeightKg: number;
  finalWelfareIndex: number;
  createdAt: string;
}

export interface SimulationSnapshot {
  id: string;
  simulationRunId: string;
  dayIndex: number;
  simulatedDate: string;
  weightKg: number;
  averageDailyGainKg: number;
  welfareIndex: number;
  productionStage: string;
  icaWeightTargetReached: boolean;
}

export interface SimulationEvent {
  id: string;
  simulationRunId: string;
  dayIndex: number;
  eventDate: string;
  eventType: SimulationEventType;
  fromStage: string | null;
  toStage: string | null;
  relatedValue: number | null;
}
