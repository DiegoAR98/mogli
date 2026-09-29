/**
 * Boss data (GDD §8.2): phases, attacks, wind-up/active seconds and recovery windows per tier,
 * transcribed from the GDD boss sheets, never a second design (PLAN.md §5.3).
 */

import type { BossData } from '../logic/boss/BossMachine';

const STANDARD_RECOVERY_S = { cub: 1.0, wolf: 0.6, loneWolf: 0.4 };
const HEAVY_RECOVERY_S = { cub: 1.2, wolf: 0.8, loneWolf: 0.5 };

/** B1 The Flung Festoon (GDD §8.2): the Bandar-log mob on the Cold Lairs terrace. */
export const B1_FLUNG_FESTOON: BossData = {
  id: 'B1',
  phases: [
    {
      id: 'nutRain',
      attacks: [{ id: 'rimThrow', windUpS: 0.6, activeS: 0.5, recoveryS: STANDARD_RECOVERY_S }],
    },
    {
      id: 'festoon',
      attacks: [{ id: 'pendulumSweep', windUpS: 0.8, activeS: 1.6, recoveryS: HEAVY_RECOVERY_S }],
    },
    {
      id: 'push',
      attacks: [{ id: 'lineCross', windUpS: 1.0, activeS: 0.6, recoveryS: HEAVY_RECOVERY_S }],
    },
  ],
};
