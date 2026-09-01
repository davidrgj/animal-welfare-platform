-- Run after schema.sql in the SQL editor.
-- Authentication > Providers > Email: disable "Confirm email" so demo users can sign in without mail.

create extension if not exists pgcrypto;

do $$
declare
  producer_id uuid := '11111111-1111-4111-a111-111111111111';
  vet_id uuid := '22222222-2222-4222-a222-222222222222';
  admin_id uuid := '33333333-3333-4333-a333-333333333333';
  highland_id uuid := '44444444-4444-4444-a444-444444444444';
  valley_id uuid := '55555555-5555-4555-a555-555555555555';
  lucero_id uuid := '66666666-6666-4666-a666-111111111111';
  nimbus_id uuid := '66666666-6666-4666-a666-222222222222';
  luna_id uuid := '66666666-6666-4666-a666-333333333333';
  ceiba_id uuid := '66666666-6666-4666-a666-444444444444';
  bruma_id uuid := '66666666-6666-4666-a666-555555555555';
  lucero_rec uuid := '77777777-7777-4777-a777-111111111111';
  nimbus_rec uuid := '77777777-7777-4777-a777-222222222222';
  luna_rec uuid := '77777777-7777-4777-a777-333333333333';
  ceiba_rec uuid := '77777777-7777-4777-a777-444444444444';
  bruma_rec uuid := '77777777-7777-4777-a777-555555555555';
begin
  delete from auth.identities where user_id in (producer_id, vet_id, admin_id);
  delete from auth.users where id in (producer_id, vet_id, admin_id);

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values
  (
    '00000000-0000-0000-0000-000000000000', producer_id, 'authenticated', 'authenticated',
    'producer@farm.local', crypt('Producer123!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Camila Restrepo","document_id":"1029384756","phone":"3001234567","role":"PRODUCER"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', vet_id, 'authenticated', 'authenticated',
    'vet@farm.local', crypt('Vet123!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Andres Molina","document_id":"TP-44120","phone":"3109876543","role":"VETERINARIAN"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
    'admin@farm.local', crypt('Admin123!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"David Ramirez","document_id":"79800112","phone":"3205558899","role":"ADMINISTRATOR"}',
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  values
    (gen_random_uuid(), producer_id, jsonb_build_object('sub', producer_id::text, 'email', 'producer@farm.local'), 'email', producer_id::text, now(), now(), now()),
    (gen_random_uuid(), vet_id, jsonb_build_object('sub', vet_id::text, 'email', 'vet@farm.local'), 'email', vet_id::text, now(), now(), now()),
    (gen_random_uuid(), admin_id, jsonb_build_object('sub', admin_id::text, 'email', 'admin@farm.local'), 'email', admin_id::text, now(), now(), now());

  insert into farms (id, owner_id, name, vaccination_registry, hectares, latitude, longitude, water_source, soil_type, department, municipality)
  values
    (highland_id, producer_id, 'El Recuerdo', 'RUV-CUN-2045', 42.5, 4.711, -74.0721, 'SPRING', 'Andisol', 'Cundinamarca', 'Zipaquira'),
    (valley_id, producer_id, 'La Esperanza', 'RUV-TOL-1188', 18, 4.4389, -75.2322, 'RIVER', 'Inceptisol', 'Tolima', 'Ibague');

  insert into animals (id, farm_id, tag_id, species, breed, birth_date, sex, initial_weight_kg, current_weight_kg, reproductive_status, purpose, horn_type, electric_fence_associated, swine_stage, environmental_enrichment)
  values
    (lucero_id, highland_id, 'BOV-102', 'CATTLE', 'Brahman', current_date - 540, 'FEMALE', 280, 318, 'OPEN', 'DUAL_PURPOSE', null, true, null, null),
    (nimbus_id, highland_id, 'BOV-087', 'CATTLE', 'Holstein', current_date - 900, 'FEMALE', 390, 412, 'LACTATING', 'MILK', null, true, null, null),
    (luna_id, highland_id, 'CAP-014', 'GOAT', 'Saanen', current_date - 420, 'FEMALE', 28, 34, 'PREGNANT', 'MILK', 'POLLED', null, null, null),
    (ceiba_id, valley_id, 'POR-331', 'SWINE', 'Landrace', current_date - 150, 'MALE', 42, 78, 'CASTRATED', 'MEAT', null, null, 'FATTENING', true),
    (bruma_id, valley_id, 'POR-218', 'SWINE', 'Pietrain', current_date - 240, 'FEMALE', 55, 96, 'PREGNANT', 'MEAT', null, null, 'GESTATION', false);

  insert into welfare_records (
    id, animal_id, evaluator_id, recorded_at, body_condition_score, hydration_times_per_day, bedding_status,
    shade_percentage, ambient_temperature_c, relative_humidity, lameness, skin_lesions, vaccination_up_to_date,
    space_per_animal_m2, social_interaction, handling_quality, notes, nutrition_score, environment_score,
    health_score, behavior_score, mental_score, welfare_index, compliance_level, temperature_humidity_index
  ) values
    (lucero_rec, lucero_id, producer_id, now() - interval '12 days', 3, 3, 'ADEQUATE', 55, 24, 68, 'ABSENT', false, true, 6, 'ADEQUATE', 'CALM', '', 100, 76.7, 100, 100, 100, 95.3, 'COMPLIANT', 72.2),
    (nimbus_rec, nimbus_id, producer_id, now() - interval '4 days', 2, 2, 'POOR', 20, 31.5, 82, 'MILD', true, false, 3.8, 'LIMITED', 'STRESSFUL', 'Heat and low shade during afternoon grazing', 70, 33.3, 31.7, 69.7, 20, 45.5, 'NON_COMPLIANT', 85.7),
    (luna_rec, luna_id, producer_id, now() - interval '7 days', 3, 4, 'EXCELLENT', 70, 22, 60, 'ABSENT', false, true, 2.2, 'ADEQUATE', 'CALM', '', 100, 90, 100, 100, 100, 98, 'COMPLIANT', 68.6),
    (ceiba_rec, ceiba_id, producer_id, now() - interval '2 days', 3, 3, 'ADEQUATE', 40, 26, 75, 'ABSENT', false, true, 1.1, 'ADEQUATE', 'ADEQUATE', '', 100, 61, 100, 100, 70, 87.7, 'COMPLIANT', 75.9),
    (bruma_rec, bruma_id, producer_id, now() - interval '1 day', 2, 1, 'CRITICAL', 15, 33, 88, 'MODERATE', true, false, 1.2, 'ISOLATED', 'STRESSFUL', 'Crowded gestation pen without enrichment', 55, 14, 21.7, 37.5, 20, 30.6, 'NON_COMPLIANT', 89.2);

  insert into compliance_findings (welfare_record_id, code, domain, severity) values
    (nimbus_rec, 'BCS_OUT_OF_RANGE', 'NUTRITION', 'HIGH'),
    (nimbus_rec, 'POOR_RESTING_SURFACE', 'ENVIRONMENT', 'MEDIUM'),
    (nimbus_rec, 'INSUFFICIENT_SHADE', 'ENVIRONMENT', 'MEDIUM'),
    (nimbus_rec, 'HEAT_STRESS', 'ENVIRONMENT', 'CRITICAL'),
    (nimbus_rec, 'SKIN_LESIONS', 'HEALTH', 'MEDIUM'),
    (nimbus_rec, 'VACCINATION_OVERDUE', 'HEALTH', 'HIGH'),
    (nimbus_rec, 'SPACE_BELOW_MINIMUM', 'BEHAVIOR', 'HIGH'),
    (nimbus_rec, 'STRESSFUL_HANDLING', 'MENTAL', 'HIGH'),
    (nimbus_rec, 'ENVIRONMENT_DOMAIN_RISK', 'ENVIRONMENT', 'MEDIUM'),
    (nimbus_rec, 'HEALTH_DOMAIN_RISK', 'HEALTH', 'HIGH'),
    (nimbus_rec, 'MENTAL_DOMAIN_RISK', 'MENTAL', 'MEDIUM'),
    (bruma_rec, 'BCS_OUT_OF_RANGE', 'NUTRITION', 'HIGH'),
    (bruma_rec, 'LOW_HYDRATION', 'NUTRITION', 'HIGH'),
    (bruma_rec, 'POOR_RESTING_SURFACE', 'ENVIRONMENT', 'MEDIUM'),
    (bruma_rec, 'INSUFFICIENT_SHADE', 'ENVIRONMENT', 'MEDIUM'),
    (bruma_rec, 'HEAT_STRESS', 'ENVIRONMENT', 'CRITICAL'),
    (bruma_rec, 'LAMENESS', 'HEALTH', 'HIGH'),
    (bruma_rec, 'SKIN_LESIONS', 'HEALTH', 'MEDIUM'),
    (bruma_rec, 'VACCINATION_OVERDUE', 'HEALTH', 'HIGH'),
    (bruma_rec, 'SPACE_BELOW_MINIMUM', 'BEHAVIOR', 'HIGH'),
    (bruma_rec, 'MISSING_ENRICHMENT', 'BEHAVIOR', 'MEDIUM'),
    (bruma_rec, 'STRESSFUL_HANDLING', 'MENTAL', 'HIGH'),
    (bruma_rec, 'NUTRITION_DOMAIN_RISK', 'NUTRITION', 'MEDIUM'),
    (bruma_rec, 'ENVIRONMENT_DOMAIN_RISK', 'ENVIRONMENT', 'MEDIUM'),
    (bruma_rec, 'HEALTH_DOMAIN_RISK', 'HEALTH', 'HIGH'),
    (bruma_rec, 'BEHAVIOR_DOMAIN_RISK', 'BEHAVIOR', 'MEDIUM'),
    (bruma_rec, 'MENTAL_DOMAIN_RISK', 'MENTAL', 'MEDIUM');

  insert into alerts (farm_id, animal_id, severity, code, acknowledged, created_at) values
    (highland_id, nimbus_id, 'HIGH', 'LOW_WELFARE_INDEX', false, now() - interval '4 days'),
    (highland_id, nimbus_id, 'CRITICAL', 'HEAT_STRESS', false, now() - interval '4 days'),
    (highland_id, nimbus_id, 'HIGH', 'VACCINATION_OVERDUE', false, now() - interval '4 days'),
    (valley_id, bruma_id, 'HIGH', 'LOW_WELFARE_INDEX', false, now() - interval '1 day'),
    (valley_id, bruma_id, 'CRITICAL', 'HEAT_STRESS', false, now() - interval '1 day'),
    (valley_id, bruma_id, 'HIGH', 'VACCINATION_OVERDUE', false, now() - interval '1 day');
end $$;
