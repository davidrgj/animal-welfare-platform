import math

from scoring_lib import (
    base_daily_gain_kg,
    behavior_score,
    compliance_level,
    environment_modifier,
    environment_score,
    heat_stress_level,
    health_score,
    mental_score,
    minimum_space_m2,
    nutrition_score,
    production_stage,
    round1,
    scenario_welfare_shift,
    target_weight_kg,
    temperature_humidity_index,
    thermal_comfort,
    welfare_index,
)


def test_thi_nrc_formula_at_30c_80rh():
    thi = temperature_humidity_index(30, 80)
    assert math.isclose(thi, 82.92, abs_tol=0.05)


def test_thi_rises_with_humidity_at_fixed_temperature():
    dry = temperature_humidity_index(32, 40)
    humid = temperature_humidity_index(32, 85)
    assert humid > dry


def test_swine_heat_thresholds():
    assert heat_stress_level("SWINE", 73) == "NORMAL"
    assert heat_stress_level("SWINE", 74) == "ALERT"
    assert heat_stress_level("SWINE", 79) == "DANGER"
    assert heat_stress_level("SWINE", 84) == "EMERGENCY"


def test_ruminant_heat_thresholds():
    assert heat_stress_level("CATTLE", 71) == "NORMAL"
    assert heat_stress_level("CATTLE", 72) == "ALERT"
    assert heat_stress_level("GOAT", 79) == "DANGER"
    assert heat_stress_level("CATTLE", 90) == "EMERGENCY"


def test_ica_compliance_semaphore():
    assert compliance_level(80) == "COMPLIANT"
    assert compliance_level(79.9) == "ATTENTION"
    assert compliance_level(60) == "ATTENTION"
    assert compliance_level(59.9) == "NON_COMPLIANT"


def test_minimum_space_by_species_and_swine_stage():
    assert minimum_space_m2("CATTLE", None) == 4.5
    assert minimum_space_m2("GOAT", None) == 1.5
    assert minimum_space_m2("SWINE", "FARROWING") == 3.5
    assert minimum_space_m2("SWINE", "WEANING") == 0.3
    assert minimum_space_m2("SWINE", None) == 0.85


def test_target_weights_match_production_purpose():
    assert target_weight_kg("CATTLE", "MEAT") == 450
    assert target_weight_kg("CATTLE", "MILK") == 380
    assert target_weight_kg("GOAT", "MEAT") == 35
    assert target_weight_kg("SWINE", "MEAT") == 105
    assert target_weight_kg("SWINE", "MILK") == 160


def test_production_stage_cutovers():
    assert production_stage("CATTLE", 179, None) == "CALF"
    assert production_stage("CATTLE", 180, None) == "YEARLING"
    assert production_stage("CATTLE", 320, None) == "ADULT"
    assert production_stage("GOAT", 17.9, None) == "KID"
    assert production_stage("SWINE", 80, "FATTENING") == "FATTENING"


def test_nutrition_prefers_body_condition_3_and_three_drinks():
    assert nutrition_score(3, 3) == 100
    assert nutrition_score(2, 2) == 70
    assert nutrition_score(1, 0) == 17.5


def test_environment_penalizes_poor_bedding_and_heat():
    comfortable = environment_score("CATTLE", "EXCELLENT", 80, 20)
    stressed = environment_score("CATTLE", "CRITICAL", 10, 36)
    assert comfortable > 90
    assert stressed < 40


def test_health_drops_with_lameness_lesions_and_overdue_vaccine():
    healthy = health_score("ABSENT", False, True)
    sick = health_score("SEVERE", True, False)
    assert healthy == 100
    assert sick < 20


def test_swine_missing_enrichment_caps_behavior():
    with_enrichment = behavior_score("SWINE", "FATTENING", 2, "ADEQUATE", True)
    without = behavior_score("SWINE", "FATTENING", 2, "ADEQUATE", False)
    assert with_enrichment == 100
    assert without == 70


def test_mental_score_maps_handling_quality():
    assert mental_score("CALM") == 100
    assert mental_score("STRESSFUL") == 20


def test_welfare_index_weights_five_freedoms():
    index = welfare_index(100, 100, 100, 100, 100)
    assert index == 100
    mixed = welfare_index(80, 60, 40, 100, 20)
    expected = round1(0.25 * 80 + 0.2 * 60 + 0.25 * 40 + 0.15 * 100 + 0.15 * 20)
    assert mixed == expected


def test_drought_cuts_gain_and_welfare():
    assert environment_modifier("DROUGHT") == 0.7
    assert scenario_welfare_shift("DROUGHT") == -12
    assert environment_modifier("IMPROVED_HOUSING") == 1.08
    assert base_daily_gain_kg("CATTLE", "CONCENTRATE") > base_daily_gain_kg("CATTLE", "GRAZING")


def test_cattle_thermal_comfort_falls_eight_points_per_degree_outside_range():
    assert thermal_comfort("CATTLE", 24) == 100
    assert thermal_comfort("CATTLE", 25) == 92
    assert thermal_comfort("SWINE", 22) == 100
    assert thermal_comfort("SWINE", 30) == 36
