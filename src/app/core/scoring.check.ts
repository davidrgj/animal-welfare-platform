import { complianceLevel, heatStressLevel, minimumSpaceM2, temperatureHumidityIndex } from './welfare-scoring';

const thi = temperatureHumidityIndex(30, 80);
if (Math.abs(thi - 81.3) > 0.3) throw new Error(`THI ${thi}`);
if (heatStressLevel('SWINE', 85) !== 'EMERGENCY') throw new Error('swine heat');
if (complianceLevel(82) !== 'COMPLIANT') throw new Error('compliance');
if (minimumSpaceM2('SWINE', 'FATTENING') !== 0.85) throw new Error('space');
console.log('scoring checks passed');
