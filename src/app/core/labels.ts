import { AlertSeverity, AnimalPurpose, BeddingStatus, ComplianceLevel, EnvironmentScenario, FeedType, HandlingQuality, HeatStressLevel, HornType, LamenessScore, ReproductiveStatus, Sex, SimulationEventType, SocialInteraction, Species, SwineStage, UserRole, WaterSource, WelfareDomain } from './models';

export const SPECIES_LABEL: Record<Species, string> = {
  CATTLE: 'Bovino',
  GOAT: 'Caprino',
  SWINE: 'Porcino'
};

export const SEX_LABEL: Record<Sex, string> = { MALE: 'Macho', FEMALE: 'Hembra' };

export const PURPOSE_LABEL: Record<AnimalPurpose, string> = {
  MEAT: 'Carne',
  MILK: 'Leche',
  DUAL_PURPOSE: 'Doble propósito'
};

export const REPRO_LABEL: Record<ReproductiveStatus, string> = {
  OPEN: 'Vacío',
  PREGNANT: 'Gestante',
  LACTATING: 'Lactante',
  BREEDING: 'Reproductor',
  CASTRATED: 'Castrado',
  NOT_APPLICABLE: 'No aplica'
};

export const WATER_LABEL: Record<WaterSource, string> = {
  WELL: 'Pozo',
  RIVER: 'Río',
  AQUEDUCT: 'Acueducto',
  POND: 'Jagüey',
  SPRING: 'Nacimiento'
};

export const SWINE_LABEL: Record<SwineStage, string> = {
  GESTATION: 'Gestación',
  FARROWING: 'Parideras',
  WEANING: 'Destete',
  FATTENING: 'Ceba',
  BREEDING: 'Reproductor'
};

export const HORN_LABEL: Record<HornType, string> = {
  POLLED: 'Mocho',
  SCURRED: 'Pedernal',
  HORNED: 'Con cuernos'
};

export const BEDDING_LABEL: Record<BeddingStatus, string> = {
  EXCELLENT: 'Excelente',
  ADEQUATE: 'Adecuado',
  POOR: 'Deficiente',
  CRITICAL: 'Crítico'
};

export const SOCIAL_LABEL: Record<SocialInteraction, string> = {
  ADEQUATE: 'Adecuada',
  LIMITED: 'Limitada',
  ISOLATED: 'Aislado'
};

export const HANDLING_LABEL: Record<HandlingQuality, string> = {
  CALM: 'Calmo',
  ADEQUATE: 'Adecuado',
  STRESSFUL: 'Estresante'
};

export const LAMENESS_LABEL: Record<LamenessScore, string> = {
  ABSENT: 'Ausente',
  MILD: 'Leve',
  MODERATE: 'Moderada',
  SEVERE: 'Severa'
};

export const FEED_LABEL: Record<FeedType, string> = {
  GRAZING: 'Pastoreo',
  SUPPLEMENTED_GRAZING: 'Pastoreo suplementado',
  CONCENTRATE: 'Concentrado',
  MIXED_RATION: 'Ración mixta',
  MILK: 'Lactancia'
};

export const SCENARIO_LABEL: Record<EnvironmentScenario, string> = {
  NORMAL: 'Condición normal',
  DROUGHT: 'Sequía',
  HEAT_WAVE: 'Ola de calor',
  IMPROVED_HOUSING: 'Mejora de instalaciones',
  FEED_RESTRICTION: 'Restricción de alimento'
};

export const COMPLIANCE_LABEL: Record<ComplianceLevel, string> = {
  COMPLIANT: 'Cumple',
  ATTENTION: 'Requiere atención',
  NON_COMPLIANT: 'No cumple'
};

export const ROLE_LABEL: Record<UserRole, string> = {
  PRODUCER: 'Productor',
  VETERINARIAN: 'Veterinario',
  ADMINISTRATOR: 'Administrador'
};

export const HEAT_LABEL: Record<HeatStressLevel, string> = {
  NORMAL: 'Sin estrés',
  ALERT: 'Alerta',
  DANGER: 'Peligro',
  EMERGENCY: 'Emergencia'
};

export const DOMAIN_LABEL: Record<WelfareDomain, string> = {
  NUTRITION: 'Nutrición',
  ENVIRONMENT: 'Entorno',
  HEALTH: 'Salud',
  BEHAVIOR: 'Comportamiento',
  MENTAL: 'Estado mental'
};

export const EVENT_LABEL: Record<SimulationEventType, string> = {
  STAGE_TRANSITION: 'Cambio de etapa',
  HEALTH_INCIDENT: 'Incidente sanitario',
  ICA_CHECKPOINT: 'Hito ICA',
  WEIGHT_TARGET: 'Peso objetivo',
  WELFARE_DROP: 'Caída de bienestar'
};

export const STAGE_LABEL: Record<string, string> = {
  CALF: 'Ternero',
  YEARLING: 'Novillo',
  ADULT: 'Adulto',
  KID: 'Cabrito',
  GESTATION: 'Gestación',
  FARROWING: 'Parideras',
  WEANING: 'Destete',
  FATTENING: 'Ceba',
  BREEDING: 'Reproductor'
};

export const FINDING_LABEL: Record<string, string> = {
  BCS_OUT_OF_RANGE: 'Condición corporal fuera de rango',
  LOW_HYDRATION: 'Hidratación insuficiente',
  POOR_RESTING_SURFACE: 'Superficie de descanso deficiente',
  INSUFFICIENT_SHADE: 'Sombra insuficiente',
  HEAT_STRESS: 'Estrés calórico',
  LAMENESS: 'Cojera',
  SKIN_LESIONS: 'Lesiones en piel',
  VACCINATION_OVERDUE: 'Vacunación vencida',
  SPACE_BELOW_MINIMUM: 'Espacio por debajo del mínimo ICA',
  MISSING_ENRICHMENT: 'Sin enriquecimiento ambiental',
  STRESSFUL_HANDLING: 'Manejo estresante',
  NUTRITION_DOMAIN_RISK: 'Riesgo en nutrición',
  ENVIRONMENT_DOMAIN_RISK: 'Riesgo en entorno',
  HEALTH_DOMAIN_RISK: 'Riesgo en salud',
  BEHAVIOR_DOMAIN_RISK: 'Riesgo en comportamiento',
  MENTAL_DOMAIN_RISK: 'Riesgo en estado mental',
  LOW_WELFARE_INDEX: 'Índice de bienestar bajo'
};

export const ALERT_HINT: Record<string, string> = {
  HEAT_STRESS: 'El índice temperatura-humedad supera el umbral de la especie.',
  VACCINATION_OVERDUE: 'El protocolo de vacunación no está al día.',
  SPACE_BELOW_MINIMUM: 'La densidad de alojamiento incumple el manual ICA.',
  LOW_WELFARE_INDEX: 'El índice compuesto quedó por debajo de 60.'
};

export function speciesMark(species: Species): string {
  return `species-mark species-mark-${species.toLowerCase()}`;
}

export function ibaFill(level: ComplianceLevel | null | undefined): string {
  if (level === 'NON_COMPLIANT') return 'iba-fill iba-fill-bad';
  if (level === 'ATTENTION') return 'iba-fill iba-fill-warn';
  return 'iba-fill iba-fill-ok';
}

export function complianceClass(level: ComplianceLevel | null | undefined): string {
  if (level === 'COMPLIANT') return 'tag tag-ok';
  if (level === 'ATTENTION') return 'tag tag-warn';
  if (level === 'NON_COMPLIANT') return 'tag tag-bad';
  return 'tag';
}

export function severityClass(severity: AlertSeverity): string {
  if (severity === 'LOW' || severity === 'MEDIUM') return 'tag tag-warn';
  return 'tag tag-bad';
}

export const OPTIONS = {
  species: Object.entries(SPECIES_LABEL),
  sex: Object.entries(SEX_LABEL),
  purpose: Object.entries(PURPOSE_LABEL),
  repro: Object.entries(REPRO_LABEL),
  water: Object.entries(WATER_LABEL),
  swine: Object.entries(SWINE_LABEL),
  horn: Object.entries(HORN_LABEL),
  bedding: Object.entries(BEDDING_LABEL),
  social: Object.entries(SOCIAL_LABEL),
  handling: Object.entries(HANDLING_LABEL),
  lameness: Object.entries(LAMENESS_LABEL),
  feed: Object.entries(FEED_LABEL),
  scenario: Object.entries(SCENARIO_LABEL),
  role: Object.entries(ROLE_LABEL)
};
