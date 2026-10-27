from dataclasses import dataclass


@dataclass
class Profile:
    id: str
    role: str


@dataclass
class Farm:
    id: str
    owner_id: str


def can_access_farm(user: Profile, farm: Farm) -> bool:
    return user.role != "PRODUCER" or farm.owner_id == user.id


def visible_farms(user: Profile, farms: list[Farm]) -> list[Farm]:
    return [farm for farm in farms if can_access_farm(user, farm)]


def test_producer_only_sees_owned_farms():
    producer = Profile("p1", "PRODUCER")
    farms = [Farm("f1", "p1"), Farm("f2", "other")]
    assert [farm.id for farm in visible_farms(producer, farms)] == ["f1"]


def test_veterinarian_sees_every_farm():
    vet = Profile("v1", "VETERINARIAN")
    farms = [Farm("f1", "p1"), Farm("f2", "p2")]
    assert visible_farms(vet, farms) == farms


def test_administrator_sees_every_farm():
    admin = Profile("a1", "ADMINISTRATOR")
    farms = [Farm("f1", "p1")]
    assert visible_farms(admin, farms) == farms


def test_producer_cannot_access_foreign_farm():
    producer = Profile("p1", "PRODUCER")
    assert can_access_farm(producer, Farm("f2", "p2")) is False
