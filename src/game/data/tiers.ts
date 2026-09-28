/**
 * Difficulty tiers (GDD §9.7, D34). The tier is chosen at New Game and can be changed from the
 * map at any time; enemy hits-to-scatter, enemy speeds, wind-ups and level geometry never
 * change with tier -- only the quota and the damage/respawn/boss-hit numbers below do.
 */

import {
  BOSS_HITS_PER_PHASE_CUB,
  BOSS_HITS_PER_PHASE_LONE_WOLF,
  BOSS_HITS_PER_PHASE_WOLF,
  DAMAGE_PIPS_CUB,
  DAMAGE_PIPS_LONE_WOLF,
  DAMAGE_PIPS_WOLF,
  QUOTA_CUB,
  QUOTA_LONE_WOLF,
  QUOTA_WOLF,
} from './tuning';

export type TierId = 'cub' | 'wolf' | 'loneWolf';

export interface TierData {
  id: TierId;
  nameKey: string;
  quota: number;
  damagePips: number;
  hitsToRespawn: number;
  bossHitsPerPhase: number;
  chilEveryLevel: boolean;
}

export const TIERS: Record<TierId, TierData> = {
  cub: { id: 'cub', nameKey: 'tier.cub', quota: QUOTA_CUB, damagePips: DAMAGE_PIPS_CUB, hitsToRespawn: 6, bossHitsPerPhase: BOSS_HITS_PER_PHASE_CUB, chilEveryLevel: true },
  wolf: { id: 'wolf', nameKey: 'tier.wolf', quota: QUOTA_WOLF, damagePips: DAMAGE_PIPS_WOLF, hitsToRespawn: 3, bossHitsPerPhase: BOSS_HITS_PER_PHASE_WOLF, chilEveryLevel: false },
  loneWolf: { id: 'loneWolf', nameKey: 'tier.loneWolf', quota: QUOTA_LONE_WOLF, damagePips: DAMAGE_PIPS_LONE_WOLF, hitsToRespawn: 2, bossHitsPerPhase: BOSS_HITS_PER_PHASE_LONE_WOLF, chilEveryLevel: false },
};

export const DEFAULT_TIER: TierId = 'wolf';
