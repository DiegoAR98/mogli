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
import { initialLobberState, stepLobber, stompScatters, type LobberState } from '../logic/enemies/scripts';
import { crumbleHasCollision, pendulumKinematics, startCrumble, stepCrumble, swingReleaseVx, type CrumbleState } from '../logic/platforms/PathFollower';
import {
  BODY_STANDING_H_PX,
  BODY_STANDING_W_PX,
  CLIMB_SPEED_PX_S,
  COYOTE_FRAMES,
  JUMP_BUFFER_FRAMES,
  JUMP_HORIZONTAL_BOOST_PX_S,
  JUMP_LAUNCH_SPEED_PX_S,
  LEAF_PIPS_MAX,
  MAX_FALL_SPEED_PX_S,
  NUT_COOLDOWN_S,
  RESPAWN_FADE_S,
  RISING_GRAVITY_PX_S2,
  RUN_SPEED_PX_S,
  SWING_AMPLITUDE_DEG,
  SWING_PERIOD_S,
  TILE_PX,
  WALK_SPEED_PX_S,
} from '../data/tuning';

interface PlaySceneData {
  levelId: string;
}

interface EnemyRuntime {
  sprite: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  state: LobberState;
  patrolLeft: number;
  patrolRight: number;
  direction: -1 | 1;
}

interface NutRuntime {
  sprite: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  spawnX: number;
  rangePx: number;
}

const NUT_SPEED_FOR_RANGE = 224;

export class PlayScene extends Phaser.Scene {
  private level!: LevelDefinition;

  private player!: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private facing: -1 | 1 = 1;
  private crouched = false;
  private climbing = false;
  private swinging = false;
  private jumpCutDone = false;
  private coyoteFrames = COUNTER_INACTIVE;
  private bufferFrames = COUNTER_INACTIVE;
  private creeperRegrabLockFrames = 0;
  private wasGrounded = false;
  private pips = LEAF_PIPS_MAX;
  private deaths = 0;

  private checkpoint!: CheckpointState;
  private stoneStates: StoneRuntimeState[] = [];
  private stoneSprites: Phaser.GameObjects.Rectangle[] = [];
  private stonesCollected = 0;

  private groundLayer!: Phaser.Tilemaps.TilemapLayer;

  private nuts: NutRuntime[] = [];
  private throwCooldownS = 0;

  private enemies: EnemyRuntime[] = [];

  private swingObj?: {
    sprite: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
    pivotX: number;
    pivotY: number;
    lengthPx: number;
  };
  private ridingSwing = false;

  private crumblePlatforms: Array<{ sprite: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body }; state: CrumbleState }> = [];

  private simTimeS = 0;

  constructor() {
    super('Play');
  }

  create(data: PlaySceneData): void {
    this.physics.world.TILE_BIAS = 16;

    const cacheEntry = this.cache.tilemap.get(`map-${data.levelId}`);
    const rawJson = cacheEntry.data as TiledMap;
    this.level = parseLevel(rawJson);

    this.buildTilemap(data.levelId);
    this.buildPlayer();
    this.buildStones();
    this.buildPackstonesAndTriggers();
    this.buildPlatforms();
    this.buildEnemies();

    this.checkpoint = activateCheckpoint({ checkpointId: 'spawn', x: this.level.spawn.x, y: this.level.spawn.y, spawnFacing: this.level.spawn.facing });

    this.inputSystem = new InputSystem();
    this.physics.world.on('worldstep', this.onTick, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
  }

  private inputSystem!: InputSystem;

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
    this.player = this.add.rectangle(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h, 0xd8a657) as typeof this.player;
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
      }
    }
  }

  private buildPlatforms(): void {
    for (const platform of this.level.platforms) {
      if (platform.flags.includes('swing')) {
        const lengthPx = 4 * TILE_PX;
        const sprite = this.add.rectangle(platform.x, platform.y + lengthPx, 4, 10, 0xc9b458) as typeof this.player;
        this.physics.add.existing(sprite);
        sprite.body.setAllowGravity(false);
        sprite.body.setImmovable(true);
        this.swingObj = { sprite, pivotX: platform.x, pivotY: platform.y, lengthPx };
      } else if (platform.flags.includes('crumble')) {
        const sprite = this.add.rectangle(platform.x + platform.w / 2, platform.y + TILE_PX / 2, platform.w, TILE_PX, 0x8a6a4a) as typeof this.player;
        this.physics.add.existing(sprite, true);
        this.physics.add.collider(this.player, sprite, () => this.onCrumbleTouched(sprite));
        this.crumblePlatforms.push({ sprite, state: { crumbling: false, fallenAtS: null, respawned: false } });
      }
    }
  }

  private onCrumbleTouched(sprite: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body }): void {
    const entry = this.crumblePlatforms.find((c) => c.sprite === sprite);
    if (!entry || entry.state.crumbling) return;
    // Only start crumbling when Mowgli is standing on top of it.
    if (this.player.body.touching.down || this.player.body.blocked.down) {
      entry.state = startCrumble(this.simTimeS);
    }
  }

  private buildEnemies(): void {
    for (const enemyDef of this.level.enemies) {
      const sprite = this.add.rectangle(enemyDef.x, enemyDef.y - 6, 10, 12, 0xb84a4a) as typeof this.player;
      this.physics.add.existing(sprite);
      sprite.body.setCollideWorldBounds(false);
      this.physics.add.collider(sprite, this.groundLayer);
      this.enemies.push({
        sprite,
        state: initialLobberState(),
        patrolLeft: enemyDef.patrolLeft,
        patrolRight: enemyDef.patrolRight,
        direction: enemyDef.facing,
      });
    }
  }

  // --- The worldstep tick (PLAN.md §4.2): every gameplay rule and timer lives here -------------

  private onTick(dtS: number): void {
    this.simTimeS += dtS;
    const snapshot = this.inputSystem.sample();

    this.stepPlayer(snapshot, dtS);
    this.stepStoneOverlaps();
    this.stepPackstoneOverlaps();
    this.stepPitOverlaps();
    this.stepThrow(snapshot, dtS);
    this.stepNuts(dtS);
    this.stepEnemies(dtS);
    this.stepSwing(dtS, snapshot);
    this.stepCrumblePlatforms();
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

    // --- Horizontal movement ---
    const inputDir = snapshot.held.left ? -1 : snapshot.held.right ? 1 : 0;
    if (inputDir !== 0) this.facing = inputDir;
    const maxSpeed = this.crouched ? WALK_SPEED_PX_S : RUN_SPEED_PX_S;
    const vx = integrateHorizontalVelocity(body.velocity.x, inputDir as -1 | 0 | 1, grounded, maxSpeed, dtS);
    body.setVelocityX(vx);

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
      if (this.stoneStates[i].collected) continue;
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

  private respawn(): void {
    const pos = respawnAtLastCheckpoint(this.checkpoint);
    this.deaths++;
    this.player.setPosition(pos.x, pos.y - BODY_STANDING_H_PX / 2);
    this.player.body.setVelocity(0, 0);
    this.facing = pos.facing;
    this.pips = healOnCheckpoint(LEAF_PIPS_MAX);
    gameEvents.emit('player:respawned', { packstoneId: this.checkpoint.checkpointId ?? 'spawn', deaths: this.deaths });
  }

  private stepThrow(snapshot: InputSnapshot, dtS: number): void {
    this.throwCooldownS = Math.max(0, this.throwCooldownS - dtS);
    if (!snapshot.pressed.throw) return;
    if (!canThrow(this.nuts.length, this.throwCooldownS, NUT_PARAMS)) return;

    const aim = resolveAimDirection({ left: snapshot.held.left, right: snapshot.held.right, up: snapshot.held.up, down: snapshot.held.down, facing: this.facing });
    const velocity = projectileVelocity(aim, NUT_PARAMS);
    const spawnX = this.player.x + aim.dx * 10;
    const spawnY = this.player.y - (this.crouched ? 4 : 8);

    const sprite = this.add.rectangle(spawnX, spawnY, 4, 4, 0x8a6a3a) as typeof this.player;
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
          const result = stepLobber(enemy.state, 0, true);
          enemy.state = result.state;
          this.destroyNut(nut.sprite);
          break;
        }
      }
    }
  }

  private stepEnemies(dtS: number): void {
    for (const enemy of this.enemies) {
      const stomped = this.checkStomp(enemy);
      const result = stepLobber(enemy.state, dtS, stomped);
      enemy.state = result.state;

      if (result.didThrow) {
        this.spawnEnemyNut(enemy);
      }

      const body = enemy.sprite.body;
      if (enemy.state.phase === 'fleeing') {
        const fleeDir = enemy.sprite.x < this.player.x ? -1 : 1;
        body.setVelocityX(fleeDir * RUN_SPEED_PX_S * 1.2);
      } else if (enemy.state.phase === 'patrol') {
        body.setVelocityX(enemy.direction * (RUN_SPEED_PX_S * 0.4));
        if (enemy.sprite.x <= enemy.patrolLeft) enemy.direction = 1;
        if (enemy.sprite.x >= enemy.patrolRight) enemy.direction = -1;
      } else {
        body.setVelocityX(0);
      }

      const tint = enemy.state.phase === 'telegraph' ? 0xf2e94e : enemy.state.phase === 'fleeing' ? 0x888888 : 0xb84a4a;
      enemy.sprite.setFillStyle(tint);
    }
  }

  private checkStomp(enemy: EnemyRuntime): boolean {
    if (!stompScatters(true)) return false;
    if (enemy.state.phase === 'fleeing') return false;
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
    const sprite = this.add.rectangle(enemy.sprite.x, enemy.sprite.y, 4, 4, 0xb84a4a) as typeof this.player;
    this.physics.add.existing(sprite);
    sprite.body.setVelocity(dir * NUT_SPEED_FOR_RANGE, -40);
    sprite.body.setGravityY(RISING_GRAVITY_PX_S2 * 0.25);
    this.physics.add.collider(sprite, this.groundLayer, () => sprite.destroy());
    this.time.delayedCall(2000, () => sprite.destroy());
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

  // --- Read-only accessors for HudScene (F3 overlay) --------------------------------------------

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

  private onShutdown(): void {
    this.physics.world.off('worldstep', this.onTick, this);
    this.inputSystem.destroy();
  }
}
