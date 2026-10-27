"""Cucumber-style acceptance tests. Scenarios live in tests/acceptance/features/."""

from pathlib import Path

from scoring_lib import (
    behavior_score,
    compliance_level,
    environment_score,
    health_score,
    heat_stress_level,
    mental_score,
    nutrition_score,
    welfare_index,
)


def test_healthy_cattle_is_ica_compliant():
    nutrition = nutrition_score(3, 3)
    environment = environment_score("CATTLE", "EXCELLENT", 80, 22)
    health = health_score("ABSENT", False, True)
    behavior = behavior_score("CATTLE", None, 6, "ADEQUATE", None)
    mental = mental_score("CALM")
    index = welfare_index(nutrition, environment, health, behavior, mental)
    assert index >= 80
    assert compliance_level(index) == "COMPLIANT"


def test_swine_thi_emergency_is_classified():
    assert heat_stress_level("SWINE", 85) == "EMERGENCY"


def test_feature_files_are_present():
    folder = Path(__file__).parent / "features"
    names = {path.name for path in folder.glob("*.feature")}
    assert names == {"login.feature", "welfare.feature", "simulation.feature"}
