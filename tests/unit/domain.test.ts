import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canAccessFarm, runDiscreteEventSimulation, visibleFarms } from '../../src/app/core/simulation';
import { Animal, Farm, Profile, WelfareRecord } from '../../src/app/core/models';
import { complianceLevel, heatStressLevel, minimumSpaceM2, scoreWelfare, temperatureHumidityIndex } from '../../src/app/core/welfare-scoring';

function animal(overrides: Partial<Animal> = {}): Animal {
  return {
    id: 'animal-1',
    farmId: 'farm-1',
    tagId: 'BOV-QA',
    species: 'CATTLE',
    breed: 'Brahman',
    birthDate: '2023-01-15',
    sex: 'FEMALE',
    initialWeightKg: 180,
    currentWeightKg: 280,
    reproductiveStatus: 'OPEN',
    purpose: 'MEAT',
    hornType: null,
    electricFenceAssociated: true,
    swineStage: null,
    environmentalEnrichment: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  };
}

function record(overrides: Partial<Pick<WelfareRecord, 'bodyConditionScore' | 'hydrationTimesPerDay' | 'beddingStatus' | 'shadePercentage' | 'ambientTemperatureC' | 'relativeHumidity' | 'lameness' | 'skinLesions' | 'vaccinationUpToDate' | 'spacePerAnimalM2' | 'socialInteraction' | 'handlingQuality'>> = {}) {
  return {
    bodyConditionScore: 3,
    hydrationTimesPerDay: 3,
    beddingStatus: 'EXCELLENT' as const,
    shadePercentage: 80,
    ambientTemperatureC: 22,
    relativeHumidity: 60,
    lameness: 'ABSENT' as const,
    skinLesions: false,
    vaccinationUpToDate: true,
    spacePerAnimalM2: 6,
    socialInteraction: 'ADEQUATE' as const,
    handlingQuality: 'CALM' as const,
    ...overrides
  };
}

describe('ICA scoring', () => {
  it('computes THI close to 82.9 at 30 C and 80% RH', () => {
    const thi = temperatureHumidityIndex(30, 80);
    assert.ok(Math.abs(thi - 82.9) < 0.15);
  });

  it('marks swine THI 85 as emergency', () => {
    assert.equal(heatStressLevel('SWINE', 85), 'EMERGENCY');
  });

  it('classifies IBA 82 as compliant', () => {
    assert.equal(complianceLevel(82), 'COMPLIANT');
  });

  it('uses 0.85 m2 for fattening swine', () => {
    assert.equal(minimumSpaceM2('SWINE', 'FATTENING'), 0.85);
  });

  it('scores a healthy animal above the ICA green threshold', () => {
    const result = scoreWelfare(animal(), record());
    assert.ok(result.welfareIndex >= 80);
    assert.equal(result.complianceLevel, 'COMPLIANT');
    assert.equal(result.findings.length, 0);
  });

  it('flags heat stress, lameness and overdue vaccine as findings', () => {
    const result = scoreWelfare(
      animal(),
      record({
        ambientTemperatureC: 38,
        relativeHumidity: 90,
        lameness: 'SEVERE',
        vaccinationUpToDate: false,
        bodyConditionScore: 1,
        hydrationTimesPerDay: 1,
        beddingStatus: 'CRITICAL',
        shadePercentage: 10,
        spacePerAnimalM2: 1,
        handlingQuality: 'STRESSFUL'
      })
    );
    const codes = result.findings.map((finding) => finding.code);
    assert.ok(codes.includes('HEAT_STRESS'));
    assert.ok(codes.includes('LAMENESS'));
    assert.ok(codes.includes('VACCINATION_OVERDUE'));
    assert.ok(codes.includes('BCS_OUT_OF_RANGE'));
    assert.equal(result.complianceLevel, 'NON_COMPLIANT');
  });

  it('caps swine behavior when environmental enrichment is missing', () => {
    const result = scoreWelfare(
      animal({ species: 'SWINE', swineStage: 'FATTENING', environmentalEnrichment: false, currentWeightKg: 90 }),
      record({ spacePerAnimalM2: 2 })
    );
    assert.ok(result.behaviorScore <= 70);
    assert.ok(result.findings.some((finding) => finding.code === 'MISSING_ENRICHMENT'));
  });
});

describe('discrete-event simulation', () => {
  const farm: Farm = {
    id: 'farm-1',
    ownerId: 'user-1',
    name: 'El Recuerdo',
    vaccinationRegistry: 'RUV-1',
    hectares: 12,
    latitude: 4.71,
    longitude: -74.07,
    waterSource: 'SPRING',
    soilType: 'Franco',
    department: 'Cundinamarca',
    municipality: 'Facatativá',
    createdAt: '2026-01-01T00:00:00.000Z'
  };
  const user: Profile = {
    id: 'user-1',
    fullName: 'Ana Producer',
    email: 'ana@farm.local',
    documentId: '123',
    phone: '300',
    role: 'PRODUCER',
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  it('emits one snapshot per horizon day and is deterministic', () => {
    const draft = {
      name: 'QA drought',
      animalId: 'animal-1',
      feedType: 'GRAZING' as const,
      scenario: 'DROUGHT' as const,
      horizonDays: 30,
      startDate: '2026-03-01'
    };
    const first = runDiscreteEventSimulation(animal(), farm, user, 70, draft);
    const second = runDiscreteEventSimulation(animal(), farm, user, 70, draft);
    assert.equal(first.snapshots.length, 30);
    assert.deepEqual(first.snapshots, second.snapshots);
    assert.equal(first.run.finalWeightKg, second.run.finalWeightKg);
  });

  it('improved housing finishes heavier than feed restriction', () => {
    const base = {
      name: 'compare',
      animalId: 'animal-1',
      feedType: 'CONCENTRATE' as const,
      horizonDays: 60,
      startDate: '2026-03-01'
    };
    const improved = runDiscreteEventSimulation(animal(), farm, user, 85, { ...base, scenario: 'IMPROVED_HOUSING' });
    const restricted = runDiscreteEventSimulation(animal(), farm, user, 85, { ...base, scenario: 'FEED_RESTRICTION' });
    assert.ok(improved.run.finalWeightKg > restricted.run.finalWeightKg);
    assert.ok(improved.run.finalWelfareIndex > restricted.run.finalWelfareIndex);
  });

  it('starts with an ICA checkpoint event', () => {
    const result = runDiscreteEventSimulation(animal(), farm, user, 82, {
      name: 'baseline',
      animalId: 'animal-1',
      feedType: 'GRAZING',
      scenario: 'NORMAL',
      horizonDays: 14,
      startDate: '2026-04-01'
    });
    assert.equal(result.events[0].eventType, 'ICA_CHECKPOINT');
    assert.equal(result.run.estimatedComplianceDate, '2026-04-01');
  });
});

describe('visibility rules', () => {
  const own: Farm = {
    id: 'farm-own',
    ownerId: 'prod-1',
    name: 'Own',
    vaccinationRegistry: 'RUV',
    hectares: 1,
    latitude: 1,
    longitude: 1,
    waterSource: 'WELL',
    soilType: '',
    department: '',
    municipality: '',
    createdAt: ''
  };
  const other = { ...own, id: 'farm-other', ownerId: 'someone' };

  it('hides foreign farms from producers', () => {
    const producer: Profile = {
      id: 'prod-1',
      fullName: 'P',
      email: 'p@farm.local',
      documentId: '1',
      phone: '',
      role: 'PRODUCER',
      createdAt: ''
    };
    assert.equal(canAccessFarm(producer, other), false);
    assert.deepEqual(visibleFarms(producer, [own, other]).map((farm) => farm.id), ['farm-own']);
  });
});
