import { AlertRow, Animal, ComplianceFinding, Farm, Profile, SimulationEvent, SimulationRun, SimulationSnapshot, UserRole, WelfarePhoto, WelfareRecord } from './models';
import { supabase } from './supabase.client';

const PHOTOS = 'welfare-photos';

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

function text(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value);
}

function num(value: unknown): number {
  return Number(value);
}

export function asProfile(row: Record<string, unknown>): Profile {
  return {
    id: text(row['id']),
    fullName: text(row['full_name']),
    email: text(row['email']),
    documentId: text(row['document_id']),
    phone: text(row['phone']),
    role: row['role'] as UserRole,
    createdAt: text(row['created_at'])
  };
}

function asFarm(row: Record<string, unknown>): Farm {
  return {
    id: text(row['id']),
    ownerId: text(row['owner_id']),
    name: text(row['name']),
    vaccinationRegistry: text(row['vaccination_registry']),
    hectares: num(row['hectares']),
    latitude: num(row['latitude']),
    longitude: num(row['longitude']),
    waterSource: row['water_source'] as Farm['waterSource'],
    soilType: text(row['soil_type']),
    department: text(row['department']),
    municipality: text(row['municipality']),
    createdAt: text(row['created_at'])
  };
}

function farmRow(farm: Farm): Record<string, unknown> {
  return {
    id: farm.id,
    owner_id: farm.ownerId,
    name: farm.name,
    vaccination_registry: farm.vaccinationRegistry,
    hectares: farm.hectares,
    latitude: farm.latitude,
    longitude: farm.longitude,
    water_source: farm.waterSource,
    soil_type: farm.soilType,
    department: farm.department,
    municipality: farm.municipality,
    created_at: farm.createdAt
  };
}

function asAnimal(row: Record<string, unknown>): Animal {
  return {
    id: text(row['id']),
    farmId: text(row['farm_id']),
    tagId: text(row['tag_id']),
    species: row['species'] as Animal['species'],
    breed: text(row['breed']),
    birthDate: text(row['birth_date']).slice(0, 10),
    sex: row['sex'] as Animal['sex'],
    initialWeightKg: num(row['initial_weight_kg']),
    currentWeightKg: num(row['current_weight_kg']),
    reproductiveStatus: row['reproductive_status'] as Animal['reproductiveStatus'],
    purpose: row['purpose'] as Animal['purpose'],
    hornType: (row['horn_type'] as Animal['hornType']) ?? null,
    electricFenceAssociated: row['electric_fence_associated'] == null ? null : Boolean(row['electric_fence_associated']),
    swineStage: (row['swine_stage'] as Animal['swineStage']) ?? null,
    environmentalEnrichment: row['environmental_enrichment'] == null ? null : Boolean(row['environmental_enrichment']),
    createdAt: text(row['created_at'])
  };
}

function animalRow(animal: Animal): Record<string, unknown> {
  return {
    id: animal.id,
    farm_id: animal.farmId,
    tag_id: animal.tagId,
    species: animal.species,
    breed: animal.breed,
    birth_date: animal.birthDate,
    sex: animal.sex,
    initial_weight_kg: animal.initialWeightKg,
    current_weight_kg: animal.currentWeightKg,
    reproductive_status: animal.reproductiveStatus,
    purpose: animal.purpose,
    horn_type: animal.hornType,
    electric_fence_associated: animal.electricFenceAssociated,
    swine_stage: animal.swineStage,
    environmental_enrichment: animal.environmentalEnrichment,
    created_at: animal.createdAt
  };
}

function asRecord(row: Record<string, unknown>): WelfareRecord {
  return {
    id: text(row['id']),
    animalId: text(row['animal_id']),
    evaluatorId: text(row['evaluator_id']),
    recordedAt: text(row['recorded_at']),
    bodyConditionScore: num(row['body_condition_score']),
    hydrationTimesPerDay: num(row['hydration_times_per_day']),
    beddingStatus: row['bedding_status'] as WelfareRecord['beddingStatus'],
    shadePercentage: num(row['shade_percentage']),
    ambientTemperatureC: num(row['ambient_temperature_c']),
    relativeHumidity: num(row['relative_humidity']),
    lameness: row['lameness'] as WelfareRecord['lameness'],
    skinLesions: Boolean(row['skin_lesions']),
    vaccinationUpToDate: Boolean(row['vaccination_up_to_date']),
    spacePerAnimalM2: num(row['space_per_animal_m2']),
    socialInteraction: row['social_interaction'] as WelfareRecord['socialInteraction'],
    handlingQuality: row['handling_quality'] as WelfareRecord['handlingQuality'],
    notes: text(row['notes']),
    nutritionScore: num(row['nutrition_score']),
    environmentScore: num(row['environment_score']),
    healthScore: num(row['health_score']),
    behaviorScore: num(row['behavior_score']),
    mentalScore: num(row['mental_score']),
    welfareIndex: num(row['welfare_index']),
    complianceLevel: row['compliance_level'] as WelfareRecord['complianceLevel'],
    temperatureHumidityIndex: num(row['temperature_humidity_index'])
  };
}

function recordRow(record: WelfareRecord): Record<string, unknown> {
  return {
    id: record.id,
    animal_id: record.animalId,
    evaluator_id: record.evaluatorId,
    recorded_at: record.recordedAt,
    body_condition_score: record.bodyConditionScore,
    hydration_times_per_day: record.hydrationTimesPerDay,
    bedding_status: record.beddingStatus,
    shade_percentage: record.shadePercentage,
    ambient_temperature_c: record.ambientTemperatureC,
    relative_humidity: record.relativeHumidity,
    lameness: record.lameness,
    skin_lesions: record.skinLesions,
    vaccination_up_to_date: record.vaccinationUpToDate,
    space_per_animal_m2: record.spacePerAnimalM2,
    social_interaction: record.socialInteraction,
    handling_quality: record.handlingQuality,
    notes: record.notes,
    nutrition_score: record.nutritionScore,
    environment_score: record.environmentScore,
    health_score: record.healthScore,
    behavior_score: record.behaviorScore,
    mental_score: record.mentalScore,
    welfare_index: record.welfareIndex,
    compliance_level: record.complianceLevel,
    temperature_humidity_index: record.temperatureHumidityIndex
  };
}

function asFinding(row: Record<string, unknown>): ComplianceFinding {
  return {
    id: text(row['id']),
    welfareRecordId: text(row['welfare_record_id']),
    code: text(row['code']),
    domain: row['domain'] as ComplianceFinding['domain'],
    severity: row['severity'] as ComplianceFinding['severity']
  };
}

function photoUrl(path: string): string {
  return supabase().storage.from(PHOTOS).getPublicUrl(path).data.publicUrl;
}

function asPhoto(row: Record<string, unknown>): WelfarePhoto {
  const storagePath = text(row['storage_path']);
  return {
    id: text(row['id']),
    welfareRecordId: text(row['welfare_record_id']),
    fileName: text(row['file_name']),
    contentType: text(row['content_type']),
    objectUrl: photoUrl(storagePath),
    createdAt: text(row['created_at'])
  };
}

function asAlert(row: Record<string, unknown>): AlertRow {
  return {
    id: text(row['id']),
    farmId: text(row['farm_id']),
    animalId: row['animal_id'] == null ? null : text(row['animal_id']),
    severity: row['severity'] as AlertRow['severity'],
    code: text(row['code']),
    acknowledged: Boolean(row['acknowledged']),
    createdAt: text(row['created_at'])
  };
}

function asRun(row: Record<string, unknown>): SimulationRun {
  return {
    id: text(row['id']),
    farmId: text(row['farm_id']),
    animalId: text(row['animal_id']),
    createdById: text(row['created_by_id']),
    name: text(row['name']),
    feedType: row['feed_type'] as SimulationRun['feedType'],
    scenario: row['scenario'] as SimulationRun['scenario'],
    horizonDays: num(row['horizon_days']),
    startDate: text(row['start_date']).slice(0, 10),
    estimatedComplianceDate: row['estimated_compliance_date'] == null ? null : text(row['estimated_compliance_date']).slice(0, 10),
    estimatedTargetWeightDate: row['estimated_target_weight_date'] == null ? null : text(row['estimated_target_weight_date']).slice(0, 10),
    finalWeightKg: num(row['final_weight_kg']),
    finalWelfareIndex: num(row['final_welfare_index']),
    createdAt: text(row['created_at'])
  };
}

function asSnapshot(row: Record<string, unknown>): SimulationSnapshot {
  return {
    id: text(row['id']),
    simulationRunId: text(row['simulation_run_id']),
    dayIndex: num(row['day_index']),
    simulatedDate: text(row['simulated_date']).slice(0, 10),
    weightKg: num(row['weight_kg']),
    averageDailyGainKg: num(row['average_daily_gain_kg']),
    welfareIndex: num(row['welfare_index']),
    productionStage: text(row['production_stage']),
    icaWeightTargetReached: Boolean(row['ica_weight_target_reached'])
  };
}

function asEvent(row: Record<string, unknown>): SimulationEvent {
  return {
    id: text(row['id']),
    simulationRunId: text(row['simulation_run_id']),
    dayIndex: num(row['day_index']),
    eventDate: text(row['event_date']).slice(0, 10),
    eventType: row['event_type'] as SimulationEvent['eventType'],
    fromStage: row['from_stage'] == null ? null : text(row['from_stage']),
    toStage: row['to_stage'] == null ? null : text(row['to_stage']),
    relatedValue: row['related_value'] == null ? null : num(row['related_value'])
  };
}

async function removePhotoFiles(recordIds: string[]): Promise<void> {
  if (!recordIds.length) return;
  const { data, error } = await supabase().from('welfare_photos').select('storage_path').in('welfare_record_id', recordIds);
  fail(error);
  const paths = (data ?? []).map((row) => text((row as Record<string, unknown>)['storage_path'])).filter(Boolean);
  if (paths.length) {
    const { error: storageError } = await supabase().storage.from(PHOTOS).remove(paths);
    fail(storageError);
  }
}

export async function loadProfile(id: string): Promise<Profile> {
  const { data, error } = await supabase().from('profiles').select('*').eq('id', id).single();
  fail(error);
  if (!data) throw new Error('Profile not found');
  return asProfile(data as Record<string, unknown>);
}

export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase().from('profiles').select('*').order('full_name');
  fail(error);
  return (data ?? []).map((row) => asProfile(row as Record<string, unknown>));
}

export async function updateProfile(profile: Profile): Promise<Profile> {
  const { data, error } = await supabase().from('profiles').update({
    full_name: profile.fullName,
    document_id: profile.documentId,
    phone: profile.phone,
    role: profile.role
  }).eq('id', profile.id).select('*').maybeSingle();
  fail(error);
  if (!data) {
    throw new Error(
      'Profile update blocked by RLS. Run supabase/admin-policies.sql in the Supabase SQL editor.'
    );
  }
  return asProfile(data as Record<string, unknown>);
}

export async function createAuthUser(input: {
  fullName: string;
  email: string;
  password: string;
  documentId: string;
  phone: string;
  role: UserRole;
}): Promise<Profile> {
  const { data: sessionData } = await supabase().auth.getSession();
  const adminSession = sessionData.session;
  if (!adminSession) throw new Error('Authentication required');

  const { data, error } = await supabase().auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        document_id: input.documentId,
        phone: input.phone,
        role: input.role
      }
    }
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('User was not created');

  const { error: restoreError } = await supabase().auth.setSession({
    access_token: adminSession.access_token,
    refresh_token: adminSession.refresh_token
  });
  fail(restoreError);

  const created = await loadProfile(data.user.id);
  if (created.role !== input.role || created.fullName !== input.fullName) {
    return updateProfile({
      ...created,
      fullName: input.fullName,
      documentId: input.documentId,
      phone: input.phone,
      role: input.role
    });
  }
  return created;
}

export async function listFarms(): Promise<Farm[]> {
  const { data, error } = await supabase().from('farms').select('*').order('name');
  fail(error);
  return (data ?? []).map((row) => asFarm(row as Record<string, unknown>));
}

export async function getFarm(id: string): Promise<Farm | undefined> {
  const { data, error } = await supabase().from('farms').select('*').eq('id', id).maybeSingle();
  fail(error);
  return data ? asFarm(data as Record<string, unknown>) : undefined;
}

export async function upsertFarm(farm: Farm): Promise<Farm> {
  const { data, error } = await supabase().from('farms').upsert(farmRow(farm)).select('*').single();
  fail(error);
  return asFarm(data as Record<string, unknown>);
}

export async function removeFarm(id: string): Promise<void> {
  const { data: animals, error: animalError } = await supabase().from('animals').select('id').eq('farm_id', id);
  fail(animalError);
  const animalIds = (animals ?? []).map((row) => text((row as Record<string, unknown>)['id']));
  if (animalIds.length) {
    const { data: records, error: recordError } = await supabase().from('welfare_records').select('id').in('animal_id', animalIds);
    fail(recordError);
    await removePhotoFiles((records ?? []).map((row) => text((row as Record<string, unknown>)['id'])));
  }
  const { error } = await supabase().from('farms').delete().eq('id', id);
  fail(error);
}

export async function listAnimals(): Promise<Animal[]> {
  const { data, error } = await supabase().from('animals').select('*').order('tag_id');
  fail(error);
  return (data ?? []).map((row) => asAnimal(row as Record<string, unknown>));
}

export async function getAnimal(id: string): Promise<Animal | undefined> {
  const { data, error } = await supabase().from('animals').select('*').eq('id', id).maybeSingle();
  fail(error);
  return data ? asAnimal(data as Record<string, unknown>) : undefined;
}

export async function upsertAnimal(animal: Animal): Promise<Animal> {
  const { data, error } = await supabase().from('animals').upsert(animalRow(animal)).select('*').single();
  if (error?.code === '23505') throw new Error('Tag already exists on this farm');
  fail(error);
  return asAnimal(data as Record<string, unknown>);
}

export async function removeAnimal(id: string): Promise<void> {
  const { data: records, error: recordError } = await supabase().from('welfare_records').select('id').eq('animal_id', id);
  fail(recordError);
  await removePhotoFiles((records ?? []).map((row) => text((row as Record<string, unknown>)['id'])));
  const { error } = await supabase().from('animals').delete().eq('id', id);
  fail(error);
}

export async function listRecords(): Promise<WelfareRecord[]> {
  const { data, error } = await supabase().from('welfare_records').select('*');
  fail(error);
  return (data ?? []).map((row) => asRecord(row as Record<string, unknown>));
}

export async function listRecordsForAnimal(animalId: string): Promise<WelfareRecord[]> {
  const { data, error } = await supabase().from('welfare_records').select('*').eq('animal_id', animalId).order('recorded_at', { ascending: false });
  fail(error);
  return (data ?? []).map((row) => asRecord(row as Record<string, unknown>));
}

export async function getRecord(id: string): Promise<WelfareRecord | undefined> {
  const { data, error } = await supabase().from('welfare_records').select('*').eq('id', id).maybeSingle();
  fail(error);
  return data ? asRecord(data as Record<string, unknown>) : undefined;
}

export async function insertRecord(
  record: WelfareRecord,
  findings: Pick<ComplianceFinding, 'code' | 'domain' | 'severity'>[]
): Promise<void> {
  const { error } = await supabase().from('welfare_records').insert(recordRow(record));
  fail(error);
  if (!findings.length) return;
  const { error: findingError } = await supabase().from('compliance_findings').insert(
    findings.map((finding) => ({
      welfare_record_id: record.id,
      code: finding.code,
      domain: finding.domain,
      severity: finding.severity
    }))
  );
  fail(findingError);
}

export async function listFindings(recordId: string): Promise<ComplianceFinding[]> {
  const { data, error } = await supabase().from('compliance_findings').select('*').eq('welfare_record_id', recordId);
  fail(error);
  return (data ?? []).map((row) => asFinding(row as Record<string, unknown>));
}

export async function listPhotos(recordId: string): Promise<WelfarePhoto[]> {
  const { data, error } = await supabase().from('welfare_photos').select('*').eq('welfare_record_id', recordId).order('created_at');
  fail(error);
  return (data ?? []).map((row) => asPhoto(row as Record<string, unknown>));
}

export async function insertPhoto(photo: WelfarePhoto, file: File, storagePath: string): Promise<WelfarePhoto> {
  const { error: uploadError } = await supabase().storage.from(PHOTOS).upload(storagePath, file, {
    contentType: file.type,
    upsert: true
  });
  fail(uploadError);
  const { data, error } = await supabase().from('welfare_photos').insert({
    id: photo.id,
    welfare_record_id: photo.welfareRecordId,
    file_name: photo.fileName,
    content_type: photo.contentType,
    storage_path: storagePath,
    created_at: photo.createdAt
  }).select('*').single();
  fail(error);
  return asPhoto(data as Record<string, unknown>);
}

export async function listAlerts(): Promise<AlertRow[]> {
  const { data, error } = await supabase().from('alerts').select('*').order('created_at', { ascending: false });
  fail(error);
  return (data ?? []).map((row) => asAlert(row as Record<string, unknown>));
}

export async function getAlert(id: string): Promise<AlertRow | undefined> {
  const { data, error } = await supabase().from('alerts').select('*').eq('id', id).maybeSingle();
  fail(error);
  return data ? asAlert(data as Record<string, unknown>) : undefined;
}

export async function acknowledgeAlert(id: string): Promise<void> {
  const { error } = await supabase().from('alerts').update({ acknowledged: true }).eq('id', id);
  fail(error);
}

export async function openAlertsForAnimal(animalId: string): Promise<AlertRow[]> {
  const { data, error } = await supabase().from('alerts').select('*').eq('animal_id', animalId).eq('acknowledged', false);
  fail(error);
  return (data ?? []).map((row) => asAlert(row as Record<string, unknown>));
}

export async function insertAlert(alert: AlertRow): Promise<void> {
  const { error } = await supabase().from('alerts').insert({
    id: alert.id,
    farm_id: alert.farmId,
    animal_id: alert.animalId,
    severity: alert.severity,
    code: alert.code,
    acknowledged: alert.acknowledged,
    created_at: alert.createdAt
  });
  fail(error);
}

export async function listRuns(): Promise<SimulationRun[]> {
  const { data, error } = await supabase().from('simulation_runs').select('*').order('created_at', { ascending: false });
  fail(error);
  return (data ?? []).map((row) => asRun(row as Record<string, unknown>));
}

export async function getRun(id: string): Promise<SimulationRun | undefined> {
  const { data, error } = await supabase().from('simulation_runs').select('*').eq('id', id).maybeSingle();
  fail(error);
  return data ? asRun(data as Record<string, unknown>) : undefined;
}

export async function listSnapshots(runId: string): Promise<SimulationSnapshot[]> {
  const { data, error } = await supabase().from('simulation_snapshots').select('*').eq('simulation_run_id', runId).order('day_index');
  fail(error);
  return (data ?? []).map((row) => asSnapshot(row as Record<string, unknown>));
}

export async function listEvents(runId: string): Promise<SimulationEvent[]> {
  const { data, error } = await supabase().from('simulation_events').select('*').eq('simulation_run_id', runId).order('day_index');
  fail(error);
  return (data ?? []).map((row) => asEvent(row as Record<string, unknown>));
}

export async function insertSimulation(
  run: SimulationRun,
  snapshots: SimulationSnapshot[],
  events: SimulationEvent[]
): Promise<void> {
  const { error } = await supabase().from('simulation_runs').insert({
    id: run.id,
    farm_id: run.farmId,
    animal_id: run.animalId,
    created_by_id: run.createdById,
    name: run.name,
    feed_type: run.feedType,
    scenario: run.scenario,
    horizon_days: run.horizonDays,
    start_date: run.startDate,
    estimated_compliance_date: run.estimatedComplianceDate,
    estimated_target_weight_date: run.estimatedTargetWeightDate,
    final_weight_kg: run.finalWeightKg,
    final_welfare_index: run.finalWelfareIndex,
    created_at: run.createdAt
  });
  fail(error);
  if (snapshots.length) {
    const { error: snapshotError } = await supabase().from('simulation_snapshots').insert(
      snapshots.map((snapshot) => ({
        id: snapshot.id,
        simulation_run_id: snapshot.simulationRunId,
        day_index: snapshot.dayIndex,
        simulated_date: snapshot.simulatedDate,
        weight_kg: snapshot.weightKg,
        average_daily_gain_kg: snapshot.averageDailyGainKg,
        welfare_index: snapshot.welfareIndex,
        production_stage: snapshot.productionStage,
        ica_weight_target_reached: snapshot.icaWeightTargetReached
      }))
    );
    fail(snapshotError);
  }
  if (events.length) {
    const { error: eventError } = await supabase().from('simulation_events').insert(
      events.map((event) => ({
        id: event.id,
        simulation_run_id: event.simulationRunId,
        day_index: event.dayIndex,
        event_date: event.eventDate,
        event_type: event.eventType,
        from_stage: event.fromStage,
        to_stage: event.toStage,
        related_value: event.relatedValue
      }))
    );
    fail(eventError);
  }
}
