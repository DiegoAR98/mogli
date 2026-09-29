/**
 * Every feel constant from GDD.md §5.2-5.3 and DECISIONS.md D09, with its unit in the name.
 * Never import phaser here (PLAN.md §3.3 rule 1); a change to any value is a dated
 * DECISIONS.md row plus the same-commit edit to GDD.md §5.2 and PLAN.md §4.8.
 */

export const TILE_PX = 16;
export const SIMULATION_HZ = 60;
export const TILE_BIAS = 16;

// Body dimensions (GDD §5.1, §5.3)
export const HERO_FRAME_PX = 32;
export const BODY_STANDING_W_PX = 12;
export const BODY_STANDING_H_PX = 22;
export const BODY_CROUCHED_W_PX = 12;
export const BODY_CROUCHED_H_PX = 14;

// Running (GDD §5.2)
export const RUN_SPEED_PX_S = 96;
export const WALK_SPEED_PX_S = 48;
export const GROUND_ACCEL_PX_S2 = 900;
export const GROUND_BRAKE_PX_S2 = 1200;
export const TURN_BRAKE_PX_S2 = 1800;
export const AIR_CONTROL_RATIO = 0.65;
export const AIR_ACCEL_PX_S2 = GROUND_ACCEL_PX_S2 * AIR_CONTROL_RATIO; // 585
export const AIR_BRAKE_PX_S2 = GROUND_BRAKE_PX_S2 * AIR_CONTROL_RATIO; // 780
export const AIR_TURN_BRAKE_PX_S2 = TURN_BRAKE_PX_S2 * AIR_CONTROL_RATIO; // 1170

// Jumping (GDD §5.2; v0 = 2h/t, g = 2h/t^2 at height 56 px, time-to-apex 0.35 s)
export const JUMP_HEIGHT_PX = 56;
export const JUMP_TIME_TO_APEX_S = 0.35;
export const JUMP_LAUNCH_SPEED_PX_S = 320;
export const RISING_GRAVITY_PX_S2 = 914;
export const FALLING_GRAVITY_MULTIPLIER = 1.6;
export const FALLING_GRAVITY_PX_S2 = 1462; // RISING_GRAVITY_PX_S2 * FALLING_GRAVITY_MULTIPLIER, documented value
export const APEX_HANG_GRAVITY_MULTIPLIER = 0.5;
export const APEX_HANG_GRAVITY_PX_S2 = RISING_GRAVITY_PX_S2 * APEX_HANG_GRAVITY_MULTIPLIER; // 457
export const APEX_HANG_VY_THRESHOLD_PX_S = 32;
export const JUMP_CUT_MULTIPLIER = 0.5;
export const MAX_FALL_SPEED_PX_S = 320;
export const FAST_FALL_SPEED_PX_S = 400;
export const JUMP_HORIZONTAL_BOOST_PX_S = 32;

// Forgiveness windows, in frames at 60 Hz (PLAN.md §4.7)
export const COYOTE_FRAMES = 6;
export const JUMP_BUFFER_FRAMES = 6;
export const THROW_BUFFER_FRAMES = 6;
export const LEDGE_REGRAB_LOCK_FRAMES = 15; // 0.25 s
export const PULL_UP_FRAMES = 18; // 0.3 s
export const IFRAMES_FRAMES = 60; // 1.0 s

// Corner correction, step-up, ledge grab (GDD §5.5)
export const CORNER_CORRECTION_PX = 4;
export const STEP_UP_PX = 4;
export const LEDGE_GRAB_HORIZONTAL_PX = 6;
export const LEDGE_GRAB_VERTICAL_PX = 8;

// Climbing and swinging (GDD §6.1-6.2)
export const CLIMB_SPEED_PX_S = 64;
export const CREEPER_HORIZONTAL_SPEED_PX_S = 48;
export const SWING_PERIOD_S = 1.6;
export const SWING_AMPLITUDE_DEG = 40;
export const SWING_PUMP_RATIO = 0.1;
export const CREEPER_REGRAB_LOCK_FRAMES = 15; // 0.25 s

// Level design metrics (GDD §5.2-5.3); reach is an estimate until measured in the M1 gym level
export const HORIZONTAL_REACH_TILES_ESTIMATE = 5.5;
export const GAP_075X_TILES = 4;
export const GAP_100X_TILES = 5.5;
export const STANDING_START_GAP_TILES = 2;

// Interact verb hold times, in frames at 60 Hz (GDD §4.1, §3.4 S1)
export const INTERACT_HUT_DOOR_FRAMES = 15; // 0.25 s
export const INTERACT_MASTER_WORDS_GATE_FRAMES = 30; // 0.5 s
export const INTERACT_ROPE_FRAMES = 48; // 0.8 s
export const INTERACT_BOSS_HOLD_FRAMES = 120; // 2 s

// Hit response (GDD §7.5, D53)
export const LEAF_PIPS_MAX = 6;
export const HIT_KNOCKBACK_PX_S = 96;
export const HIT_KNOCKBACK_DURATION_S = 0.2;
export const HIT_UPWARD_IMPULSE_PX_S = 160;

// Respawn (GDD §9.5)
export const RESPAWN_FADE_S = 0.6;

// Stomp (GDD §7.4, D40)
export const STOMP_BOUNCE_TILES = 3;
export const STOMP_BOUNCE_HELD_TILES = 3.5;

// Throw ladder (GDD §7.1)
export const NUT_SPEED_PX_S = 224;
export const NUT_GRAVITY_MULTIPLIER = 0.25;
export const NUT_COOLDOWN_S = 0.25;
export const NUT_MAX_ONSCREEN = 3;
export const NUT_RANGE_TILES = 7;
export const NUT_DAMAGE = 1;
export const CLOD_SPEED_PX_S = 320;
export const CLOD_RANGE_TILES = 9;
export const CLOD_DAMAGE = 2;
export const CLOD_PILE_COUNT = 5;
export const CLOD_CAP = 20;
export const CLOD_BOSS_WINDOW_EXTEND_S = 0.2;
export const CROUCH_THROW_HEIGHT_RATIO = 0.5;
export const THROW_SHOULDER_HEIGHT_PX = 14;

// Collectibles (GDD §9.1, D91)
export const STONES_PER_LEVEL = 15;
export const STONE_PATH_COUNT = 9;
export const STONE_BRANCH_COUNT = 4;
export const STONE_SECRET_COUNT = 2;
export const QUOTA_CUB = 8;
export const QUOTA_WOLF = 10;
export const QUOTA_LONE_WOLF = 12;

// Tier table (GDD §9.7, D34): damage in leaf pips per hit, boss hits per phase
export const DAMAGE_PIPS_CUB = 1;
export const DAMAGE_PIPS_WOLF = 2;
export const DAMAGE_PIPS_LONE_WOLF = 3;
export const BOSS_HITS_PER_PHASE_CUB = 2;
export const BOSS_HITS_PER_PHASE_WOLF = 3;
export const BOSS_HITS_PER_PHASE_LONE_WOLF = 4;

// Enemy scatter (S3 Lobber, GDD §7.6-7.7)
export const LOBBER_TELEGRAPH_S = 0.6;
export const LOBBER_THROW_CYCLE_S = 2.0;

// Red Flower (GDD §7.3, D30)
export const RED_FLOWER_SECONDS_PER_POT = 8;
export const RED_FLOWER_CAP_S = 24;
export const RED_FLOWER_FLEE_RADIUS_TILES = 6;
export const GARLIC_SECONDS_PER_RUB = 15;
export const GARLIC_CAP_S = 30;

// Charger script (S3, GDD §7.7 #2): Tabaqui, jackals and (from L4) village dogs
export const CHARGER_PATROL_SPEED_PX_S = 48;
export const CHARGER_TELEGRAPH_S = 0.6;
export const TABAQUI_CARRY_SPEED_PX_S = 96;
export const TABAQUI_STEAL_RANGE_TILES = 6;
export const TABAQUI_STEAL_REACH_PX = 4;
export const CHARGER_FLEE_S = 10;

// Quota chain (GDD §9.1): counter flip, sting, silhouette and toast durations
export const QUOTA_SILHOUETTE_S = 3;
export const QUOTA_TOAST_S = 2;

// Save schema (GDD §9.5)
export const SAVE_SCHEMA_VERSION = 1;
export const SAVE_SLOT_COUNT = 3;

// Turret script (S3, GDD §7.7 #3): the cobra of the Poison People
export const TURRET_TELEGRAPH_S = 0.6;
export const TURRET_LUNGE_ACTIVE_S = 0.3;
export const TURRET_REST_S = 1.0;
export const TURRET_TRIGGER_RANGE_TILES = 3; // "within 3 tiles it rears and lunges" (GDD §7.7 #3)
export const TURRET_LUNGE_FORWARD_TILES = 2;
export const TURRET_LUNGE_HEIGHT_TILES = 1.5;
export const TURRET_HIDE_S = 8; // sinks into its hole after 2 nuts / 1 clod
export const TURRET_HITS_TO_HIDE = 2;
export const SNAKE_GATE_CALM_S = 10;

// S7 BossMachine (GDD §8.1): recovery windows by tier, standard and heavy
export const BOSS_RECOVERY_STANDARD_S_CUB = 1.0;
export const BOSS_RECOVERY_STANDARD_S_WOLF = 0.6;
export const BOSS_RECOVERY_STANDARD_S_LONE_WOLF = 0.4;
export const BOSS_RECOVERY_HEAVY_S_CUB = 1.2;
export const BOSS_RECOVERY_HEAVY_S_WOLF = 0.8;
export const BOSS_RECOVERY_HEAVY_S_LONE_WOLF = 0.5;
export const BOSS_CLOD_WINDOW_EXTEND_S = 0.2; // same as INTERACT_BOSS_HOLD_FRAMES's 2 s hold, GDD §8.2 beat 7
