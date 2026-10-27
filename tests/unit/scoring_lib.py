"""Independent oracle of the ICA scoring formulas used in the TypeScript app."""

from typing import Literal

Species = Literal["CATTLE", "GOAT", "SWINE"]
SwineStage = Literal["GESTATION", "FARROWING", "WEANING", "FATTENING", "BREEDING"]
HeatStressLevel = Literal["NORMAL", "ALERT", "DANGER", "EMERGENCY"]
ComplianceLevel = Literal["COMPLIANT", "ATTENTION", "NON_COMPLIANT"]
FeedType = Literal["GRAZING", "SUPPLEMENTED_GRAZING", "CONCENTRATE", "MIXED_RATION", "MILK"]
EnvironmentScenario = Literal["NORMAL", "DROUGHT", "HEAT_WAVE", "IMPROVED_HOUSING", "FEED_RESTRICTION"]


def round1(value: float) -> float:
    return round(value * 10) / 10


def temperature_humidity_index(temperature_c: float, relative_humidity: float) -> float:
    return (1.8 * temperature_c + 32) - ((0.55 - 0.0055 * relative_humidity) * (1.8 * temperature_c - 26))


def heat_stress_level(species: Species, index: float) -> HeatStressLevel:
    if species == "SWINE":
        if index >= 84:
            return "EMERGENCY"
        if index >= 79:
            return "DANGER"
        if index >= 74:
            return "ALERT"
        return "NORMAL"
    if index >= 90:
        return "EMERGENCY"
    if index >= 79:
        return "DANGER"
    if index >= 72:
        return "ALERT"
    return "NORMAL"


def compliance_level(welfare_index: float) -> ComplianceLevel:
    if welfare_index >= 80:
        return "COMPLIANT"
    if welfare_index >= 60:
        return "ATTENTION"
    return "NON_COMPLIANT"


def minimum_space_m2(species: Species, swine_stage: SwineStage | None) -> float:
    if species == "CATTLE":
        return 4.5
    if species == "GOAT":
        return 1.5
    stages = {
        "GESTATION": 2,
        "FARROWING": 3.5,
        "WEANING": 0.3,
        "BREEDING": 2.5,
    }
    return stages.get(swine_stage or "FATTENING", 0.85)


def target_weight_kg(species: Species, purpose: str) -> float:
    if species == "CATTLE":
        if purpose == "MEAT":
            return 450
        if purpose == "MILK":
            return 380
        return 420
    if species == "GOAT":
        if purpose == "MEAT":
            return 35
        if purpose == "MILK":
            return 40
        return 38
    return 105 if purpose == "MEAT" else 160


def production_stage(species: Species, weight_kg: float, swine_stage: SwineStage | None) -> str:
    if species == "CATTLE":
        if weight_kg < 180:
            return "CALF"
        if weight_kg < 320:
            return "YEARLING"
        return "ADULT"
    if species == "GOAT":
        return "KID" if weight_kg < 18 else "ADULT"
    return swine_stage or "FATTENING"


def base_daily_gain_kg(species: Species, feed_type: FeedType) -> float:
    cattle = {"GRAZING": 0.55, "SUPPLEMENTED_GRAZING": 0.85, "CONCENTRATE": 1.1, "MIXED_RATION": 0.95, "MILK": 0.7}
    goat = {"GRAZING": 0.08, "SUPPLEMENTED_GRAZING": 0.12, "CONCENTRATE": 0.16, "MIXED_RATION": 0.14, "MILK": 0.18}
    swine = {"GRAZING": 0.35, "SUPPLEMENTED_GRAZING": 0.5, "CONCENTRATE": 0.75, "MIXED_RATION": 0.65, "MILK": 0.4}
    if species == "CATTLE":
        return cattle[feed_type]
    if species == "GOAT":
        return goat[feed_type]
    return swine[feed_type]


def environment_modifier(scenario: EnvironmentScenario) -> float:
    return {"NORMAL": 1, "DROUGHT": 0.7, "HEAT_WAVE": 0.85, "IMPROVED_HOUSING": 1.08, "FEED_RESTRICTION": 0.55}[scenario]


def scenario_welfare_shift(scenario: EnvironmentScenario) -> float:
    return {"NORMAL": 0, "DROUGHT": -12, "HEAT_WAVE": -10, "IMPROVED_HOUSING": 8, "FEED_RESTRICTION": -14}[scenario]


def nutrition_score(body_condition_score: int, hydration_times_per_day: int) -> float:
    condition = {3: 100, 2: 70, 4: 70, 1: 25, 5: 25}.get(body_condition_score, 0)
    hydration = 100 if hydration_times_per_day >= 3 else {2: 70, 1: 40}.get(hydration_times_per_day, 10)
    return (condition + hydration) / 2


def thermal_comfort(species: Species, temperature_c: float) -> float:
    ranges = {"SWINE": (16, 22), "GOAT": (12, 27), "CATTLE": (10, 24)}
    low, high = ranges[species]
    if low <= temperature_c <= high:
        return 100
    distance = low - temperature_c if temperature_c < low else temperature_c - high
    return max(0, 100 - distance * 8)


def environment_score(species: Species, bedding_status: str, shade_percentage: float, temperature_c: float) -> float:
    bedding = {"EXCELLENT": 100, "ADEQUATE": 75, "POOR": 40, "CRITICAL": 15}[bedding_status]
    shade = max(0, min(100, shade_percentage))
    return (bedding + shade + thermal_comfort(species, temperature_c)) / 3


def health_score(lameness: str, skin_lesions: bool, vaccination_up_to_date: bool) -> float:
    gait = {"ABSENT": 100, "MILD": 60, "MODERATE": 30, "SEVERE": 5}[lameness]
    return (gait + (35 if skin_lesions else 100) + (100 if vaccination_up_to_date else 0)) / 3


def behavior_score(species: Species, swine_stage: SwineStage | None, space_m2: float, social: str, enrichment: bool | None) -> float:
    required = minimum_space_m2(species, swine_stage)
    density = max(0, min(100, (space_m2 / required) * 100))
    social_score = {"ADEQUATE": 100, "LIMITED": 55, "ISOLATED": 15}[social]
    score = (density + social_score) / 2
    if species == "SWINE" and enrichment is False:
        score = min(score, 70)
    return score


def mental_score(handling_quality: str) -> float:
    return {"CALM": 100, "ADEQUATE": 70, "STRESSFUL": 20}[handling_quality]


def welfare_index(nutrition: float, environment: float, health: float, behavior: float, mental: float) -> float:
    return round1(0.25 * nutrition + 0.2 * environment + 0.25 * health + 0.15 * behavior + 0.15 * mental)
