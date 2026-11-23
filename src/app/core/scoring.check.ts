import { complianceLevel, heatStressLevel, minimumSpaceM2, temperatureHumidityIndex } from './welfare-scoring';

const thi = temperatureHumidityIndex(30, 80);
if (Math.abs(thi - 82.9) > 0.15) throw new Error(`THI ${thi}`);
if (heatStressLevel('SWINE', 85) !== 'EMERGENCY') throw new Error('swine heat');
if (complianceLevel(75) !== 'COMPLIANT') throw new Error('compliance');
if (complianceLevel(74.9) !== 'ATTENTION') throw new Error('attention');
if (complianceLevel(49.9) !== 'NON_COMPLIANT') throw new Error('non-compliant');
if (minimumSpaceM2('SWINE', 'FATTENING') !== 0.85) throw new Error('space');
console.log('scoring checks passed');
