import Phaser from 'phaser';
import { InputSystem, type InputSnapshot } from '../systems/input';
import { gameEvents } from '../systems/events';
import { parseLevel, tilePropertiesAt, type LevelDefinition, type TiledMap } from '../logic/level/levelData';
import {
  applyJumpCut,
  canCaptureLedge,
  canStandUp,
  clampFallSpeed,
  crouchedBodyRect,
  fallingGravityPxS2,
  integrateHorizontalVelocity,
  risingGravityPxS2,
  standingBodyRect,
  stompBounceHeightPx,
} from '../logic/player/PlayerController';
import { canGrabCreeper, creeperClimbVelocity, type CreeperClimbInput } from '../logic/player/creeper';
import { COUNTER_INACTIVE, consumeCountdown, isCountdownActive, isLocked, startCountdown, tickCountdown } from '../logic/player/frameCounter';
import { activateCheckpoint, healOnCheckpoint, interactRequirementFrames, respawnAtLastCheckpoint, type CheckpointState } from '../logic/triggers/TriggerVolume';
import { collectStone, type StoneRuntimeState } from '../logic/collectibles/Collectible';
import { CLOD_PARAMS, CLOD_PILE_ROW, NUT_PARAMS, canThrow, projectileGravityPxS2, projectileVelocity, resolveAimDirection } from '../logic/projectiles/Projectile';
import {
  initialLobberState,
  initialChargerState,
  initialTurretState,
  initialBuldeoState,
  stepLobber,
  stepCharger,
  stepTurret,
  stepBuldeo as stepBuldeoScript,
  stompScatters,
  turretIsStompable,
  type LobberState,
  type ChargerState,
  type TurretState,
  type BuldeoState,
} from '../logic/enemies/scripts';
import {
  carryPosition,
  crumbleHasCollision,
  headLiftHeightFraction,
  initialHeadLiftState,
  pendulumKinematics,
  startCrumble,
  stepCrumble,
  stepHeadLift,
  swingReleaseVx,
  trunkLaunchVelocity,
  type CrumbleState,
  type HeadLiftState,
  type Waypoint,
} from '../logic/platforms/PathFollower';
import { initialRedFlowerState, isWithinFleeRadius, pickUpPot, tickRedFlower, toggleRedFlower, type RedFlowerState } from '../logic/items/RedFlower';
import { activateBeckon, checkQuota, initialExitNpcState, initialQuotaState, touchExit, type ExitNpcState, type QuotaState } from '../logic/collectibles/ExitNPC';
import { applyHit, canBeHit, isBlinkVisible } from '../logic/player/hitResponse';
import { tickCountUp, isCountUpComplete } from '../logic/player/frameCounter';
import { currentAttack, initialBossState, isHittable, registerHit, stepBoss, type BossAttackSub, type BossData, type BossMachineState } from '../logic/boss/BossMachine';
import { B1_FLUNG_FESTOON, B2_LAME_ONE, B3_THUU } from '../data/bosses';
import { TIERS, type TierId } from '../data/tiers';
import type { Settings } from '../systems/settings';
import { Translator } from '../systems/locale';
import type { DictKey } from '../i18n/en';
import type { CardSceneData } from './CardScene';
import {
  B2_FALLING_ROCK_INTERVAL_S,
  B2_FALLING_ROCK_LANES,
  B2_LAME_CHARGE_SPEED_PX_S,
  B2_POUNCE_ARC_TILES,
  B2_ROAR_PUSH_TILES,
  B2_SWIPE_HEIGHT_TILES,
  B3_STRIKE_HEIGHT_TILES,
  B3_STRIKE_REACH_TILES,
  B3_TREASURE_TOSS_SPOTS,
  BODY_STANDING_H_PX,
  BODY_STANDING_W_PX,
  BUFFALO_ADVANCE_SPEED_PX_S,
  BULDEO_CHASE_SPEED_PX_S,
  BULDEO_DETECT_HEIGHT_TILES,
  BULDEO_DETECT_WIDTH_TILES,
  BULDEO_ROUTE_SPEED_PX_S,
  HEAD_LIFT_HOLD_FRAMES,
  HEAD_LIFT_LOWER_S,
  HEAD_LIFT_RISE_S,
  HEAD_LIFT_RISE_TILES,
  HEAD_LIFT_WAIT_AT_TOP_S,
  CARRY_WAIT_AT_MARKER_S,
  CHARGER_PATROL_SPEED_PX_S,
  CLIMB_SPEED_PX_S,
  COYOTE_FRAMES,
  DOG_LUNGE_RANGE_TILES,
  DOG_LUNGE_SPEED_PX_S,
  IFRAMES_FRAMES,
  JUMP_BUFFER_FRAMES,
  JUMP_HORIZONTAL_BOOST_PX_S,
  JUMP_LAUNCH_SPEED_PX_S,
  LEAF_PIPS_MAX,
  MAX_FALL_SPEED_PX_S,
  QUILL_PIG_CYCLE_S,
  QUILL_PIG_HIGH_HEIGHT_TILES,
  QUILL_PIG_LOW_HEIGHT_TILES,
  QUILL_PIG_PATROL_SPEED_PX_S,
  QUILL_PIG_SHOT_SPEED_PX_S,
  QUILL_PIG_TELEGRAPH_S,
  QUILL_PIG_TRIGGER_RANGE_TILES,
  RESPAWN_FADE_S,
  RISING_GRAVITY_PX_S2,
  RUN_SPEED_PX_S,
  STONES_PER_LEVEL,
  SWING_AMPLITUDE_DEG,
  SWING_PERIOD_S,
  TABAQUI_CARRY_SPEED_PX_S,
  TABAQUI_STEAL_RANGE_TILES,
  TABAQUI_STEAL_REACH_PX,
  TILE_PX,
  TRUNK_LAUNCH_RANGE_TILES,
  TURRET_LUNGE_FORWARD_TILES,
  TURRET_LUNGE_HEIGHT_TILES,
  TURRET_TRIGGER_RANGE_TILES,
  WALK_SPEED_PX_S,
} from '../data/tuning';

interface PlaySceneData {
  levelId: string;
}

type Rect = Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };

interface EnemyRuntime {
  sprite: Rect;
  script: 'lobber' | 'charger' | 'turret';
  lobberState: LobberState;
  chargerState: ChargerState;
  turretState: TurretState;
  thief: boolean;
  patrolLeft: number;
  patrolRight: number;
  direction: -1 | 1;
  carriedStoneIndex: number | null;
  targetStoneIndex: number | null;
  /** Quill-pig (GDD §7.7 #4): a Lobber that waddles and only throws within range, straight not arced. */
  quillPig: boolean;
  /** Pariah dogs (GDD §7.7 #2): a Charger that deals contact damage and lunge-charges in line. */
  contactDamage: boolean;
  lunge: boolean;
  chargeDir: -1 | 1;
  /** Truce zone (GDD §10.5): every enemy is passive and walks to drink while true. */
  truced: boolean;
}

/** Buldeo (GDD §7.7, §10.7): not an enemy entry, takes no hits, never stomped or scared. */
interface BuldeoRuntime {
  sprite: Rect;
  state: BuldeoState;
  patrolLeft: number;
  patrolRight: number;
  direction: -1 | 1;
}

interface NutRuntime {
  sprite: Rect;
  spawnX: number;
  rangePx: number;
}

const NUT_SPEED_FOR_RANGE = 224;
const KNOCKBACK_LOCK_FRAMES = 12; // 0.2 s (GDD §7.5)
const SNAKE_GATE_ROOM_RADIUS_PX = 8 * TILE_PX; // "a room of cobras" (GDD §10.4), approximated as a fixed radius
const GATE_INTERACT_RANGE_PX = 20;

export class PlayScene extends Phaser.Scene {
  private level!: LevelDefinition;
  private tierId: TierId = 'wolf';
  private quotaValue = 10;
  private damagePips = 2;
  private settings!: Settings;

  private player!: Rect;
  private facing: -1 | 1 = 1;
  private crouched = false;
  private climbing = false;
  private swinging = false;
  private jumpCutDone = false;
  private coyoteFrames = COUNTER_INACTIVE;
  private bufferFrames = COUNTER_INACTIVE;
  private iframesFrames = COUNTER_INACTIVE;
  private knockbackLockFrames = COUNTER_INACTIVE;
  private creeperRegrabLockFrames = 0;
  private wasGrounded = false;
  private pips = LEAF_PIPS_MAX;
  private deaths = 0;

  private checkpoint!: CheckpointState;
  private stoneStates: StoneRuntimeState[] = [];
  private stoneSprites: Phaser.GameObjects.Rectangle[] = [];
  private stoneCarried: boolean[] = [];
  private stonesCollected = 0;

  private groundLayer!: Phaser.Tilemaps.TilemapLayer;

  private nuts: NutRuntime[] = [];
  private throwCooldownS = 0;
  private enemyNuts: Rect[] = [];

  private enemies: EnemyRuntime[] = [];
  private buldeo: BuldeoRuntime | null = null;
  private tallGrassZones: Array<{ x: number; y: number; w: number; h: number }> = [];
  private ropes: Array<{ sprite: Rect; x: number; y: number; index: number; holdFrames: number; cut: boolean }> = [];
  private followers: Array<{ sprite: Rect; index: number; active: boolean }> = [];
  private altarSprite?: Rect;
  private pouchCount = 0;
  private headLifts: Array<{ sprite: Rect; baseX: number; baseY: number; state: HeadLiftState; holdFrames: number }> = [];

  private redFlower: RedFlowerState = initialRedFlowerState();
  private redFlowerPickups: Array<{ sprite: Phaser.GameObjects.Rectangle; claimed: boolean }> = [];
  private throwableOrder: Array<'nut' | 'clod' | 'redFlower'> = ['nut'];
  private throwableIndex = 0;
  private clodCount = 0;
  private clodPickups: Array<{ sprite: Phaser.GameObjects.Rectangle; claimed: boolean }> = [];

  private exitNpc: ExitNpcState = initialExitNpcState();
  private exitSprite?: Phaser.GameObjects.Rectangle;
  private quota: QuotaState = initialQuotaState();

  private roarZones: Array<{ x: number; y: number; w: number; h: number; firedAt: number | null }> = [];
  private cardZones: Array<{ x: number; y: number; w: number; h: number; textKey: string; fired: boolean }> = [];
  private snakeGateZones: Array<{ x: number; y: number; w: number; h: number; fired: boolean }> = [];
  private gates: Array<{ id: number; sprite: Rect; x: number; y: number; w: number; h: number; opened: boolean; holdFrames: number; kind: 'masterWordsGate' | 'hutDoor' }> = [];

  private swings: Array<{ sprite: Rect; pivotX: number; pivotY: number; lengthPx: number; periodS: number }> = [];
  private ridingSwingIndex: number | null = null;

  private crumblePlatforms: Array<{ sprite: Rect; state: CrumbleState }> = [];

  // --- S4 carry platforms (GDD §10.5-10.6): Hathi's sons, buffalo (advanceOnHit), Rama (B2) ----
  private carryPlatforms: Array<{
    sprite: Rect;
    waypoints: Waypoint[];
    speedPxS: number;
    waitS: number;
    advanceOnHit: boolean;
    advancing: boolean;
  }> = [];
  private bouncePads: Array<{ sprite: Rect; cooldownS: number }> = [];
  private fences: Array<{ sprite: Rect; broken: boolean }> = [];
  private truceZones: Array<{ x: number; y: number; w: number; h: number }> = [];

  // --- S7 Boss encounter (GDD §8.1-8.2): reuses S3 scripts scaled up, per the GDD's own rule ---
  private bossDoorZone?: { x: number; y: number; w: number; h: number };
  private bossId: string | null = null;
  private bossData: BossData = B1_FLUNG_FESTOON;
  private bossActive = false;
  private bossState: BossMachineState = initialBossState();
  private bossHurtboxSprite?: Rect;
  private bossHazardSprite?: Rect;
  private bossPhaseFired = false;
  private bossGates: Array<{ sprite: Rect; opened: boolean }> = [];
  private altarGates: Array<{ sprite: Rect; opened: boolean }> = [];
  private bossHelpers: Array<{ sprite: Rect; kind: string; holdFrames: number; held: boolean }> = [];

  private simTimeS = 0;
  private ended = false;

  constructor() {
    super('Play');
  }

  create(data: PlaySceneData): void {
    this.physics.world.TILE_BIAS = 16;

    this.settings = (this.registry.get('settings') as Settings | undefined) ?? { assist: { invincibility: false, infiniteClods: false, chilEverywhere: false, gameSpeedPercent: 100, crouchToggle: false }, shakePercent: 100 } as Settings;
    this.tierId = (this.registry.get('tier') as TierId | undefined) ?? 'wolf';
    this.quotaValue = TIERS[this.tierId].quota;
    this.damagePips = TIERS[this.tierId].damagePips;

    const cacheEntry = this.cache.tilemap.get(`map-${data.levelId}`);
    const rawJson = cacheEntry.data as TiledMap;
    this.level = parseLevel(rawJson);

    this.buildTilemap(data.levelId);
    this.buildPlayer();
    this.buildStones();
    this.buildPackstonesAndTriggers();
    this.buildPlatforms();
    this.buildEnemies();
    this.buildPickups();
    this.buildExit();
    this.buildBossDoor();
    this.buildHelpers();
    this.buildRopesAndFollowers();
    this.buildAltar();
    this.buildHeadLifts();

    this.checkpoint = activateCheckpoint({ checkpointId: 'spawn', x: this.level.spawn.x, y: this.level.spawn.y, spawnFacing: this.level.spawn.facing });

    this.inputSystem = new InputSystem();
    this.physics.world.on('worldstep', this.onTick, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
  }

  private inputSystem!: InputSystem;

  /** HudScene wires touch buttons to this same InputSystem instance so touch input actually plays. */
  getInputSystem(): InputSystem {
    return this.inputSystem;
  }

  private buildTilemap(levelId: string): void {
    const map = this.make.tilemap({ key: `map-${levelId}` });
    const tileset = map.addTilesetImage('gym-graybox', 'gym-graybox');
    if (!tileset) throw new Error('Failed to add tileset image "gym-graybox"');

    map.createLayer('bg', tileset, 0, 0);
    this.groundLayer = map.createLayer('ground', tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    map.createLayer('fg', tileset, 0, 0);

    this.groundLayer.setCollisionByProperty({ collides: true });
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  private buildPlayer(): void {
    const rect = standingBodyRect(this.level.spawn.x, this.level.spawn.y);
    this.player = this.add.rectangle(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h, 0xd8a657) as Rect;
    this.physics.add.existing(this.player);
    this.player.body.setSize(rect.w, rect.h);
    this.player.body.setMaxVelocity(RUN_SPEED_PX_S * 4, MAX_FALL_SPEED_PX_S * 2);
    this.facing = this.level.spawn.facing;

    this.physics.add.collider(this.player, this.groundLayer);

    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setBounds(0, 0, this.level.widthTiles * TILE_PX, this.level.heightTiles * TILE_PX);
  }

  private buildStones(): void {
    for (const stone of this.level.stones) {
      this.stoneStates.push({ collected: false });
      this.stoneCarried.push(false);
      const sprite = this.add.rectangle(stone.x, stone.y, 6, 6, 0xf2e94e);
      this.physics.add.existing(sprite, true);
      this.stoneSprites.push(sprite);
    }
  }

  private packstoneZones: Array<{ x: number; y: number; w: number; h: number; checkpointId: string; spawnFacing: -1 | 1 }> = [];
  private pitZones: Array<{ x: number; y: number; w: number; h: number }> = [];

  private buildPackstonesAndTriggers(): void {
    for (const p of this.level.packstones) {
      const sprite = this.add.rectangle(p.x, p.y - 8, 10, 16, 0x5aa0d8);
      this.physics.add.existing(sprite, true);
      this.packstoneZones.push({ x: p.x - 6, y: p.y - 16, w: 12, h: 16, checkpointId: p.checkpointId, spawnFacing: p.spawnFacing });
    }
    for (const t of this.level.triggers) {
      if (t.flag === 'pit') {
        this.pitZones.push({ x: t.x, y: t.y, w: t.w, h: t.h });
      } else if (t.flag === 'roar') {
        this.roarZones.push({ x: t.x, y: t.y, w: t.w, h: t.h, firedAt: null });
      } else if (t.flag === 'card') {
        this.cardZones.push({ x: t.x, y: t.y, w: t.w, h: t.h, textKey: t.textKey ?? '', fired: false });
      } else if (t.flag === 'snakeGate') {
        this.snakeGateZones.push({ x: t.x, y: t.y, w: t.w, h: t.h, fired: false });
      } else if (t.flag === 'door') {
        const sprite = this.add.rectangle(t.x + t.w / 2, t.y + t.h / 2, t.w, t.h, 0x3a2a6a) as Rect;
        this.physics.add.existing(sprite, true);
        this.physics.add.collider(this.player, sprite);
        const kind = t.gateKind === 'hutDoor' ? 'hutDoor' : 'masterWordsGate';
        this.gates.push({ id: t.id, sprite, x: t.x, y: t.y, w: t.w, h: t.h, opened: false, holdFrames: 0, kind });
      } else if (t.flag === 'bossGate') {
        const sprite = this.add.rectangle(t.x + t.w / 2, t.y + t.h / 2, t.w, t.h, 0x3a2a6a) as Rect;
        this.physics.add.existing(sprite, true);
        this.physics.add.collider(this.player, sprite);
        this.bossGates.push({ sprite, opened: false });
      } else if (t.flag === 'truce') {
        this.truceZones.push({ x: t.x, y: t.y, w: t.w, h: t.h });
      } else if (t.flag === 'tallGrass') {
        this.tallGrassZones.push({ x: t.x, y: t.y, w: t.w, h: t.h });
      } else if (t.flag === 'altarGate') {
        const sprite = this.add.rectangle(t.x + t.w / 2, t.y + t.h / 2, t.w, t.h, 0x3a2a6a) as Rect;
        this.physics.add.existing(sprite, true);
        this.physics.add.collider(this.player, sprite);
        this.altarGates.push({ sprite, opened: false });
      }
    }
    for (const fence of this.level.fences) {
      const sprite = this.add.rectangle(fence.x + fence.w / 2, fence.y + fence.h / 2, fence.w, fence.h, 0x8a7a4a) as Rect;
      this.physics.add.existing(sprite, true);
      this.physics.add.collider(this.player, sprite);
      this.fences.push({ sprite, broken: false });
    }
  }

  private buildPlatforms(): void {
    for (const platform of this.level.platforms) {
      if (platform.flags.includes('swing')) {
        const lengthPx = 4 * TILE_PX;
        const sprite = this.add.rectangle(platform.x, platform.y + lengthPx, 4, 10, 0xc9b458) as Rect;
        this.physics.add.existing(sprite);
        sprite.body.setAllowGravity(false);
        sprite.body.setImmovable(true);
        this.swings.push({ sprite, pivotX: platform.x, pivotY: platform.y, lengthPx, periodS: platform.periodS ?? SWING_PERIOD_S });
      } else if (platform.flags.includes('crumble')) {
        const sprite = this.add.rectangle(platform.x + platform.w / 2, platform.y + TILE_PX / 2, platform.w, TILE_PX, 0x8a6a4a) as Rect;
        this.physics.add.existing(sprite, true);
        this.physics.add.collider(this.player, sprite, () => this.onCrumbleTouched(sprite));
        this.crumblePlatforms.push({ sprite, state: { crumbling: false, fallenAtS: null, respawned: false } });
      } else if (platform.flags.includes('carry')) {
        const waypoints: Waypoint[] = [{ x: platform.x, y: platform.y }, ...(platform.waypoints ?? [])];
        const sprite = this.add.rectangle(platform.x, platform.y, platform.w || 3 * TILE_PX, platform.h || 6, 0x6a8a4a) as Rect;
        this.physics.add.existing(sprite);
        sprite.body.setAllowGravity(false);
        sprite.body.setImmovable(true);
        this.physics.add.collider(this.player, sprite);
        const advanceOnHit = platform.flags.includes('advanceOnHit');
        this.carryPlatforms.push({ sprite, waypoints, speedPxS: platform.speedPxS, waitS: platform.waitS ?? CARRY_WAIT_AT_MARKER_S, advanceOnHit, advancing: false });
      } else if (platform.flags.includes('bounce')) {
        const sprite = this.add.rectangle(platform.x + platform.w / 2, platform.y + platform.h / 2, platform.w, platform.h, 0xd8a657) as Rect;
        this.physics.add.existing(sprite, true);
        this.bouncePads.push({ sprite, cooldownS: 0 });
      }
    }
  }

  private onCrumbleTouched(sprite: Rect): void {
    const entry = this.crumblePlatforms.find((c) => c.sprite === sprite);
    if (!entry || entry.state.crumbling) return;
    // Only start crumbling when Mowgli is standing on top of it.
    if (this.player.body.touching.down || this.player.body.blocked.down) {
      entry.state = startCrumble(this.simTimeS);
    }
  }

  private buildEnemies(): void {
    for (const enemyDef of this.level.enemies) {
      if (enemyDef.script === 'buldeo') {
        const sprite = this.add.rectangle(enemyDef.x, enemyDef.y - 6, 12, 14, 0xd8a657) as Rect;
        this.physics.add.existing(sprite);
        sprite.body.setCollideWorldBounds(false);
        this.physics.add.collider(sprite, this.groundLayer);
        this.buldeo = {
          sprite,
          state: initialBuldeoState(),
          patrolLeft: enemyDef.patrolLeft,
          patrolRight: enemyDef.patrolRight,
          direction: enemyDef.facing,
        };
        continue;
      }
      const sprite = this.add.rectangle(enemyDef.x, enemyDef.y - 6, 10, 12, 0xb84a4a) as Rect;
      this.physics.add.existing(sprite);
      sprite.body.setCollideWorldBounds(false);
      this.physics.add.collider(sprite, this.groundLayer);
      this.enemies.push({
        sprite,
        script: enemyDef.script,
        lobberState: initialLobberState(),
        chargerState: initialChargerState(),
        turretState: initialTurretState(),
        thief: enemyDef.flags.includes('thief'),
        patrolLeft: enemyDef.patrolLeft,
        patrolRight: enemyDef.patrolRight,
        direction: enemyDef.facing,
        carriedStoneIndex: null,
        targetStoneIndex: null,
        quillPig: enemyDef.flags.includes('quillPig'),
        contactDamage: enemyDef.flags.includes('contactDamage'),
        lunge: enemyDef.flags.includes('lunge'),
        chargeDir: enemyDef.facing,
        truced: false,
      });
    }
  }

  private buildPickups(): void {
    for (const pickup of this.level.pickups) {
      if (pickup.kind === 'redFlowerPot') {
        const sprite = this.add.rectangle(pickup.x, pickup.y - 6, 8, 10, 0xd8562a);
        this.physics.add.existing(sprite, true);
        this.redFlowerPickups.push({ sprite, claimed: false });
      } else if (pickup.kind === 'clodPile') {
        const sprite = this.add.rectangle(pickup.x, pickup.y - 4, 10, 8, 0x8a6a3a);
        this.physics.add.existing(sprite, true);
        this.clodPickups.push({ sprite, claimed: false });
      }
    }
  }

  private buildExit(): void {
    if (!this.level.exit) return;
    const sprite = this.add.rectangle(this.level.exit.x, this.level.exit.y - 8, 12, 16, 0x555555);
    this.physics.add.existing(sprite, true);
    this.exitSprite = sprite;
  }

  private buildBossDoor(): void {
    if (!this.level.bossDoor) return;
    const bd = this.level.bossDoor;
    this.bossDoorZone = { x: bd.x, y: bd.y, w: bd.w, h: bd.h };
    this.bossId = bd.bossId;
    this.bossData = bd.bossId === 'B2' ? B2_LAME_ONE : bd.bossId === 'B3' ? B3_THUU : B1_FLUNG_FESTOON;

    const hurtbox = this.add.rectangle(bd.x, bd.y + bd.h - 20, 14, 14, 0x8a4a8a) as Rect;
    this.physics.add.existing(hurtbox, true);
    hurtbox.setVisible(false);
    hurtbox.body.enable = false;
    this.bossHurtboxSprite = hurtbox;

    const hazard = this.add.rectangle(bd.x, bd.y + bd.h - 20, 16, 8, 0xaa2222) as Rect;
    this.physics.add.existing(hazard, true);
    hazard.setVisible(false);
    hazard.body.enable = false;
    this.bossHazardSprite = hazard;
  }

  private buildHelpers(): void {
    for (const h of this.level.helpers) {
      const sprite = this.add.rectangle(h.x, h.y - 8, 10, 16, 0x333333) as Rect;
      this.physics.add.existing(sprite, true);
      this.bossHelpers.push({ sprite, kind: h.kind, holdFrames: 0, held: false });
    }
  }

  /** Rope cutting and the escort followers (GDD §10.7): a 0.8 s crouch-hold cuts the rope of the
   * same index, freeing the follower it ties up. A follower stays put and invisible until freed. */
  private buildRopesAndFollowers(): void {
    for (const r of this.level.ropes) {
      const sprite = this.add.rectangle(r.x, r.y - 8, 8, 16, 0x8a6a3a) as Rect;
      this.physics.add.existing(sprite, true);
      this.ropes.push({ sprite, x: r.x, y: r.y, index: r.index, holdFrames: 0, cut: false });
    }
    for (const f of this.level.followers) {
      const sprite = this.add.rectangle(f.x, f.y - 8, 10, 16, 0xc9a0d8) as Rect;
      sprite.setVisible(false);
      this.followers.push({ sprite, index: f.index, active: false });
    }
  }

  private buildAltar(): void {
    if (!this.level.altar) return;
    const sprite = this.add.rectangle(this.level.altar.x, this.level.altar.y - 8, 14, 16, 0xf2e94e) as Rect;
    this.physics.add.existing(sprite, true);
    this.altarSprite = sprite;
  }

  /** Kaa's head-lift (GDD §10.8): stand 0.6 s, it rises 4 tiles, waits 2 s, lowers. */
  private buildHeadLifts(): void {
    for (const h of this.level.headLifts) {
      const sprite = this.add.rectangle(h.x, h.y, 3 * TILE_PX, TILE_PX, 0x5a8ab0) as Rect;
      this.physics.add.existing(sprite);
      sprite.body.setAllowGravity(false);
      sprite.body.setImmovable(true);
      this.physics.add.collider(this.player, sprite);
      this.headLifts.push({ sprite, baseX: h.x, baseY: h.y, state: initialHeadLiftState(), holdFrames: 0 });
    }
  }

  // --- The worldstep tick (PLAN.md §4.2): every gameplay rule and timer lives here -------------

  private onTick(dtS: number): void {
    if (this.ended) return;
    this.simTimeS += dtS;
    const snapshot = this.inputSystem.sample();

    if (snapshot.pressed.pause) {
      this.scene.pause('Play');
      this.scene.launch('Pause');
      return;
    }

    this.stepPlayer(snapshot, dtS);
    this.stepGates(snapshot);
    if (this.stepCardTriggers()) return;
    this.stepStoneOverlaps();
    this.stepPackstoneOverlaps();
    this.stepPitOverlaps();
    this.stepPickupOverlaps();
    this.stepRoarTriggers();
    this.stepSnakeGates();
    this.stepRedFlower(snapshot, dtS);
    this.stepThrow(snapshot, dtS);
    this.stepNuts(dtS);
    this.stepEnemyNutsVsPlayer();
    this.stepEnemies(dtS);
    this.stepSwing(dtS, snapshot);
    this.stepCrumblePlatforms();
    this.stepCarryPlatforms(dtS);
    this.stepBouncePads();
    this.stepHeadLifts(dtS, snapshot);
    this.stepBossDoor();
    this.stepBossFight(dtS, snapshot);
    this.stepBossGates();
    this.stepBuldeo(dtS);
    this.stepRopes(snapshot);
    this.stepFollowers();
    this.stepAltar();
    this.stepAltarGates();
    this.stepQuotaAndExit();
    this.stepIframes();
  }

  private stepPlayer(snapshot: InputSnapshot, dtS: number): void {
    const body = this.player.body;
    const grounded = body.blocked.down || body.touching.down;

    if (this.climbing) {
      this.stepClimbing(snapshot);
      return;
    }

    // --- Creeper grab check (before normal movement) ---
    const overlappingCreeper = this.isOverlappingClimbable();
    if (
      canGrabCreeper({ overlappingCreeper, grounded, upPressed: snapshot.held.up, fallingWithDownHeld: !grounded && body.velocity.y > 0 && snapshot.held.down }) &&
      this.creeperRegrabLockFrames <= 0
    ) {
      this.enterClimbing();
      return;
    }

    // --- Crouch ---
    const wantsCrouch = snapshot.held.down && grounded;
    if (wantsCrouch && !this.crouched) {
      this.crouched = true;
      this.applyBodyRect(crouchedBodyRect(this.player.x, this.player.y + this.player.height / 2));
    } else if (!wantsCrouch && this.crouched) {
      const standing = standingBodyRect(this.player.x, this.player.y + this.player.height / 2);
      const clear = this.isStandingRectClear(standing);
      if (canStandUp(clear)) {
        this.crouched = false;
        this.applyBodyRect(standing);
      }
    }

    // --- Horizontal movement (frozen during the post-hit knockback lock, GDD §7.5) ---
    const inputDir = snapshot.held.left ? -1 : snapshot.held.right ? 1 : 0;
    if (inputDir !== 0) this.facing = inputDir;
    if (!isCountdownActive(this.knockbackLockFrames)) {
      const maxSpeed = this.crouched ? WALK_SPEED_PX_S : RUN_SPEED_PX_S;
      const vx = integrateHorizontalVelocity(body.velocity.x, inputDir as -1 | 0 | 1, grounded, maxSpeed, dtS);
      body.setVelocityX(vx);
    }
    this.knockbackLockFrames = tickCountdown(this.knockbackLockFrames);

    // --- Jump edge resolution (coyote + buffer, GDD §5.2, PLAN §4.7) ---
    let jumpStarts = false;
    if (snapshot.pressed.jump) {
      if (grounded || isCountdownActive(this.coyoteFrames)) {
        jumpStarts = true;
      } else {
        this.bufferFrames = startCountdown(JUMP_BUFFER_FRAMES);
      }
    }
    if (!jumpStarts && grounded && isCountdownActive(this.bufferFrames)) {
      jumpStarts = true;
    }

    if (jumpStarts) {
      let boost = 0;
      if (snapshot.held.left) boost = -JUMP_HORIZONTAL_BOOST_PX_S;
      else if (snapshot.held.right) boost = JUMP_HORIZONTAL_BOOST_PX_S;
      body.setVelocityY(-JUMP_LAUNCH_SPEED_PX_S);
      body.setVelocityX(body.velocity.x + boost);
      this.coyoteFrames = consumeCountdown();
      this.bufferFrames = consumeCountdown();
      this.jumpCutDone = false;
      if (this.crouched) {
        this.crouched = false;
        this.applyBodyRect(standingBodyRect(this.player.x, this.player.y + this.player.height / 2));
      }
    }

    // --- Coyote counter update ---
    if (grounded) {
      this.coyoteFrames = COUNTER_INACTIVE;
    } else if (this.wasGrounded && !jumpStarts) {
      this.coyoteFrames = startCountdown(COYOTE_FRAMES);
    } else {
      this.coyoteFrames = tickCountdown(this.coyoteFrames);
    }
    this.bufferFrames = tickCountdown(this.bufferFrames);
    if (this.creeperRegrabLockFrames > 0) this.creeperRegrabLockFrames--;

    // --- Jump cut ---
    const cut = applyJumpCut(body.velocity.y, snapshot.released.jump, this.jumpCutDone);
    if (cut.vy !== body.velocity.y) body.setVelocityY(cut.vy);
    this.jumpCutDone = cut.cutDone;

    // --- Gravity for the NEXT step (D56: world gravity 0, per-body gravity written each tick) ---
    if (grounded && !jumpStarts) {
      body.setGravityY(0);
    } else if (body.velocity.y < 0) {
      body.setGravityY(risingGravityPxS2(body.velocity.y, snapshot.held.jump));
    } else {
      body.setGravityY(fallingGravityPxS2());
    }

    // --- Fall speed clamp ---
    if (body.velocity.y > 0) {
      body.setVelocityY(clampFallSpeed(body.velocity.y, snapshot.held.down));
    }

    // --- Ledge grab hang (simplified: only while falling near a lip) ---
    // Full ledge-grab-to-hang-to-pull-up state is implemented and unit-tested in
    // PlayerController.ts (tests 9); wiring the visual hang/pull-up animation state into
    // PlayScene is a should-item left for the M2 art pass (no placeholder hurts M1's gate).

    this.wasGrounded = grounded;
  }

  private stepClimbing(snapshot: InputSnapshot): void {
    const body = this.player.body;
    const input: CreeperClimbInput = { up: snapshot.held.up, down: snapshot.held.down, left: snapshot.held.left, right: snapshot.held.right, horizontalCreeper: false };
    const { vx, vy } = creeperClimbVelocity(input);
    body.setVelocity(vx, vy);
    body.setAllowGravity(false);

    if (snapshot.pressed.jump) {
      this.exitClimbing();
      const body2 = this.player.body;
      body2.setAllowGravity(true);
      body2.setVelocityY(-JUMP_LAUNCH_SPEED_PX_S);
      let boost = 0;
      if (snapshot.held.left) boost = -JUMP_HORIZONTAL_BOOST_PX_S;
      else if (snapshot.held.right) boost = JUMP_HORIZONTAL_BOOST_PX_S;
      body2.setVelocityX(boost);
    } else if (!this.isOverlappingClimbable() && vy < 0) {
      // Climbed off the top of the column: stand on whatever is there.
      this.exitClimbing();
      body.setAllowGravity(true);
    }
  }

  private enterClimbing(): void {
    this.climbing = true;
    this.player.body.setAllowGravity(false);
    this.player.body.setVelocity(0, 0);
  }

  private exitClimbing(): void {
    this.climbing = false;
    this.creeperRegrabLockFrames = 15;
  }

  private isOverlappingClimbable(): boolean {
    const tileX = Math.floor(this.player.x / TILE_PX);
    const tileY = Math.floor(this.player.y / TILE_PX);
    const props = tilePropertiesAt(this.level, tileX, tileY);
    return Boolean(props?.climbable);
  }

  private isStandingRectClear(rect: { x: number; y: number; w: number; h: number }): boolean {
    const topTileY = Math.floor(rect.y / TILE_PX);
    const tileX = Math.floor((rect.x + rect.w / 2) / TILE_PX);
    for (let ty = topTileY; ty <= Math.floor((rect.y + rect.h) / TILE_PX); ty++) {
      const props = tilePropertiesAt(this.level, tileX, ty);
      if (props?.collides) return false;
    }
    return true;
  }

  private applyBodyRect(rect: { x: number; y: number; w: number; h: number }): void {
    this.player.setSize(rect.w, rect.h);
    this.player.body.setSize(rect.w, rect.h);
    this.player.setPosition(rect.x + rect.w / 2, rect.y + rect.h / 2);
  }

  private stepStoneOverlaps(): void {
    for (let i = 0; i < this.stoneSprites.length; i++) {
      if (this.stoneStates[i].collected || this.stoneCarried[i]) continue;
      const sprite = this.stoneSprites[i];
      const dx = sprite.x - this.player.x;
      const dy = sprite.y - this.player.y;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 14) {
        this.stoneStates[i] = collectStone(this.stoneStates[i]);
        sprite.setVisible(false);
        if (this.level.stones[i].skin === 'jewel') {
          // The inverted quota (GDD §9.3): a jewel goes into the pouch, not straight to the count.
          this.pouchCount++;
        } else {
          this.stonesCollected++;
        }
        gameEvents.emit('stones:collected', { count: this.stonesCollected, total: this.level.stones.length, index: i, kind: this.level.stones[i].skin === 'jewel' ? 'jewel' : 'moon' });
      }
    }
  }

  private stepPackstoneOverlaps(): void {
    for (const zone of this.packstoneZones) {
      const overlapping = this.player.x > zone.x && this.player.x < zone.x + zone.w && this.player.y > zone.y && this.player.y < zone.y + zone.h;
      if (overlapping && this.checkpoint.checkpointId !== zone.checkpointId) {
        this.checkpoint = activateCheckpoint(zone);
        this.pips = healOnCheckpoint(LEAF_PIPS_MAX);
        gameEvents.emit('checkpoint:saved', { packstoneId: zone.checkpointId });
      }
    }
  }

  private stepPitOverlaps(): void {
    // A pit is anywhere below the level's bottom bound, or a marked chasm (GDD §6.5): every
    // gap respawns Mowgli, not only the ones a designer remembered to cover with a trigger.
    if (this.player.y > this.level.heightTiles * TILE_PX + TILE_PX * 2) {
      this.respawn();
      return;
    }
    for (const zone of this.pitZones) {
      const overlapping = this.player.x > zone.x && this.player.x < zone.x + zone.w && this.player.y > zone.y && this.player.y < zone.y + zone.h;
      if (overlapping) {
        this.respawn();
        return;
      }
    }
  }

  private stepPickupOverlaps(): void {
    for (const pickup of this.redFlowerPickups) {
      if (pickup.claimed) continue;
      const dx = pickup.sprite.x - this.player.x;
      const dy = pickup.sprite.y - this.player.y;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 14) {
        pickup.claimed = true;
        pickup.sprite.setVisible(false);
        this.redFlower = pickUpPot(this.redFlower);
        if (!this.throwableOrder.includes('redFlower')) this.throwableOrder.push('redFlower');
      }
    }
    for (const pickup of this.clodPickups) {
      if (pickup.claimed) continue;
      const dx = pickup.sprite.x - this.player.x;
      const dy = pickup.sprite.y - this.player.y;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 14) {
        pickup.claimed = true;
        pickup.sprite.setVisible(false);
        this.clodCount = Math.min(CLOD_PILE_ROW.cap, this.clodCount + CLOD_PILE_ROW.count);
        if (!this.throwableOrder.includes('clod')) this.throwableOrder.splice(1, 0, 'clod');
      }
    }
  }

  private stepRoarTriggers(): void {
    for (const zone of this.roarZones) {
      if (zone.firedAt !== null) continue;
      const overlapping = this.player.x > zone.x && this.player.x < zone.x + zone.w && this.player.y > zone.y && this.player.y < zone.y + zone.h;
      if (overlapping) {
        zone.firedAt = this.simTimeS;
        const amplitude = 2 * (this.settings.shakePercent / 100);
        if (amplitude > 0) this.cameras.main.shake(2000, amplitude / 1000);
      }
    }
  }

  /** One-shot card triggers (GDD §10.4: the first Bird-gate, the kidnap-carry cinematic's card
   * fallback). Returns true when a card just fired, so onTick can stop the rest of that tick. */
  private stepCardTriggers(): boolean {
    for (const zone of this.cardZones) {
      if (zone.fired) continue;
      const overlapping = this.player.x > zone.x && this.player.x < zone.x + zone.w && this.player.y > zone.y && this.player.y < zone.y + zone.h;
      if (overlapping) {
        zone.fired = true;
        this.showCard(zone.textKey);
        return true;
      }
    }
    return false;
  }

  private showCard(textKey: string): void {
    const translator = this.registry.get('translator') as Translator | undefined;
    const line = translator && textKey ? translator.t(textKey as DictKey) : textKey;
    this.scene.pause('Play');
    this.scene.launch('Card', { lines: [line], nextScene: 'Play', nextAction: 'resume' } satisfies CardSceneData);
  }

  /** Snake-gate (GDD §10.4): touching it once calms every cobra within TABAQUI_STEAL_RANGE_TILES-
   * scale proximity of the gate for SNAKE_GATE_CALM_S, without counting as a hit. */
  private stepSnakeGates(): void {
    for (const zone of this.snakeGateZones) {
      if (zone.fired) continue;
      const overlapping = this.player.x > zone.x && this.player.x < zone.x + zone.w && this.player.y > zone.y && this.player.y < zone.y + zone.h;
      if (!overlapping) continue;
      zone.fired = true;
      const cx = zone.x + zone.w / 2;
      const cy = zone.y + zone.h / 2;
      for (const enemy of this.enemies) {
        if (enemy.script !== 'turret') continue;
        const distancePx = Phaser.Math.Distance.Between(cx, cy, enemy.sprite.x, enemy.sprite.y);
        if (distancePx <= SNAKE_GATE_ROOM_RADIUS_PX) this.calmTurret(enemy);
      }
    }
  }

  /** Master Words gates and hut doors (S5 door, GDD §4.1, §10.4, §10.6): a crouch-hold interact
   * opens the gate (0.5 s for a Master Words gate, 0.25 s for a hut door) and it stays open for
   * the rest of the session (GDD §9.5 keeps it through a respawn). */
  private stepGates(snapshot: InputSnapshot): void {
    for (const gate of this.gates) {
      if (gate.opened) continue;
      const cx = gate.x + gate.w / 2;
      const cy = gate.y + gate.h / 2;
      const near = Phaser.Math.Distance.Between(this.player.x, this.player.y, cx, cy) < GATE_INTERACT_RANGE_PX;
      // Deliberately not gated on grounded/this.crouched: both derive every tick from Arcade's
      // blocked.down/touching.down, which can flicker false for a tick even while resting on a
      // static floor (an engine timing quirk, not a crouch bug), which would otherwise reset
      // this count-up sporadically. GDD's own rule is "Down held ... at an interact volume"
      // (§4.1); requiring grounded here would only add fragility, not a needed guard.
      const holding = near && snapshot.held.down;
      const requiredFrames = interactRequirementFrames(gate.kind);
      gate.holdFrames = tickCountUp(gate.holdFrames, holding, requiredFrames);
      if (isCountUpComplete(gate.holdFrames, requiredFrames)) {
        gate.opened = true;
        gate.sprite.setVisible(false);
        gate.sprite.body.enable = false;
      }
    }
  }

  private stepRedFlower(snapshot: InputSnapshot, dtS: number): void {
    if (snapshot.pressed.item) {
      this.redFlower = toggleRedFlower(this.redFlower);
    }
    this.redFlower = tickRedFlower(this.redFlower, dtS);

    if (!this.redFlower.lit) return;
    for (const enemy of this.enemies) {
      const distanceTiles = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y) / TILE_PX;
      if (isWithinFleeRadius(this.redFlower, distanceTiles)) {
        if (enemy.script === 'turret') this.calmTurret(enemy);
        else this.forceEnemyFlee(enemy);
      }
    }
  }

  private stepIframes(): void {
    this.iframesFrames = tickCountdown(this.iframesFrames);
    this.player.setAlpha(isBlinkVisible(this.iframesFrames) ? 1 : 0.3);
  }

  private respawn(): void {
    const pos = respawnAtLastCheckpoint(this.checkpoint);
    this.deaths++;
    this.player.setPosition(pos.x, pos.y - BODY_STANDING_H_PX / 2);
    this.player.body.setVelocity(0, 0);
    this.facing = pos.facing;
    this.pips = healOnCheckpoint(LEAF_PIPS_MAX);
    this.iframesFrames = COUNTER_INACTIVE;
    this.knockbackLockFrames = COUNTER_INACTIVE;
    gameEvents.emit('player:respawned', { packstoneId: this.checkpoint.checkpointId ?? 'spawn', deaths: this.deaths });
  }

  /** Pause menu "Restart from checkpoint" (GDD §11.4): the same reset as a death, minus the death count. */
  restartFromCheckpoint(): void {
    const pos = respawnAtLastCheckpoint(this.checkpoint);
    this.player.setPosition(pos.x, pos.y - BODY_STANDING_H_PX / 2);
    this.player.body.setVelocity(0, 0);
    this.facing = pos.facing;
    this.pips = healOnCheckpoint(LEAF_PIPS_MAX);
    this.iframesFrames = COUNTER_INACTIVE;
    this.knockbackLockFrames = COUNTER_INACTIVE;
  }

  private stepThrow(snapshot: InputSnapshot, dtS: number): void {
    this.throwCooldownS = Math.max(0, this.throwCooldownS - dtS);
    if (snapshot.pressed.cycle && this.throwableOrder.length > 1) {
      this.throwableIndex = (this.throwableIndex + 1) % this.throwableOrder.length;
    }
    if (!snapshot.pressed.throw) return;

    const current = this.throwableOrder[this.throwableIndex];
    if (current === 'redFlower') return; // the timed item toggles on the item button, never thrown
    if (current === 'clod' && this.clodCount <= 0) return;

    const params = current === 'clod' ? CLOD_PARAMS : NUT_PARAMS;
    if (!canThrow(this.nuts.length, this.throwCooldownS, params)) return;

    this.throwCooldownS = params.cooldownS;
    if (current === 'clod') this.clodCount--;

    // Truce zone (GDD §10.5): a throw drops at Mowgli's own feet with a soft "no", never flies.
    if (this.isInTruceZone(this.player.x, this.player.y)) return;

    const aim = resolveAimDirection({ left: snapshot.held.left, right: snapshot.held.right, up: snapshot.held.up, down: snapshot.held.down, facing: this.facing });
    const velocity = projectileVelocity(aim, params);
    const spawnX = this.player.x + aim.dx * 10;
    const spawnY = this.player.y - (this.crouched ? 4 : 8);

    const color = current === 'clod' ? 0x6a5a3a : 0x8a6a3a;
    const sprite = this.add.rectangle(spawnX, spawnY, 4, 4, color) as Rect;
    this.physics.add.existing(sprite);
    sprite.body.setVelocity(velocity.vx, velocity.vy);
    sprite.body.setGravityY(projectileGravityPxS2(params, RISING_GRAVITY_PX_S2));
    sprite.body.setAllowGravity(true);
    this.physics.add.collider(sprite, this.groundLayer, () => this.destroyNut(sprite));

    this.nuts.push({ sprite, spawnX, rangePx: params.rangeTiles * TILE_PX });
  }

  private destroyNut(sprite: Phaser.GameObjects.Rectangle): void {
    const index = this.nuts.findIndex((n) => n.sprite === sprite);
    if (index >= 0) this.nuts.splice(index, 1);
    sprite.destroy();
  }

  private stepNuts(_dtS: number): void {
    for (const nut of [...this.nuts]) {
      if (Math.abs(nut.sprite.x - nut.spawnX) > nut.rangePx) {
        this.destroyNut(nut.sprite);
        continue;
      }
      let hit = false;
      for (const enemy of this.enemies) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(nut.sprite.getBounds(), enemy.sprite.getBounds())) {
          this.forceEnemyFlee(enemy);
          this.destroyNut(nut.sprite);
          hit = true;
          break;
        }
      }
      if (hit) continue;
      for (const carry of this.carryPlatforms) {
        if (!carry.advanceOnHit) continue;
        if (Phaser.Geom.Intersects.RectangleToRectangle(nut.sprite.getBounds(), carry.sprite.getBounds())) {
          this.registerBuffaloHit(carry.sprite);
          this.destroyNut(nut.sprite);
          break;
        }
      }
    }
  }

  /** A hit, a stomp or the Red Flower all route through here (GDD §7.3-7.4 both scare an enemy the same way). */
  private forceEnemyFlee(enemy: EnemyRuntime): void {
    if (enemy.script === 'lobber') {
      if (enemy.lobberState.phase === 'fleeing') return;
      enemy.lobberState = stepLobber(enemy.lobberState, 0, true).state;
    } else if (enemy.script === 'charger') {
      if (enemy.chargerState.phase === 'fleeing') return;
      const result = stepCharger(enemy.chargerState, 0, { hitOrStomped: true, thief: enemy.thief, stoneNearby: false, reachedStone: false });
      enemy.chargerState = result.state;
      if (result.droppedStone && enemy.carriedStoneIndex !== null) {
        this.dropCarriedStone(enemy);
      }
    } else {
      // Turret (never stompable, so this only ever comes from a nut/clod hit): 2 hits sinks it
      // into its hole (GDD §7.7 #3); a Red Flower scare goes through calmTurret() instead, since
      // it is not a hit and does not count toward that threshold.
      if (enemy.turretState.phase === 'hidden') return;
      enemy.turretState = stepTurret(enemy.turretState, 0, { playerInRange: false, hit: true, calmed: false }).state;
    }
  }

  private calmTurret(enemy: EnemyRuntime): void {
    if (enemy.turretState.phase === 'hidden') return;
    enemy.turretState = stepTurret(enemy.turretState, 0, { playerInRange: false, hit: false, calmed: true }).state;
  }

  private dropCarriedStone(enemy: EnemyRuntime): void {
    const index = enemy.carriedStoneIndex;
    if (index === null) return;
    this.stoneCarried[index] = false;
    const sprite = this.stoneSprites[index];
    sprite.setPosition(enemy.sprite.x, enemy.sprite.y);
    sprite.setVisible(true);
    enemy.carriedStoneIndex = null;
    enemy.targetStoneIndex = null;
  }

  private stepEnemyNutsVsPlayer(): void {
    for (const sprite of [...this.enemyNuts]) {
      if (!Phaser.Geom.Intersects.RectangleToRectangle(sprite.getBounds(), this.player.getBounds())) continue;
      this.destroyEnemyNut(sprite);
      this.applyHitToPlayer(sprite.body.velocity.x >= 0 ? 1 : -1);
    }
  }

  private applyHitToPlayer(knockbackDir: -1 | 1): void {
    if (this.settings.assist.invincibility) return;
    if (!canBeHit(this.iframesFrames)) return;

    const result = applyHit(this.pips, this.damagePips, knockbackDir);
    const delta = result.pips - this.pips;
    this.pips = result.pips;
    this.player.body.setVelocityX(result.knockbackVx);
    this.player.body.setVelocityY(result.knockbackVy);
    this.iframesFrames = startCountdown(IFRAMES_FRAMES);
    this.knockbackLockFrames = startCountdown(KNOCKBACK_LOCK_FRAMES);
    gameEvents.emit('player:healthChanged', { pips: this.pips, delta, cause: 'enemyNut' });

    if (result.lethal) this.respawn();
  }

  private destroyEnemyNut(sprite: Rect): void {
    const index = this.enemyNuts.indexOf(sprite);
    if (index >= 0) this.enemyNuts.splice(index, 1);
    sprite.destroy();
  }

  private stepEnemies(dtS: number): void {
    for (const enemy of this.enemies) {
      enemy.truced = this.isInTruceZone(enemy.sprite.x, enemy.sprite.y);
      if (enemy.truced) {
        // Truce zone (GDD §10.5): passive, walks to drink -- no attack, no stomp threat, never a
        // hit source. A gray-box simplification of "walks to drink" is simply standing down.
        enemy.sprite.body.setVelocityX(0);
        enemy.sprite.setFillStyle(0x4a8a4a);
        continue;
      }

      const stomped = this.checkStomp(enemy);
      if (stomped) this.forceEnemyFlee(enemy);

      if (enemy.script === 'lobber') {
        this.stepLobberEnemy(enemy, dtS);
      } else if (enemy.script === 'charger') {
        this.stepChargerEnemy(enemy, dtS);
      } else {
        this.stepTurretEnemy(enemy, dtS);
      }
    }
  }

  private stepTurretEnemy(enemy: EnemyRuntime, dtS: number): void {
    const distanceTiles = Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, this.player.x, this.player.y) / TILE_PX;
    const playerInRange = distanceTiles <= TURRET_TRIGGER_RANGE_TILES;

    const result = stepTurret(enemy.turretState, dtS, { playerInRange, hit: false, calmed: false });
    enemy.turretState = result.state;

    if (result.didLunge) {
      const dir = this.player.x < enemy.sprite.x ? -1 : 1;
      const lungeRect = {
        x: dir === 1 ? enemy.sprite.x : enemy.sprite.x - TURRET_LUNGE_FORWARD_TILES * TILE_PX,
        y: enemy.sprite.y - TURRET_LUNGE_HEIGHT_TILES * TILE_PX,
        width: TURRET_LUNGE_FORWARD_TILES * TILE_PX,
        height: TURRET_LUNGE_HEIGHT_TILES * TILE_PX,
      };
      if (Phaser.Geom.Intersects.RectangleToRectangle(lungeRect as Phaser.Geom.Rectangle, this.player.getBounds())) {
        this.applyHitToPlayer(dir as -1 | 1);
      }
    }

    const hidden = enemy.turretState.phase === 'hidden';
    enemy.sprite.setVisible(!hidden);
    enemy.sprite.body.enable = !hidden;
    const tint = enemy.turretState.phase === 'telegraph' ? 0xf2e94e : enemy.turretState.phase === 'lunge' ? 0xb84a4a : 0x4a8a4a;
    enemy.sprite.setFillStyle(tint);
  }

  private stepLobberEnemy(enemy: EnemyRuntime, dtS: number): void {
    const body = enemy.sprite.body;

    if (enemy.quillPig) {
      const distanceTiles = Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, this.player.x, this.player.y) / TILE_PX;
      const rangeGate = distanceTiles <= QUILL_PIG_TRIGGER_RANGE_TILES;
      const result = stepLobber(enemy.lobberState, dtS, false, rangeGate, QUILL_PIG_CYCLE_S, QUILL_PIG_TELEGRAPH_S);
      enemy.lobberState = result.state;
      if (result.didThrow) this.spawnQuillShots(enemy);

      if (enemy.lobberState.phase === 'fleeing') {
        const fleeDir = enemy.sprite.x < this.player.x ? -1 : 1;
        body.setVelocityX(fleeDir * RUN_SPEED_PX_S * 1.2);
      } else if (enemy.lobberState.phase === 'patrol') {
        body.setVelocityX(enemy.direction * QUILL_PIG_PATROL_SPEED_PX_S);
        if (enemy.sprite.x <= enemy.patrolLeft) enemy.direction = 1;
        if (enemy.sprite.x >= enemy.patrolRight) enemy.direction = -1;
      } else {
        body.setVelocityX(0);
      }
      const tint = enemy.lobberState.phase === 'telegraph' ? 0xf2e94e : enemy.lobberState.phase === 'fleeing' ? 0x888888 : 0x8a6a4a;
      enemy.sprite.setFillStyle(tint);
      return;
    }

    const result = stepLobber(enemy.lobberState, dtS, false);
    enemy.lobberState = result.state;
    if (result.didThrow) this.spawnEnemyNut(enemy);

    if (enemy.lobberState.phase === 'fleeing') {
      const fleeDir = enemy.sprite.x < this.player.x ? -1 : 1;
      body.setVelocityX(fleeDir * RUN_SPEED_PX_S * 1.2);
    } else {
      body.setVelocityX(0);
    }
    const tint = enemy.lobberState.phase === 'telegraph' ? 0xf2e94e : enemy.lobberState.phase === 'fleeing' ? 0x888888 : 0xb84a4a;
    enemy.sprite.setFillStyle(tint);
  }

  /** Quill-pig straight shots (GDD §7.7 #4): one low (0.5 tile), one high (1.5 tiles), both
   * straight ahead rather than the langur's arc. */
  private spawnQuillShots(enemy: EnemyRuntime): void {
    const dir = enemy.sprite.x < this.player.x ? 1 : -1;
    for (const heightTiles of [QUILL_PIG_LOW_HEIGHT_TILES, QUILL_PIG_HIGH_HEIGHT_TILES]) {
      const sprite = this.add.rectangle(enemy.sprite.x, enemy.sprite.y - heightTiles * TILE_PX, 4, 4, 0x8a6a4a) as Rect;
      this.physics.add.existing(sprite);
      sprite.body.setAllowGravity(false);
      sprite.body.setVelocity(dir * QUILL_PIG_SHOT_SPEED_PX_S, 0);
      this.physics.add.collider(sprite, this.groundLayer, () => this.destroyEnemyNut(sprite));
      this.enemyNuts.push(sprite);
      this.time.delayedCall(2000, () => {
        if (this.enemyNuts.includes(sprite)) this.destroyEnemyNut(sprite);
      });
    }
  }

  private stepChargerEnemy(enemy: EnemyRuntime, dtS: number): void {
    const body = enemy.sprite.body;

    if (enemy.chargerState.phase === 'patrol' && enemy.thief) {
      enemy.targetStoneIndex = this.findNearestFloorStone(enemy.sprite.x, enemy.sprite.y);
    }
    const stoneNearby = enemy.thief && enemy.targetStoneIndex !== null;
    let reachedStone = false;
    if (enemy.chargerState.phase === 'stealing' && enemy.targetStoneIndex !== null) {
      const target = this.stoneSprites[enemy.targetStoneIndex];
      reachedStone = Math.abs(enemy.sprite.x - target.x) <= TABAQUI_STEAL_REACH_PX;
    }
    const playerInLine =
      enemy.lunge &&
      enemy.chargerState.phase === 'patrol' &&
      Math.abs(enemy.sprite.y - this.player.y) < TILE_PX * 2 &&
      Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, this.player.x, this.player.y) / TILE_PX <= DOG_LUNGE_RANGE_TILES;

    const result = stepCharger(enemy.chargerState, dtS, { hitOrStomped: false, thief: enemy.thief, stoneNearby, reachedStone, lungeEnabled: enemy.lunge, playerInLine });
    enemy.chargerState = result.state;
    if (result.pickedUpStone && enemy.targetStoneIndex !== null) {
      enemy.carriedStoneIndex = enemy.targetStoneIndex;
      this.stoneCarried[enemy.carriedStoneIndex] = true;
      this.stoneSprites[enemy.carriedStoneIndex].setVisible(false);
    }
    if (result.startedCharging) {
      enemy.chargeDir = this.player.x < enemy.sprite.x ? -1 : 1;
    }

    switch (enemy.chargerState.phase) {
      case 'patrol':
        body.setVelocityX(enemy.direction * CHARGER_PATROL_SPEED_PX_S);
        if (enemy.sprite.x <= enemy.patrolLeft) enemy.direction = 1;
        if (enemy.sprite.x >= enemy.patrolRight) enemy.direction = -1;
        break;
      case 'telegraph':
        body.setVelocityX(0);
        break;
      case 'stealing': {
        if (enemy.targetStoneIndex !== null) {
          const target = this.stoneSprites[enemy.targetStoneIndex];
          const dir = target.x < enemy.sprite.x ? -1 : 1;
          body.setVelocityX(dir * TABAQUI_CARRY_SPEED_PX_S);
        }
        break;
      }
      case 'carrying': {
        body.setVelocityX(enemy.direction * TABAQUI_CARRY_SPEED_PX_S);
        if (enemy.sprite.x <= enemy.patrolLeft) enemy.direction = 1;
        if (enemy.sprite.x >= enemy.patrolRight) enemy.direction = -1;
        if (enemy.carriedStoneIndex !== null) {
          this.stoneSprites[enemy.carriedStoneIndex].setPosition(enemy.sprite.x, enemy.sprite.y - 10);
        }
        break;
      }
      case 'charging':
        body.setVelocityX(enemy.chargeDir * DOG_LUNGE_SPEED_PX_S);
        break;
      case 'recovering':
        body.setVelocityX(0);
        break;
      case 'fleeing': {
        const fleeDir = enemy.sprite.x < this.player.x ? -1 : 1;
        body.setVelocityX(fleeDir * RUN_SPEED_PX_S * 1.2);
        break;
      }
    }

    if (enemy.contactDamage && enemy.chargerState.phase !== 'fleeing' && Phaser.Geom.Intersects.RectangleToRectangle(enemy.sprite.getBounds(), this.player.getBounds())) {
      this.applyHitToPlayer(enemy.sprite.x < this.player.x ? 1 : -1);
    }

    const tint =
      enemy.chargerState.phase === 'telegraph'
        ? 0xf2e94e
        : enemy.chargerState.phase === 'fleeing'
          ? 0x888888
          : enemy.chargerState.phase === 'carrying'
            ? 0xc9b458
            : enemy.chargerState.phase === 'charging'
              ? 0xb84a4a
              : 0x6a8a4a;
    enemy.sprite.setFillStyle(tint);
  }

  private findNearestFloorStone(x: number, y: number): number | null {
    const rangePx = TABAQUI_STEAL_RANGE_TILES * TILE_PX;
    let best: number | null = null;
    let bestDist = Infinity;
    for (let i = 0; i < this.stoneSprites.length; i++) {
      if (this.stoneStates[i].collected || this.stoneCarried[i]) continue;
      const sprite = this.stoneSprites[i];
      const dist = Phaser.Math.Distance.Between(x, y, sprite.x, sprite.y);
      if (dist <= rangePx && dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    }
    return best;
  }

  private checkStomp(enemy: EnemyRuntime): boolean {
    if (enemy.script === 'turret' && !turretIsStompable()) return false;
    if (!stompScatters(true)) return false;
    const phase = enemy.script === 'lobber' ? enemy.lobberState.phase : enemy.chargerState.phase;
    if (phase === 'fleeing') return false;
    const body = this.player.body;
    const falling = body.velocity.y > 0;
    if (!falling) return false;
    if (!Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), enemy.sprite.getBounds())) return false;
    const playerFeetY = this.player.y + this.player.height / 2;
    if (playerFeetY > enemy.sprite.y - enemy.sprite.height / 2 + 4) return false;

    const heightPx = stompBounceHeightPx(false);
    const bounceVy = -Math.sqrt(2 * RISING_GRAVITY_PX_S2 * heightPx);
    body.setVelocityY(bounceVy);
    return true;
  }

  private spawnEnemyNut(enemy: EnemyRuntime): void {
    const dir = enemy.sprite.x < this.player.x ? 1 : -1;
    const sprite = this.add.rectangle(enemy.sprite.x, enemy.sprite.y, 4, 4, 0xb84a4a) as Rect;
    this.physics.add.existing(sprite);
    sprite.body.setVelocity(dir * NUT_SPEED_FOR_RANGE, -40);
    sprite.body.setGravityY(RISING_GRAVITY_PX_S2 * 0.25);
    this.physics.add.collider(sprite, this.groundLayer, () => this.destroyEnemyNut(sprite));
    this.enemyNuts.push(sprite);
    this.time.delayedCall(2000, () => {
      if (this.enemyNuts.includes(sprite)) this.destroyEnemyNut(sprite);
    });
  }

  private stepSwing(_dtS: number, snapshot: InputSnapshot): void {
    const amplitudeRad = (SWING_AMPLITUDE_DEG * Math.PI) / 180;

    for (let i = 0; i < this.swings.length; i++) {
      const swing = this.swings[i];
      const k = pendulumKinematics(swing.pivotX, swing.pivotY, swing.lengthPx, amplitudeRad, swing.periodS, this.simTimeS);
      swing.sprite.setPosition(k.x, k.y);
      swing.sprite.body.reset(k.x, k.y);

      if (this.ridingSwingIndex === i) {
        this.player.setPosition(k.x, k.y + 8);
        this.player.body.setVelocity(k.vx, k.vy);

        if (snapshot.pressed.jump) {
          this.ridingSwingIndex = null;
          this.player.body.setAllowGravity(true);
          this.player.body.setVelocityX(swingReleaseVx(k.vx, JUMP_HORIZONTAL_BOOST_PX_S, RUN_SPEED_PX_S));
          this.player.body.setVelocityY(-JUMP_LAUNCH_SPEED_PX_S);
        }
      } else if (this.ridingSwingIndex === null) {
        const near = Phaser.Math.Distance.Between(this.player.x, this.player.y, k.x, k.y) < 12;
        if (near && !this.climbing) {
          this.ridingSwingIndex = i;
          this.player.body.setAllowGravity(false);
        }
      }
    }
  }

  private stepCrumblePlatforms(): void {
    for (const entry of this.crumblePlatforms) {
      entry.state = stepCrumble(entry.state, this.simTimeS);
      const hasCollision = crumbleHasCollision(entry.state, this.simTimeS);
      entry.sprite.body.enable = hasCollision;
      entry.sprite.setVisible(hasCollision);
      if (entry.state.respawned) {
        entry.state = { crumbling: false, fallenAtS: null, respawned: false };
      }
    }
  }

  // --- S4 carry platforms (GDD §10.5-10.6): Hathi's sons, buffalo (advanceOnHit), Rama (B2) -----

  /** advanceOnHit (buffalo, GDD §10.6): a nut on its rump sends it charging toward its second
   * waypoint, breaking any thorn fence it meets; it stays there once it arrives (a one-time
   * path-opener, not a perpetual shuttle -- the GDD's "sends it charging to the next waypoint"
   * reads as a single unlock, not a new cycle). */
  private registerBuffaloHit(sprite: Rect): void {
    const entry = this.carryPlatforms.find((c) => c.sprite === sprite);
    if (!entry || !entry.advanceOnHit || entry.advancing || entry.waypoints.length < 2) return;
    entry.advancing = true;
  }

  private stepCarryPlatforms(dtS: number): void {
    for (const c of this.carryPlatforms) {
      const prevX = c.sprite.x;
      const prevY = c.sprite.y;
      let next: { x: number; y: number };

      if (c.advanceOnHit) {
        if (c.advancing) {
          const target = c.waypoints[1];
          const dir = Math.sign(target.x - prevX) || 1;
          const distRemaining = Math.abs(target.x - prevX);
          const step = Math.min(distRemaining, BUFFALO_ADVANCE_SPEED_PX_S * dtS);
          next = { x: prevX + dir * step, y: c.waypoints[0].y };
          if (step >= distRemaining) c.advancing = false; // arrived: stays, path stays open
        } else {
          next = { x: prevX, y: prevY };
        }
      } else {
        const pos = carryPosition(c.waypoints, c.speedPxS, c.waitS, this.simTimeS);
        next = { x: pos.x, y: pos.y };
      }

      c.sprite.body.reset(next.x, next.y);
      const dx = next.x - prevX;
      const dy = next.y - prevY;
      if (dx === 0 && dy === 0) continue;

      // Break any thorn fence this (advancing) platform now overlaps (GDD §10.6's "breakable tag").
      if (c.advanceOnHit) {
        for (const fence of this.fences) {
          if (fence.broken) continue;
          if (Phaser.Geom.Intersects.RectangleToRectangle(c.sprite.getBounds(), fence.sprite.getBounds())) {
            fence.broken = true;
            fence.sprite.setVisible(false);
            fence.sprite.body.enable = false;
          }
        }
      }

      // A rider standing on top is carried along (Arcade doesn't do this for free). Geometric
      // proximity only, deliberately not Arcade's touching.down/blocked.down: those can read
      // false for a single tick even at rest (D95h), and here the platform's own body is
      // teleported every tick via body.reset(), which can desync Arcade's own contact flags far
      // more than a static floor ever does. stepPlayer (which ran earlier this same tick) still
      // applied normal gravity since it never saw a real ground contact, so riding must pin the
      // player's y to the platform's surface outright, not merely nudge it by this tick's dy, or
      // the accumulating fall wins and the rider drops through within a few ticks.
      const topYBefore = prevY - c.sprite.height / 2;
      const feetY = this.player.y + this.player.height / 2;
      const wasOnTop = Math.abs(this.player.x - prevX) < c.sprite.width / 2 + 6 && feetY >= topYBefore - 6 && feetY <= topYBefore + 14;
      const jumpingAway = this.player.body.velocity.y < 0;
      if (wasOnTop && !jumpingAway) {
        const topYAfter = next.y - c.sprite.height / 2;
        this.player.setPosition(this.player.x + dx, topYAfter - this.player.height / 2);
        this.player.body.setVelocityY(0);
      }
    }
  }

  private stepBouncePads(): void {
    for (const pad of this.bouncePads) {
      pad.cooldownS = Math.max(0, pad.cooldownS - 1 / 60);
      if (pad.cooldownS > 0) continue;
      if (!Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), pad.sprite.getBounds())) continue;
      if (this.player.body.velocity.y < 0) continue; // only launches a landing/standing Mowgli
      const { vx, vy } = trunkLaunchVelocity(TRUNK_LAUNCH_RANGE_TILES, RISING_GRAVITY_PX_S2, JUMP_LAUNCH_SPEED_PX_S, TILE_PX);
      this.player.body.setVelocity(this.facing * vx, vy);
      pad.cooldownS = 1; // a second's grace so the same touch doesn't re-trigger every tick
    }
  }

  /** Truce zone (GDD §10.5, S5 truce flag): every enemy within it is passive, and Mowgli's own
   * throws drop at his feet with a soft "no" instead of flying. */
  private isInTruceZone(x: number, y: number): boolean {
    return this.truceZones.some((z) => x > z.x && x < z.x + z.w && y > z.y && y < z.y + z.h);
  }

  /** Kaa's head-lift (GDD §10.8): a 0.6 s crouch-hold starts the rise; riding it reuses the same
   * geometric on-top pin stepCarryPlatforms uses, for the same reason (D96j/D96b): Arcade's own
   * touching/blocked flags desync from a body repositioned by hand every tick. */
  private stepHeadLifts(dtS: number, snapshot: InputSnapshot): void {
    for (const lift of this.headLifts) {
      const near = Phaser.Math.Distance.Between(this.player.x, this.player.y, lift.sprite.x, lift.baseY) < GATE_INTERACT_RANGE_PX;
      const holding = lift.state.phase === 'idle' && near && snapshot.held.down;
      lift.holdFrames = tickCountUp(lift.holdFrames, holding, HEAD_LIFT_HOLD_FRAMES);
      const holdComplete = isCountUpComplete(lift.holdFrames, HEAD_LIFT_HOLD_FRAMES);
      if (holdComplete) lift.holdFrames = 0;

      const prevY = lift.sprite.y;
      lift.state = stepHeadLift(lift.state, dtS, holdComplete, HEAD_LIFT_RISE_S, HEAD_LIFT_WAIT_AT_TOP_S, HEAD_LIFT_LOWER_S);
      const fraction = headLiftHeightFraction(lift.state, HEAD_LIFT_RISE_S, HEAD_LIFT_LOWER_S);
      const nextY = lift.baseY - fraction * HEAD_LIFT_RISE_TILES * TILE_PX;
      lift.sprite.body.reset(lift.baseX, nextY);
      const dy = nextY - prevY;
      if (dy === 0) continue;

      const topY = nextY - lift.sprite.height / 2;
      const prevTopY = prevY - lift.sprite.height / 2;
      const feetY = this.player.y + this.player.height / 2;
      const wasOnTop = Math.abs(this.player.x - lift.baseX) < lift.sprite.width / 2 + 6 && feetY >= prevTopY - 6 && feetY <= prevTopY + 14;
      if (wasOnTop && this.player.body.velocity.y >= 0) {
        this.player.setPosition(this.player.x, topY - this.player.height / 2);
        this.player.body.setVelocityY(0);
      }
    }
  }

  // --- S7 Boss encounter (GDD §8.1-8.2) ----------------------------------------------------------

  private stepBossDoor(): void {
    if (!this.bossDoorZone || this.bossActive) return;
    const zone = this.bossDoorZone;
    const overlapping = this.player.x > zone.x && this.player.x < zone.x + zone.w && this.player.y > zone.y && this.player.y < zone.y + zone.h;
    if (!overlapping) return;

    this.bossActive = true;
    // "Checkpoint at every boss door, instant retry" (GDD §8.1). zone.y+zone.h is the trigger's
    // floor-level bottom edge (the zone itself spans upward from there so a standing player's
    // body-center falls inside it), which is the right "feet y" for a respawn point.
    this.checkpoint = activateCheckpoint({ checkpointId: 'boss-B1', x: zone.x, y: zone.y + zone.h, spawnFacing: 1 });
    this.pips = healOnCheckpoint(LEAF_PIPS_MAX);
  }

  private stepBossFight(dtS: number, snapshot: InputSnapshot): void {
    if (!this.bossActive || !this.bossHurtboxSprite || !this.bossHazardSprite) return;

    if (this.bossState.defeated) {
      this.stepBossVictory(snapshot);
      return;
    }

    this.bossState = stepBoss(this.bossState, dtS, this.bossData, this.tierId);
    const attack = currentAttack(this.bossState, this.bossData);
    const hittable = isHittable(this.bossState);
    if (this.bossId === 'B2') this.updateBossHazardB2(attack, this.bossState.sub);
    else if (this.bossId === 'B3') this.updateBossHazardB3(attack, this.bossState.sub);
    else this.updateBossHazardB1(attack, this.bossState.sub);

    this.bossHurtboxSprite.setVisible(hittable);
    this.bossHurtboxSprite.body.enable = hittable;

    if (hittable) {
      for (const nut of [...this.nuts]) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(nut.sprite.getBounds(), this.bossHurtboxSprite.getBounds())) {
          this.bossState = registerHit(this.bossState, this.bossData, this.tierId);
          this.destroyNut(nut.sprite);
          break;
        }
      }
    }
  }

  /** Phase-specific hazard shape (GDD §8.2): a rim nut rain, a festoon pendulum sweep reusing
   * the same pendulumKinematics traversal swings use, then an advancing line. Each reuses an S3
   * script's own math rather than inventing a fifth movement system (GDD §8.1). */
  private updateBossHazardB1(attack: ReturnType<typeof currentAttack>, sub: BossAttackSub): void {
    if (!this.bossDoorZone || !this.bossHazardSprite || !this.bossHurtboxSprite) return;
    const anchorX = this.bossDoorZone.x;
    const anchorY = this.bossDoorZone.y + this.bossDoorZone.h - 20;

    switch (this.bossState.phaseIndex) {
      case 0: {
        this.bossHurtboxSprite.setPosition(anchorX, anchorY);
        if (sub === 'active' && !this.bossPhaseFired) {
          this.bossPhaseFired = true;
          this.spawnBossNut(anchorX, anchorY);
        }
        if (sub !== 'active') this.bossPhaseFired = false;
        this.bossHazardSprite.setVisible(false);
        this.bossHazardSprite.body.enable = false;
        break;
      }
      case 1: {
        const amplitudeRad = (SWING_AMPLITUDE_DEG * Math.PI) / 180;
        const k = pendulumKinematics(anchorX, anchorY - 24, 24, amplitudeRad, SWING_PERIOD_S, this.simTimeS);
        if (sub === 'active') {
          this.bossHazardSprite.setVisible(true);
          this.bossHazardSprite.body.enable = true;
          this.bossHazardSprite.setPosition(k.x, k.y);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.bossHazardSprite.getBounds(), this.player.getBounds())) {
            this.applyHitToPlayer(this.player.x < k.x ? -1 : 1);
          }
        } else {
          this.bossHazardSprite.setVisible(false);
          this.bossHazardSprite.body.enable = false;
        }
        this.bossHurtboxSprite.setPosition(anchorX, anchorY);
        break;
      }
      case 2:
      default: {
        if (sub === 'active') {
          this.bossHazardSprite.setVisible(true);
          this.bossHazardSprite.body.enable = true;
          const t = Math.min(1, this.bossState.timerS / attack.activeS);
          const x = Phaser.Math.Linear(anchorX + 60, anchorX - 40, t);
          this.bossHazardSprite.setPosition(x, anchorY);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.bossHazardSprite.getBounds(), this.player.getBounds())) {
            this.applyHitToPlayer(1);
          }
        } else {
          this.bossHazardSprite.setVisible(false);
          this.bossHazardSprite.body.enable = false;
        }
        this.bossHurtboxSprite.setPosition(anchorX - 40, anchorY);
        break;
      }
    }
  }

  /** B2 The Lame One in the Ravine (GDD §8.3): Shere Khan lame-charges and roars in phase 1,
   * pounces onto a boulder in phase 2, then swipes and drops falling rocks while cornered on
   * Rama's back in phase 3. Each attack reuses an S3 script's own math, per the GDD's own rule
   * (GDD §8.1), exactly like B1's hazards above. Tabaqui's living boulder-landing telegraph
   * (GDD §8.3 beat 4) uses its own documented fallback here: a dust mark, not a running NPC
   * (DECISIONS.md), since Tabaqui never otherwise appears past L1/B2's own arena. */
  private updateBossHazardB2(attack: ReturnType<typeof currentAttack>, sub: BossAttackSub): void {
    if (!this.bossDoorZone || !this.bossHazardSprite || !this.bossHurtboxSprite) return;
    const anchorX = this.bossDoorZone.x;
    const anchorY = this.bossDoorZone.y + this.bossDoorZone.h - 20;
    this.bossHurtboxSprite.setPosition(anchorX, anchorY - 8);

    switch (attack.id) {
      case 'lameCharge': {
        if (sub === 'active') {
          this.bossHazardSprite.setVisible(true);
          this.bossHazardSprite.body.enable = true;
          const halfSpanPx = (B2_LAME_CHARGE_SPEED_PX_S * attack.activeS) / 2;
          const t = Math.min(1, this.bossState.timerS / attack.activeS);
          const x = Phaser.Math.Linear(anchorX + halfSpanPx, anchorX - halfSpanPx, t);
          this.bossHazardSprite.setPosition(x, anchorY);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.bossHazardSprite.getBounds(), this.player.getBounds())) {
            this.applyHitToPlayer(this.player.x < x ? -1 : 1);
          }
        } else {
          this.bossHazardSprite.setVisible(false);
          this.bossHazardSprite.body.enable = false;
        }
        break;
      }
      case 'roar': {
        if (sub === 'active' && !this.bossPhaseFired) {
          this.bossPhaseFired = true;
          const pushDir = this.player.x < anchorX ? -1 : 1;
          if (Math.abs(this.player.x - anchorX) < 100 && (this.player.body.touching.down || this.player.body.blocked.down)) {
            this.player.body.setVelocityX(pushDir * -RUN_SPEED_PX_S * B2_ROAR_PUSH_TILES);
          }
        }
        if (sub !== 'active') this.bossPhaseFired = false;
        this.bossHazardSprite.setVisible(false);
        this.bossHazardSprite.body.enable = false;
        break;
      }
      case 'pounce': {
        if (sub === 'active') {
          this.bossHazardSprite.setVisible(true);
          this.bossHazardSprite.body.enable = true;
          const t = Math.min(1, this.bossState.timerS / attack.activeS);
          const x = Phaser.Math.Linear(anchorX - B2_POUNCE_ARC_TILES * TILE_PX, anchorX, t);
          const arcY = anchorY - Math.sin(t * Math.PI) * 24;
          this.bossHazardSprite.setPosition(x, arcY);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.bossHazardSprite.getBounds(), this.player.getBounds())) {
            this.applyHitToPlayer(1);
          }
        } else {
          this.bossHazardSprite.setVisible(false);
          this.bossHazardSprite.body.enable = false;
        }
        break;
      }
      case 'swipe': {
        if (sub === 'active') {
          this.bossHazardSprite.setVisible(true);
          this.bossHazardSprite.body.enable = true;
          this.bossHazardSprite.setPosition(anchorX, anchorY - B2_SWIPE_HEIGHT_TILES * TILE_PX);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.bossHazardSprite.getBounds(), this.player.getBounds())) {
            this.applyHitToPlayer(1);
          }
        } else {
          this.bossHazardSprite.setVisible(false);
          this.bossHazardSprite.body.enable = false;
        }
        break;
      }
      case 'fallingRock':
      default: {
        const lane = Math.floor(this.bossState.timerS / B2_FALLING_ROCK_INTERVAL_S) % B2_FALLING_ROCK_LANES;
        if (sub === 'active') {
          this.bossHazardSprite.setVisible(true);
          this.bossHazardSprite.body.enable = true;
          this.bossHazardSprite.setPosition(anchorX - 40 + lane * 40, anchorY);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.bossHazardSprite.getBounds(), this.player.getBounds())) {
            this.applyHitToPlayer(1);
          }
        } else {
          this.bossHazardSprite.setVisible(false);
          this.bossHazardSprite.body.enable = false;
        }
        break;
      }
    }
  }

  /** B3 Thuu, the White Hood (GDD §8.4): strikes at the player, a coil sweep, a treasure toss on
   * marked spots, a double strike, and a slow coin-dust arc. Every attack reuses an S3 script's
   * own math, per the GDD's own rule (GDD §8.1), exactly like B1/B2's hazards above. Thuu's
   * "strike aimed at where Mowgli stood 0.6 s ago" is simplified to the player's position at the
   * moment the strike lands (the active sub starts), not a tracked position-history buffer. */
  private updateBossHazardB3(attack: ReturnType<typeof currentAttack>, sub: BossAttackSub): void {
    if (!this.bossDoorZone || !this.bossHazardSprite || !this.bossHurtboxSprite) return;
    const anchorX = this.bossDoorZone.x;
    const anchorY = this.bossDoorZone.y + this.bossDoorZone.h - 20;
    this.bossHurtboxSprite.setPosition(anchorX, anchorY - 8);

    switch (attack.id) {
      case 'strike': {
        if (sub === 'active') {
          if (!this.bossPhaseFired) {
            this.bossPhaseFired = true;
            this.bossHazardSprite.setVisible(true);
            this.bossHazardSprite.body.enable = true;
            const dir = this.player.x < anchorX ? -1 : 1;
            this.bossHazardSprite.setPosition(this.player.x, anchorY - B3_STRIKE_HEIGHT_TILES * TILE_PX);
            if (Math.abs(this.player.x - anchorX) <= B3_STRIKE_REACH_TILES * TILE_PX) this.applyHitToPlayer(dir);
          }
        } else {
          this.bossPhaseFired = false;
          this.bossHazardSprite.setVisible(false);
          this.bossHazardSprite.body.enable = false;
        }
        break;
      }
      case 'coilSweep': {
        if (sub === 'active') {
          this.bossHazardSprite.setVisible(true);
          this.bossHazardSprite.body.enable = true;
          this.bossHazardSprite.setPosition(anchorX, anchorY);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.bossHazardSprite.getBounds(), this.player.getBounds()) && (this.player.body.touching.down || this.player.body.blocked.down)) {
            this.applyHitToPlayer(1);
          }
        } else {
          this.bossHazardSprite.setVisible(false);
          this.bossHazardSprite.body.enable = false;
        }
        break;
      }
      case 'treasureToss': {
        const spot = Math.floor(this.bossState.timerS / (attack.activeS / B3_TREASURE_TOSS_SPOTS)) % B3_TREASURE_TOSS_SPOTS;
        if (sub === 'active') {
          this.bossHazardSprite.setVisible(true);
          this.bossHazardSprite.body.enable = true;
          this.bossHazardSprite.setPosition(anchorX - 40 + spot * 40, anchorY);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.bossHazardSprite.getBounds(), this.player.getBounds())) {
            this.applyHitToPlayer(1);
          }
        } else {
          this.bossHazardSprite.setVisible(false);
          this.bossHazardSprite.body.enable = false;
        }
        break;
      }
      case 'doubleStrike': {
        if (sub === 'active') {
          this.bossHazardSprite.setVisible(true);
          this.bossHazardSprite.body.enable = true;
          this.bossHazardSprite.setPosition(this.player.x, anchorY - B3_STRIKE_HEIGHT_TILES * TILE_PX);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.bossHazardSprite.getBounds(), this.player.getBounds())) {
            this.applyHitToPlayer(this.player.x < anchorX ? -1 : 1);
          }
        } else {
          this.bossHazardSprite.setVisible(false);
          this.bossHazardSprite.body.enable = false;
        }
        break;
      }
      case 'coinDust':
      default: {
        if (sub === 'active') {
          this.bossHazardSprite.setVisible(true);
          this.bossHazardSprite.body.enable = true;
          const t = Math.min(1, this.bossState.timerS / attack.activeS);
          const x = Phaser.Math.Linear(anchorX + 50, anchorX - 50, t);
          this.bossHazardSprite.setPosition(x, anchorY);
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.bossHazardSprite.getBounds(), this.player.getBounds())) {
            this.applyHitToPlayer(1);
          }
        } else {
          this.bossHazardSprite.setVisible(false);
          this.bossHazardSprite.body.enable = false;
        }
        break;
      }
    }
  }

  private spawnBossNut(x: number, y: number): void {
    const dir = x < this.player.x ? 1 : -1;
    const sprite = this.add.rectangle(x, y, 4, 4, 0xb84a4a) as Rect;
    this.physics.add.existing(sprite);
    sprite.body.setVelocity(dir * NUT_SPEED_FOR_RANGE, -40);
    sprite.body.setGravityY(RISING_GRAVITY_PX_S2 * 0.25);
    this.physics.add.collider(sprite, this.groundLayer, () => this.destroyEnemyNut(sprite));
    this.enemyNuts.push(sprite);
    this.time.delayedCall(2000, () => {
      if (this.enemyNuts.includes(sprite)) this.destroyEnemyNut(sprite);
    });
  }

  /** The Dance resolution (GDD §8.2 beat 7): a 2 s crouch-hold on each of Bagheera and Baloo. */
  private stepBossVictory(snapshot: InputSnapshot): void {
    this.bossHurtboxSprite?.setVisible(false);
    if (this.bossHurtboxSprite) this.bossHurtboxSprite.body.enable = false;
    this.bossHazardSprite?.setVisible(false);
    if (this.bossHazardSprite) this.bossHazardSprite.body.enable = false;

    for (const helper of this.bossHelpers) {
      if (helper.held) continue;
      const near = Phaser.Math.Distance.Between(this.player.x, this.player.y, helper.sprite.x, helper.sprite.y) < GATE_INTERACT_RANGE_PX;
      const holding = near && snapshot.held.down;
      helper.holdFrames = tickCountUp(helper.holdFrames, holding, interactRequirementFrames('bossHold'));
      if (isCountUpComplete(helper.holdFrames, interactRequirementFrames('bossHold'))) {
        helper.held = true;
        helper.sprite.setFillStyle(0x88cc88);
      }
    }
  }

  private bossVictoryComplete(): boolean {
    return this.bossState.defeated && this.bossHelpers.length > 0 && this.bossHelpers.every((h) => h.held);
  }

  private stepBossGates(): void {
    if (this.bossGates.length === 0 || !this.bossVictoryComplete()) return;
    for (const gate of this.bossGates) {
      if (gate.opened) continue;
      gate.opened = true;
      gate.sprite.setVisible(false);
      gate.sprite.body.enable = false;
    }
  }

  /** Buldeo (GDD §7.7, §10.7): a pursuit hazard with no stealth system, not an enemy entry --
   * he takes no hits, is never stomped or scared, and this is his own small state machine. */
  private stepBuldeo(dtS: number): void {
    if (!this.buldeo) return;
    const b = this.buldeo;
    const body = b.sprite.body;

    const inTallGrass = this.tallGrassZones.some((z) => this.player.x > z.x && this.player.x < z.x + z.w && this.player.y > z.y && this.player.y < z.y + z.h);
    const detectX = b.direction === 1 ? b.sprite.x : b.sprite.x - BULDEO_DETECT_WIDTH_TILES * TILE_PX;
    const detectRect = {
      x: detectX,
      y: b.sprite.y - BULDEO_DETECT_HEIGHT_TILES * TILE_PX,
      width: BULDEO_DETECT_WIDTH_TILES * TILE_PX,
      height: BULDEO_DETECT_HEIGHT_TILES * TILE_PX,
    };
    const playerInDetectZone = !inTallGrass && Phaser.Geom.Intersects.RectangleToRectangle(detectRect as Phaser.Geom.Rectangle, this.player.getBounds());

    b.state = stepBuldeoScript(b.state, dtS, { playerInDetectZone });

    switch (b.state.phase) {
      case 'patrol':
        body.setVelocityX(b.direction * BULDEO_ROUTE_SPEED_PX_S);
        if (b.sprite.x <= b.patrolLeft) b.direction = 1;
        if (b.sprite.x >= b.patrolRight) b.direction = -1;
        break;
      case 'detecting':
        body.setVelocityX(0);
        break;
      case 'chasing': {
        const chaseDir: -1 | 1 = this.player.x < b.sprite.x ? -1 : 1;
        body.setVelocityX(chaseDir * BULDEO_CHASE_SPEED_PX_S);
        b.direction = chaseDir;
        if (Phaser.Geom.Intersects.RectangleToRectangle(b.sprite.getBounds(), this.player.getBounds())) {
          this.applyHitToPlayer(chaseDir);
        }
        break;
      }
      case 'boasting':
        body.setVelocityX(0);
        break;
    }

    const tint = b.state.phase === 'detecting' ? 0xf2e94e : b.state.phase === 'chasing' ? 0xb84a4a : 0xd8a657;
    b.sprite.setFillStyle(tint);
  }

  /** Rope cutting (GDD §10.7): a 0.8 s crouch-hold frees the follower of the same index. */
  private stepRopes(snapshot: InputSnapshot): void {
    for (const rope of this.ropes) {
      if (rope.cut) continue;
      const near = Phaser.Math.Distance.Between(this.player.x, this.player.y, rope.x, rope.y) < GATE_INTERACT_RANGE_PX;
      const holding = near && snapshot.held.down;
      rope.holdFrames = tickCountUp(rope.holdFrames, holding, interactRequirementFrames('rope'));
      if (isCountUpComplete(rope.holdFrames, interactRequirementFrames('rope'))) {
        rope.cut = true;
        rope.sprite.setVisible(false);
        const follower = this.followers.find((f) => f.index === rope.index);
        if (follower) {
          follower.active = true;
          follower.sprite.setVisible(true);
        }
      }
    }
  }

  /** Escort followers (GDD §10.7, Messua and her husband): collision-free, trailing the player
   * at a fixed offset once freed (the GDD's own documented fallback for a pathfinding follower). */
  private stepFollowers(): void {
    for (const follower of this.followers) {
      if (!follower.active) continue;
      const targetX = this.player.x - follower.index * 18 - 16;
      const targetY = this.player.y;
      const newX = Phaser.Math.Linear(follower.sprite.x, targetX, 0.08);
      const newY = Phaser.Math.Linear(follower.sprite.y, targetY, 0.08);
      follower.sprite.setPosition(newX, newY);
    }
  }

  /** L6's inverted quota (GDD §9.3): a jewel goes into the pouch on pickup and only banks at the
   * altar. Reuses the existing QuotaState machinery unchanged -- `stonesCollected` already is the
   * banked count once this step is wired in, so checkQuota/the HUD/the exit all just work. */
  private stepAltar(): void {
    if (!this.altarSprite || this.pouchCount === 0) return;
    if (!Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.altarSprite.getBounds())) return;
    this.stonesCollected += this.pouchCount;
    this.pouchCount = 0;
    gameEvents.emit('stones:collected', { count: this.stonesCollected, total: this.level.stones.length, index: -1, kind: 'jewel' });
  }

  /** Thuu's gate (GDD §10.8): opens once the (banked) quota is met -- a plain progression gate,
   * not tied to any boss fight. */
  private stepAltarGates(): void {
    if (this.altarGates.length === 0 || !this.quota.met) return;
    for (const gate of this.altarGates) {
      if (gate.opened) continue;
      gate.opened = true;
      gate.sprite.setVisible(false);
      gate.sprite.body.enable = false;
    }
  }

  private stepQuotaAndExit(): void {
    if (!this.quota.met) {
      const result = checkQuota(this.quota, this.stonesCollected, this.quotaValue);
      this.quota = result.state;
      if (result.justMet) {
        this.exitNpc = activateBeckon(this.exitNpc);
        gameEvents.emit('stones:collected', { count: this.stonesCollected, total: STONES_PER_LEVEL, index: -1, kind: 'moon' });
      }
    }

    if (!this.exitSprite) return;
    const overlapping = Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.exitSprite.getBounds());
    const result = touchExit(this.exitNpc, overlapping);
    this.exitNpc = result.state;
    this.exitSprite.setFillStyle(this.exitNpc.phase === 'beckon' ? 0xf2e94e : this.exitNpc.phase === 'exited' ? 0x88cc88 : 0x555555);

    if (result.exited && !this.ended) {
      this.ended = true;
      this.scene.start('Results', {
        stonesCollected: this.stonesCollected,
        elapsedS: this.simTimeS,
        deaths: this.deaths,
        fullMoon: this.stonesCollected >= STONES_PER_LEVEL,
      });
      this.scene.stop('Hud');
    }
  }

  // --- Read-only accessors for HudScene --------------------------------------------

  getDebugInfo() {
    return {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      vx: Math.round(this.player.body.velocity.x),
      vy: Math.round(this.player.body.velocity.y),
      coyoteFrames: this.coyoteFrames,
      bufferFrames: this.bufferFrames,
      state: this.climbing ? 'climbing' : this.ridingSwingIndex !== null ? 'swinging' : this.crouched ? 'crouched' : 'normal',
      pips: this.pips,
      stones: `${this.stonesCollected}/${this.level.stones.length}`,
      deaths: this.deaths,
      checkpoint: this.checkpoint.checkpointId,
    };
  }

  getHudInfo() {
    return {
      pips: this.pips,
      maxPips: LEAF_PIPS_MAX,
      stonesCollected: this.stonesCollected,
      quotaValue: this.quotaValue,
      quotaMet: this.quota.met,
      quotaJustMetAtS: this.quota.met ? this.simTimeS : null,
      exitPhase: this.exitNpc.phase,
      exitCharacterId: this.level.exit?.characterId ?? null,
      redFlowerMeterS: this.redFlower.meterS,
      redFlowerLit: this.redFlower.lit,
      currentThrowable: this.throwableOrder[this.throwableIndex],
      throwableSlots: this.throwableOrder.length,
      clodCount: this.clodCount,
      pouchCount: this.pouchCount,
      invertedQuota: this.level.altar !== null,
      boss: this.bossActive
        ? { phaseIndex: this.bossState.phaseIndex, phaseCount: this.bossData.phases.length, hitsThisPhase: this.bossState.hitsThisPhase, hitsRequired: TIERS[this.tierId].bossHitsPerPhase, defeated: this.bossState.defeated }
        : null,
    };
  }

  private onShutdown(): void {
    // Ending the level calls scene.start('Results') from inside this scene's own worldstep
    // handler (stepQuotaAndExit), so by the time this SHUTDOWN listener runs, Phaser has
    // already torn down this scene's physics plugin -- this.physics can be undefined here.
    this.physics?.world?.off('worldstep', this.onTick, this);
    this.inputSystem?.destroy();
  }
}
