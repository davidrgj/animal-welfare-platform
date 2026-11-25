-- Row Level Security isolation tests (13 cases), run directly against the policies.
-- Paste the whole file in the Supabase SQL editor (or run it with psql) after schema.sql.
-- Fixture users and rows live inside a subtransaction that is always rolled back, so no data
-- is left behind and no existing row is modified. The final SELECT lists one row per case.
-- If cases 12 or 13 fail, apply supabase/rls_hardening.sql and run this file again.

drop table if exists pg_temp.rls_isolation_results;
create temp table rls_isolation_results (
  case_number int,
  test_case text,
  expected text,
  observed text,
  result text
);

do $$
declare
  producer_a_id uuid := gen_random_uuid();
  producer_b_id uuid := gen_random_uuid();
  veterinarian_id uuid := gen_random_uuid();
  self_registered_id uuid := gen_random_uuid();
  farm_a_id uuid := gen_random_uuid();
  farm_b_id uuid := gen_random_uuid();
  animal_a_id uuid := gen_random_uuid();
  animal_b_id uuid := gen_random_uuid();
  producer_a_session text := jsonb_build_object('sub', producer_a_id, 'role', 'authenticated')::text;
  veterinarian_session text := jsonb_build_object('sub', veterinarian_id, 'role', 'authenticated')::text;
  results jsonb := '[]'::jsonb;
  own_rows int;
  foreign_rows int;
  affected_rows int;
  total_affected int;
  rejected_statements int;
  surviving_rows int;
  observed_role text;
  observed_name text;
  statement_rejected boolean;
begin
  begin
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    select
      '00000000-0000-0000-0000-000000000000', fixture.id, 'authenticated', 'authenticated',
      fixture.email, '', now(), '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', fixture.full_name, 'document_id', 'RLS-TEST', 'phone', '', 'role', 'PRODUCER'),
      now(), now(), '', '', '', ''
    from (values
      (producer_a_id, 'rls-test-producer-a@example.invalid', 'RLS test producer A'),
      (producer_b_id, 'rls-test-producer-b@example.invalid', 'RLS test producer B'),
      (veterinarian_id, 'rls-test-veterinarian@example.invalid', 'RLS test veterinarian')
    ) as fixture(id, email, full_name);

    update profiles set role = 'VETERINARIAN' where id = veterinarian_id;

    insert into farms (id, owner_id, name, vaccination_registry, hectares, latitude, longitude, water_source)
    values
      (farm_a_id, producer_a_id, 'RLS test farm A', 'RLS-A', 10, 4.6, -74.1, 'SPRING'),
      (farm_b_id, producer_b_id, 'RLS test farm B', 'RLS-B', 12, 4.4, -75.2, 'RIVER');

    insert into animals (id, farm_id, tag_id, species, breed, birth_date, sex, initial_weight_kg, current_weight_kg, reproductive_status, purpose)
    values
      (animal_a_id, farm_a_id, 'RLS-A-1', 'CATTLE', 'Brahman', current_date - 500, 'FEMALE', 250, 300, 'OPEN', 'MEAT'),
      (animal_b_id, farm_b_id, 'RLS-B-1', 'GOAT', 'Saanen', current_date - 400, 'FEMALE', 25, 32, 'OPEN', 'MILK');

    insert into welfare_records (
      animal_id, evaluator_id, recorded_at, body_condition_score, hydration_times_per_day, bedding_status,
      shade_percentage, ambient_temperature_c, relative_humidity, lameness, skin_lesions, vaccination_up_to_date,
      space_per_animal_m2, social_interaction, handling_quality, notes, nutrition_score, environment_score,
      health_score, behavior_score, mental_score, welfare_index, compliance_level, temperature_humidity_index
    )
    select
      fixture.animal_id, fixture.evaluator_id, now(), 3, 3, 'ADEQUATE', 50, 24, 65, 'ABSENT', false, true,
      6, 'ADEQUATE', 'CALM', '', 100, 80, 100, 100, 100, 95, 'COMPLIANT', 72
    from (values (animal_a_id, producer_a_id), (animal_b_id, producer_b_id)) as fixture(animal_id, evaluator_id);

    insert into alerts (farm_id, animal_id, severity, code)
    values (farm_a_id, animal_a_id, 'HIGH', 'RLS_TEST'), (farm_b_id, animal_b_id, 'HIGH', 'RLS_TEST');

    -- Session of producer A, who plays the attacker against producer B in cases 1 to 8.
    set local role authenticated;
    perform set_config('request.jwt.claims', producer_a_session, true);

    select count(*) filter (where owner_id = producer_a_id), count(*) filter (where owner_id = producer_b_id)
      into own_rows, foreign_rows from farms;
    results := results || jsonb_build_object('case_number', 1, 'test_case', 'Producer reads farms of another producer',
      'expected', 'own rows 1, foreign rows 0', 'observed', format('own rows %s, foreign rows %s', own_rows, foreign_rows),
      'passed', own_rows = 1 and foreign_rows = 0);

    select count(*) filter (where farm_id = farm_a_id), count(*) filter (where farm_id = farm_b_id)
      into own_rows, foreign_rows from animals;
    results := results || jsonb_build_object('case_number', 2, 'test_case', 'Producer reads animals of another producer',
      'expected', 'own rows 1, foreign rows 0', 'observed', format('own rows %s, foreign rows %s', own_rows, foreign_rows),
      'passed', own_rows = 1 and foreign_rows = 0);

    select count(*) filter (where animal_id = animal_a_id), count(*) filter (where animal_id = animal_b_id)
      into own_rows, foreign_rows from welfare_records;
    results := results || jsonb_build_object('case_number', 3, 'test_case', 'Producer reads welfare evaluations of another producer',
      'expected', 'own rows 1, foreign rows 0', 'observed', format('own rows %s, foreign rows %s', own_rows, foreign_rows),
      'passed', own_rows = 1 and foreign_rows = 0);

    select count(*) filter (where farm_id = farm_a_id), count(*) filter (where farm_id = farm_b_id)
      into own_rows, foreign_rows from alerts;
    results := results || jsonb_build_object('case_number', 4, 'test_case', 'Producer reads alerts of another producer',
      'expected', 'own rows 1, foreign rows 0', 'observed', format('own rows %s, foreign rows %s', own_rows, foreign_rows),
      'passed', own_rows = 1 and foreign_rows = 0);

    select count(*) filter (where id = producer_a_id), count(*) filter (where id <> producer_a_id)
      into own_rows, foreign_rows from profiles;
    results := results || jsonb_build_object('case_number', 5, 'test_case', 'Producer reads profiles of other users',
      'expected', 'own rows 1, foreign rows 0', 'observed', format('own rows %s, foreign rows %s', own_rows, foreign_rows),
      'passed', own_rows = 1 and foreign_rows = 0);

    update farms set name = 'Taken over' where id = farm_b_id;
    get diagnostics total_affected = row_count;
    update animals set current_weight_kg = 1 where id = animal_b_id;
    get diagnostics affected_rows = row_count;
    total_affected := total_affected + affected_rows;
    update welfare_records set welfare_index = 0 where animal_id = animal_b_id;
    get diagnostics affected_rows = row_count;
    total_affected := total_affected + affected_rows;
    update alerts set acknowledged = true where farm_id = farm_b_id;
    get diagnostics affected_rows = row_count;
    total_affected := total_affected + affected_rows;
    reset role;
    select name into observed_name from farms where id = farm_b_id;
    results := results || jsonb_build_object('case_number', 6, 'test_case', 'Producer updates farm, animal, evaluation and alert of another producer',
      'expected', 'rows updated 0, data unchanged', 'observed', format('rows updated %s, farm name "%s"', total_affected, observed_name),
      'passed', total_affected = 0 and observed_name = 'RLS test farm B');

    set local role authenticated;
    delete from alerts where farm_id = farm_b_id;
    get diagnostics total_affected = row_count;
    delete from welfare_records where animal_id = animal_b_id;
    get diagnostics affected_rows = row_count;
    total_affected := total_affected + affected_rows;
    delete from animals where id = animal_b_id;
    get diagnostics affected_rows = row_count;
    total_affected := total_affected + affected_rows;
    delete from farms where id = farm_b_id;
    get diagnostics affected_rows = row_count;
    total_affected := total_affected + affected_rows;
    reset role;
    select (select count(*) from farms where id = farm_b_id) + (select count(*) from animals where id = animal_b_id)
      + (select count(*) from welfare_records where animal_id = animal_b_id) + (select count(*) from alerts where farm_id = farm_b_id)
      into surviving_rows;
    results := results || jsonb_build_object('case_number', 7, 'test_case', 'Producer deletes farm, animal, evaluation and alert of another producer',
      'expected', 'rows deleted 0, 4 rows still present', 'observed', format('rows deleted %s, %s rows still present', total_affected, surviving_rows),
      'passed', total_affected = 0 and surviving_rows = 4);

    set local role authenticated;
    rejected_statements := 0;
    begin
      insert into farms (owner_id, name, vaccination_registry, hectares, latitude, longitude, water_source)
      values (producer_b_id, 'Planted farm', 'RLS-X', 1, 4, -74, 'WELL');
    exception when insufficient_privilege then rejected_statements := rejected_statements + 1;
    end;
    begin
      insert into animals (farm_id, tag_id, species, breed, birth_date, sex, initial_weight_kg, current_weight_kg, reproductive_status, purpose)
      values (farm_b_id, 'RLS-PLANTED', 'CATTLE', 'Brahman', current_date - 300, 'MALE', 200, 220, 'CASTRATED', 'MEAT');
    exception when insufficient_privilege then rejected_statements := rejected_statements + 1;
    end;
    begin
      insert into alerts (farm_id, animal_id, severity, code) values (farm_b_id, animal_b_id, 'CRITICAL', 'RLS_PLANTED');
    exception when insufficient_privilege then rejected_statements := rejected_statements + 1;
    end;
    results := results || jsonb_build_object('case_number', 8, 'test_case', 'Producer inserts farm, animal and alert into the data of another producer',
      'expected', 'inserts rejected 3 of 3', 'observed', format('inserts rejected %s of 3', rejected_statements),
      'passed', rejected_statements = 3);

    perform set_config('request.jwt.claims', veterinarian_session, true);
    select count(*) into own_rows from farms where id in (farm_a_id, farm_b_id);
    select count(*) into foreign_rows from animals where id in (animal_a_id, animal_b_id);
    results := results || jsonb_build_object('case_number', 9, 'test_case', 'Veterinarian sees the farms and animals of every producer (by design)',
      'expected', 'farms 2 of 2, animals 2 of 2', 'observed', format('farms %s of 2, animals %s of 2', own_rows, foreign_rows),
      'passed', own_rows = 2 and foreign_rows = 2);

    set local role anon;
    perform set_config('request.jwt.claims', '', true);
    select (select count(*) from profiles) + (select count(*) from farms) + (select count(*) from animals)
      + (select count(*) from welfare_records) + (select count(*) from alerts) + (select count(*) from simulation_runs)
      into foreign_rows;
    results := results || jsonb_build_object('case_number', 10, 'test_case', 'Anonymous visitor reads profiles, farms, animals, evaluations, alerts and simulations',
      'expected', 'rows visible 0', 'observed', format('rows visible %s', foreign_rows),
      'passed', foreign_rows = 0);

    statement_rejected := false;
    begin
      insert into farms (owner_id, name, vaccination_registry, hectares, latitude, longitude, water_source)
      values (producer_b_id, 'Anonymous farm', 'RLS-ANON', 1, 4, -74, 'WELL');
    exception when insufficient_privilege then statement_rejected := true;
    end;
    update farms set name = 'Anonymous edit' where id = farm_b_id;
    get diagnostics total_affected = row_count;
    delete from farms where id = farm_b_id;
    get diagnostics affected_rows = row_count;
    total_affected := total_affected + affected_rows;
    results := results || jsonb_build_object('case_number', 11, 'test_case', 'Anonymous visitor inserts, updates and deletes farms',
      'expected', 'insert rejected, rows changed 0', 'observed', format('insert %s, rows changed %s', case when statement_rejected then 'rejected' else 'accepted' end, total_affected),
      'passed', statement_rejected and total_affected = 0);

    set local role authenticated;
    perform set_config('request.jwt.claims', producer_a_session, true);
    begin
      update profiles set role = 'ADMINISTRATOR' where id = producer_a_id;
    exception when insufficient_privilege then null;
    end;
    reset role;
    select role into observed_role from profiles where id = producer_a_id;
    results := results || jsonb_build_object('case_number', 12, 'test_case', 'Producer changes the role of the own profile to administrator',
      'expected', 'role stays PRODUCER', 'observed', format('role is %s', observed_role),
      'passed', observed_role = 'PRODUCER');

    -- Public sign-up: the auth service inserts the user with the metadata chosen by the client.
    perform set_config('request.jwt.claims', '', true);
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', self_registered_id, 'authenticated', 'authenticated',
      'rls-test-self-registered@example.invalid', '', now(), '{"provider":"email","providers":["email"]}',
      '{"full_name":"RLS test self registered","document_id":"RLS-TEST","phone":"","role":"ADMINISTRATOR"}',
      now(), now(), '', '', '', ''
    );
    select role into observed_role from profiles where id = self_registered_id;
    results := results || jsonb_build_object('case_number', 13, 'test_case', 'Visitor signs up sending the administrator role in the metadata',
      'expected', 'profile created without the ADMINISTRATOR role', 'observed', format('role is %s', observed_role),
      'passed', observed_role is distinct from 'ADMINISTRATOR');

    raise exception 'Discard the test fixtures' using errcode = 'RLS99';
  exception when sqlstate 'RLS99' then
    null;
  end;

  insert into rls_isolation_results (case_number, test_case, expected, observed, result)
  select outcome.case_number, outcome.test_case, outcome.expected, outcome.observed, case when outcome.passed then 'PASS' else 'FAIL' end
  from jsonb_to_recordset(results) as outcome(case_number int, test_case text, expected text, observed text, passed boolean);
end $$;

select case_number, test_case, expected, observed, result from rls_isolation_results order by case_number;
