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
import { activateCheckpoint, healOnCheckpoint, respawnAtLastCheckpoint, type CheckpointState } from '../logic/triggers/TriggerVolume';
import { collectStone, type StoneRuntimeState } from '../logic/collectibles/Collectible';
import { NUT_PARAMS, canThrow, projectileGravityPxS2, projectileVelocity, resolveAimDirection } from '../logic/projectiles/Projectile';
import { initialLobberState, initialChargerState, stepLobber, stepCharger, stompScatters, type LobberState, type ChargerState } from '../logic/enemies/scripts';
import { crumbleHasCollision, pendulumKinematics, startCrumble, stepCrumble, swingReleaseVx, type CrumbleState } from '../logic/platforms/PathFollower';
import { initialRedFlowerState, isWithinFleeRadius, pickUpPot, tickRedFlower, toggleRedFlower, type RedFlowerState } from '../logic/items/RedFlower';
import { activateBeckon, checkQuota, initialExitNpcState, initialQuotaState, touchExit, type ExitNpcState, type QuotaState } from '../logic/collectibles/ExitNPC';
import { applyHit, canBeHit, isBlinkVisible } from '../logic/player/hitResponse';
import { TIERS, type TierId } from '../data/tiers';
import type { Settings } from '../systems/settings';
import {
  BODY_STANDING_H_PX,
  BODY_STANDING_W_PX,
  CHARGER_PATROL_SPEED_PX_S,
  CLIMB_SPEED_PX_S,
  COYOTE_FRAMES,
  IFRAMES_FRAMES,
  JUMP_BUFFER_FRAMES,
  JUMP_HORIZONTAL_BOOST_PX_S,
  JUMP_LAUNCH_SPEED_PX_S,
  LEAF_PIPS_MAX,
  MAX_FALL_SPEED_PX_S,
  NUT_COOLDOWN_S,
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
  WALK_SPEED_PX_S,
} from '../data/tuning';

interface PlaySceneData {
  levelId: string;
}

type Rect = Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };

interface EnemyRuntime {
  sprite: Rect;
  script: 'lobber' | 'charger';
  lobberState: LobberState;
  chargerState: ChargerState;
  thief: boolean;
  patrolLeft: number;
  patrolRight: number;
  direction: -1 | 1;
  carriedStoneIndex: number | null;
  targetStoneIndex: number | null;
}

interface NutRuntime {
  sprite: Rect;
  spawnX: number;
  rangePx: number;
}

const NUT_SPEED_FOR_RANGE = 224;
const KNOCKBACK_LOCK_FRAMES = 12; // 0.2 s (GDD §7.5)

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

  private redFlower: RedFlowerState = initialRedFlowerState();
  private redFlowerPickups: Array<{ sprite: Phaser.GameObjects.Rectangle; claimed: boolean }> = [];
  private throwableOrder: Array<'nut' | 'redFlower'> = ['nut'];
  private throwableIndex = 0;

  private exitNpc: ExitNpcState = initialExitNpcState();
  private exitSprite?: Phaser.GameObjects.Rectangle;
  private quota: QuotaState = initialQuotaState();

  private roarZones: Array<{ x: number; y: number; w: number; h: number; firedAt: number | null }> = [];

  private swingObj?: {
    sprite: Rect;
    pivotX: number;
    pivotY: number;
    lengthPx: number;
  };
  private ridingSwing = false;

  private crumblePlatforms: Array<{ sprite: Rect; state: CrumbleState }> = [];

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
      }
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
        this.swingObj = { sprite, pivotX: platform.x, pivotY: platform.y, lengthPx };
      } else if (platform.flags.includes('crumble')) {
        const sprite = this.add.rectangle(platform.x + platform.w / 2, platform.y + TILE_PX / 2, platform.w, TILE_PX, 0x8a6a4a) as Rect;
        this.physics.add.existing(sprite, true);
        this.physics.add.collider(this.player, sprite, () => this.onCrumbleTouched(sprite));
        this.crumblePlatforms.push({ sprite, state: { crumbling: false, fallenAtS: null, respawned: false } });
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
      const sprite = this.add.rectangle(enemyDef.x, enemyDef.y - 6, 10, 12, 0xb84a4a) as Rect;
      this.physics.add.existing(sprite);
      sprite.body.setCollideWorldBounds(false);
      this.physics.add.collider(sprite, this.groundLayer);
      this.enemies.push({
        sprite,
        script: enemyDef.script,
        lobberState: initialLobberState(),
        chargerState: initialChargerState(),
        thief: enemyDef.flags.includes('thief'),
        patrolLeft: enemyDef.patrolLeft,
        patrolRight: enemyDef.patrolRight,
        direction: enemyDef.facing,
        carriedStoneIndex: null,
        targetStoneIndex: null,
      });
    }
  }

  private buildPickups(): void {
    for (const pickup of this.level.pickups) {
      if (pickup.kind !== 'redFlowerPot') continue;
      const sprite = this.add.rectangle(pickup.x, pickup.y - 6, 8, 10, 0xd8562a);
      this.physics.add.existing(sprite, true);
      this.redFlowerPickups.push({ sprite, claimed: false });
    }
  }

  private buildExit(): void {
    if (!this.level.exit) return;
    const sprite = this.add.rectangle(this.level.exit.x, this.level.exit.y - 8, 12, 16, 0x555555);
    this.physics.add.existing(sprite, true);
    this.exitSprite = sprite;
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
    this.stepStoneOverlaps();
    this.stepPackstoneOverlaps();
    this.stepPitOverlaps();
    this.stepPickupOverlaps();
    this.stepRoarTriggers();
    this.stepRedFlower(snapshot, dtS);
    this.stepThrow(snapshot, dtS);
    this.stepNuts(dtS);
    this.stepEnemyNutsVsPlayer();
    this.stepEnemies(dtS);
    this.stepSwing(dtS, snapshot);
    this.stepCrumblePlatforms();
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
        this.stonesCollected++;
        sprite.setVisible(false);
        gameEvents.emit('stones:collected', { count: this.stonesCollected, total: this.level.stones.length, index: i, kind: 'moon' });
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

  private stepRedFlower(snapshot: InputSnapshot, dtS: number): void {
    if (snapshot.pressed.item) {
      this.redFlower = toggleRedFlower(this.redFlower);
    }
    this.redFlower = tickRedFlower(this.redFlower, dtS);

    if (!this.redFlower.lit) return;
    for (const enemy of this.enemies) {
      const distanceTiles = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y) / TILE_PX;
      if (isWithinFleeRadius(this.redFlower, distanceTiles)) {
        this.forceEnemyFlee(enemy);
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
    if (!canThrow(this.nuts.length, this.throwCooldownS, NUT_PARAMS)) return;

    const aim = resolveAimDirection({ left: snapshot.held.left, right: snapshot.held.right, up: snapshot.held.up, down: snapshot.held.down, facing: this.facing });
    const velocity = projectileVelocity(aim, NUT_PARAMS);
    const spawnX = this.player.x + aim.dx * 10;
    const spawnY = this.player.y - (this.crouched ? 4 : 8);

    const sprite = this.add.rectangle(spawnX, spawnY, 4, 4, 0x8a6a3a) as Rect;
    this.physics.add.existing(sprite);
    sprite.body.setVelocity(velocity.vx, velocity.vy);
    sprite.body.setGravityY(projectileGravityPxS2(NUT_PARAMS, RISING_GRAVITY_PX_S2));
    sprite.body.setAllowGravity(true);
    this.physics.add.collider(sprite, this.groundLayer, () => this.destroyNut(sprite));

    this.nuts.push({ sprite, spawnX, rangePx: NUT_PARAMS.rangeTiles * TILE_PX });
    this.throwCooldownS = NUT_COOLDOWN_S;
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
      for (const enemy of this.enemies) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(nut.sprite.getBounds(), enemy.sprite.getBounds())) {
          this.forceEnemyFlee(enemy);
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
    } else {
      if (enemy.chargerState.phase === 'fleeing') return;
      const result = stepCharger(enemy.chargerState, 0, { hitOrStomped: true, thief: enemy.thief, stoneNearby: false, reachedStone: false });
      enemy.chargerState = result.state;
      if (result.droppedStone && enemy.carriedStoneIndex !== null) {
        this.dropCarriedStone(enemy);
      }
    }
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
      const stomped = this.checkStomp(enemy);
      if (stomped) this.forceEnemyFlee(enemy);

      if (enemy.script === 'lobber') {
        this.stepLobberEnemy(enemy, dtS);
      } else {
        this.stepChargerEnemy(enemy, dtS);
      }
    }
  }

  private stepLobberEnemy(enemy: EnemyRuntime, dtS: number): void {
    const result = stepLobber(enemy.lobberState, dtS, false);
    enemy.lobberState = result.state;
    if (result.didThrow) this.spawnEnemyNut(enemy);

    const body = enemy.sprite.body;
    if (enemy.lobberState.phase === 'fleeing') {
      const fleeDir = enemy.sprite.x < this.player.x ? -1 : 1;
      body.setVelocityX(fleeDir * RUN_SPEED_PX_S * 1.2);
    } else {
      body.setVelocityX(0);
    }
    const tint = enemy.lobberState.phase === 'telegraph' ? 0xf2e94e : enemy.lobberState.phase === 'fleeing' ? 0x888888 : 0xb84a4a;
    enemy.sprite.setFillStyle(tint);
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

    const result = stepCharger(enemy.chargerState, dtS, { hitOrStomped: false, thief: enemy.thief, stoneNearby, reachedStone });
    enemy.chargerState = result.state;
    if (result.pickedUpStone && enemy.targetStoneIndex !== null) {
      enemy.carriedStoneIndex = enemy.targetStoneIndex;
      this.stoneCarried[enemy.carriedStoneIndex] = true;
      this.stoneSprites[enemy.carriedStoneIndex].setVisible(false);
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
      case 'fleeing': {
        const fleeDir = enemy.sprite.x < this.player.x ? -1 : 1;
        body.setVelocityX(fleeDir * RUN_SPEED_PX_S * 1.2);
        break;
      }
    }

    const tint = enemy.chargerState.phase === 'telegraph' ? 0xf2e94e : enemy.chargerState.phase === 'fleeing' ? 0x888888 : enemy.chargerState.phase === 'carrying' ? 0xc9b458 : 0x6a8a4a;
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
    if (!this.swingObj) return;
    const amplitudeRad = (SWING_AMPLITUDE_DEG * Math.PI) / 180;
    const k = pendulumKinematics(this.swingObj.pivotX, this.swingObj.pivotY, this.swingObj.lengthPx, amplitudeRad, SWING_PERIOD_S, this.simTimeS);
    this.swingObj.sprite.setPosition(k.x, k.y);
    this.swingObj.sprite.body.reset(k.x, k.y);

    if (!this.ridingSwing) {
      const near = Phaser.Math.Distance.Between(this.player.x, this.player.y, k.x, k.y) < 12;
      if (near && !this.climbing) {
        this.ridingSwing = true;
        this.player.body.setAllowGravity(false);
      }
      return;
    }

    this.player.setPosition(k.x, k.y + 8);
    this.player.body.setVelocity(k.vx, k.vy);

    if (snapshot.pressed.jump) {
      this.ridingSwing = false;
      this.player.body.setAllowGravity(true);
      this.player.body.setVelocityX(swingReleaseVx(k.vx, JUMP_HORIZONTAL_BOOST_PX_S, RUN_SPEED_PX_S));
      this.player.body.setVelocityY(-JUMP_LAUNCH_SPEED_PX_S);
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
      state: this.climbing ? 'climbing' : this.ridingSwing ? 'swinging' : this.crouched ? 'crouched' : 'normal',
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
      redFlowerMeterS: this.redFlower.meterS,
      redFlowerLit: this.redFlower.lit,
      currentThrowable: this.throwableOrder[this.throwableIndex],
      throwableSlots: this.throwableOrder.length,
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
