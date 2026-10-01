/**
 * Parses a Tiled JSON (.tmj) export into a validated LevelDefinition (PLAN.md §5.1-5.2).
 * Pure and Phaser-free: PlayScene.ts hands this the loaded JSON and builds bodies/sprites from
 * the result. Any authoring mistake fails loudly here, with the offending object's id, rather
 * than as a silent runtime bug (PLAN.md §5.1 "Validation").
 */

// --- Tiled JSON subset (orthogonal, finite, embedded single-image tilesets only; D59) -----------

interface TiledProperty {
  name: string;
  type: string;
  value: string | number | boolean;
}

interface TiledObject {
  id: number;
  type: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: TiledProperty[];
}

interface TiledTileLayer {
  type: 'tilelayer';
  id: number;
  name: string;
  width: number;
  height: number;
  data: number[];
}

interface TiledObjectLayer {
  type: 'objectgroup';
  id: number;
  name: string;
  objects: TiledObject[];
}

type TiledLayer = TiledTileLayer | TiledObjectLayer;

interface TiledTilesetTile {
  id: number;
  properties?: TiledProperty[];
}

interface TiledEmbeddedTileset {
  firstgid: number;
  name: string;
  tilecount: number;
  tiles?: TiledTilesetTile[];
}

export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  orientation: string;
  infinite: boolean;
  layers: TiledLayer[];
  tilesets: TiledEmbeddedTileset[];
}

// --- Flip bits (issue #7382 mitigation, D54, PLAN §5.1) ------------------------------------------

const FLIP_HORIZONTAL_BIT = 0x80000000;
const FLIP_VERTICAL_BIT = 0x40000000;
const FLIP_DIAGONAL_BIT = 0x20000000;

// --- Output shape ---------------------------------------------------------------------------

export interface SpawnDef {
  x: number;
  y: number;
  facing: -1 | 1;
}

export interface PackstoneDef {
  id: number;
  x: number;
  y: number;
  checkpointId: string;
  spawnFacing: -1 | 1;
}

export interface StoneDef {
  id: number;
  x: number;
  y: number;
  order: number;
  kind: 'path' | 'branch' | 'secret';
  skin: 'moon' | 'jewel' | 'wolf';
}

export interface TriggerDef {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  flag: string;
  textKey?: string;
  /** A 'door' trigger's interact-hold kind (GDD §4.1): 'masterWordsGate' (0.5 s, the default)
   * or 'hutDoor' (0.25 s, GDD §10.6). */
  gateKind?: string;
}

export interface PlatformDef {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  path: string;
  speedPxS: number;
  flags: string[];
  periodS?: number;
  waitS?: number;
  /** Carry platforms only (GDD §10.5-10.6): waypoints beyond the object's own (x, y), as
   * "x1,y1;x2,y2;...". The object's own position is always the first waypoint. */
  waypoints?: Array<{ x: number; y: number }>;
}

/** A thorn fence (GDD §10.6, the "breakable tag"): a static obstacle that an advanceOnHit carry
 * platform (a nut-struck buffalo) breaks through on contact while advancing. */
export interface FenceDef {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface EnemyDef {
  id: number;
  x: number;
  y: number;
  entry: number;
  patrolLeft: number;
  patrolRight: number;
  facing: -1 | 1;
  flags: string[];
  script: 'lobber' | 'charger' | 'turret';
}

export interface ExitDef {
  id: number;
  x: number;
  y: number;
  characterId: string;
}

export interface PickupDef {
  id: number;
  x: number;
  y: number;
  kind: string;
}

export interface BossDoorDef {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  bossId: string;
}

export interface HelperDef {
  id: number;
  x: number;
  y: number;
  kind: string;
}

export interface GroundTileProperties {
  collides: boolean;
  oneWay: boolean;
  climbable: boolean;
  climbableH: boolean;
}

export interface LevelDefinition {
  widthTiles: number;
  heightTiles: number;
  tileSizePx: number;
  spawn: SpawnDef;
  packstones: PackstoneDef[];
  stones: StoneDef[];
  triggers: TriggerDef[];
  platforms: PlatformDef[];
  enemies: EnemyDef[];
  exit: ExitDef | null;
  pickups: PickupDef[];
  bossDoor: BossDoorDef | null;
  helpers: HelperDef[];
  fences: FenceDef[];
  groundLayer: { width: number; height: number; data: number[] } | null;
  tileProperties: Map<number, GroundTileProperties>; // by gid
}

// --- Errors -----------------------------------------------------------------------------------

export class LevelValidationError extends Error {}

function requireProp(obj: TiledObject, name: string): string | number | boolean {
  const found = obj.properties?.find((p) => p.name === name);
  if (found === undefined) {
    throw new LevelValidationError(`Object ${obj.id} (type "${obj.type}") is missing required property "${name}"`);
  }
  return found.value;
}

function optionalProp(obj: TiledObject, name: string): string | number | boolean | undefined {
  return obj.properties?.find((p) => p.name === name)?.value;
}

function requireFacing(obj: TiledObject, name: string): -1 | 1 {
  const value = requireProp(obj, name);
  if (value !== 1 && value !== -1) {
    throw new LevelValidationError(`Object ${obj.id} (type "${obj.type}") property "${name}" must be 1 or -1, got ${value}`);
  }
  return value;
}

// --- Flip-bit and text validation --------------------------------------------------------------

function validateNoBannedFlips(layer: TiledTileLayer): void {
  for (let i = 0; i < layer.data.length; i++) {
    const gid = layer.data[i] >>> 0;
    if (gid & FLIP_VERTICAL_BIT) {
      throw new LevelValidationError(`Layer "${layer.name}" tile index ${i} has a vertical flip bit set, which is never authored (issue #7382)`);
    }
    if (gid & FLIP_DIAGONAL_BIT) {
      throw new LevelValidationError(`Layer "${layer.name}" tile index ${i} has a diagonal flip bit set, which is never authored (issue #7382)`);
    }
  }
}

function stripFlipBits(gid: number): number {
  return (gid >>> 0) & ~(FLIP_HORIZONTAL_BIT | FLIP_VERTICAL_BIT | FLIP_DIAGONAL_BIT);
}

// --- Main parse ---------------------------------------------------------------------------------

const KNOWN_OBJECT_TYPES = new Set([
  'spawn',
  'packstone',
  'stone',
  'exit',
  'enemy',
  'platform',
  'trigger',
  'bunch',
  'pile',
  'pickup',
  'helper',
  'altar',
  'bossDoor',
  'card',
  'fence',
]);

export function parseLevel(map: TiledMap): LevelDefinition {
  if (map.orientation !== 'orthogonal') {
    throw new LevelValidationError(`Map orientation must be orthogonal, got "${map.orientation}"`);
  }
  if (map.infinite) {
    throw new LevelValidationError('Map must be finite (D59)');
  }

  let groundLayer: TiledTileLayer | null = null;
  const definition: LevelDefinition = {
    widthTiles: map.width,
    heightTiles: map.height,
    tileSizePx: map.tilewidth,
    spawn: { x: 0, y: 0, facing: 1 },
    packstones: [],
    stones: [],
    triggers: [],
    platforms: [],
    enemies: [],
    exit: null,
    pickups: [],
    bossDoor: null,
    helpers: [],
    fences: [],
    groundLayer: null,
    tileProperties: new Map(),
  };

  const tileset = map.tilesets[0];
  if (tileset?.tiles) {
    for (const tile of tileset.tiles) {
      const gid = tileset.firstgid + tile.id;
      definition.tileProperties.set(gid, {
        collides: Boolean(tile.properties?.find((p) => p.name === 'collides')?.value),
        oneWay: Boolean(tile.properties?.find((p) => p.name === 'oneWay')?.value),
        climbable: Boolean(tile.properties?.find((p) => p.name === 'climbable')?.value),
        climbableH: Boolean(tile.properties?.find((p) => p.name === 'climbableH')?.value),
      });
    }
  }

  let spawnFound = false;
  const seenStoneOrders = new Set<number>();

  for (const layer of map.layers) {
    if (layer.type === 'tilelayer') {
      validateNoBannedFlips(layer);
      if (layer.name === 'ground') {
        groundLayer = layer;
        definition.groundLayer = { width: layer.width, height: layer.height, data: layer.data.map(stripFlipBits) };
      }
      continue;
    }

    if (layer.type !== 'objectgroup') continue;
    if (layer.name !== 'entities') continue; // markers layer: camera bounds only, not parsed in M1

    for (const obj of layer.objects) {
      if (!KNOWN_OBJECT_TYPES.has(obj.type)) {
        throw new LevelValidationError(`Object ${obj.id} has unknown type "${obj.type}"`);
      }

      switch (obj.type) {
        case 'spawn': {
          const facing = requireFacing(obj, 'facing');
          definition.spawn = { x: obj.x, y: obj.y, facing };
          spawnFound = true;
          break;
        }

        case 'packstone': {
          const checkpointId = String(requireProp(obj, 'checkpointId'));
          const spawnFacing = requireFacing(obj, 'spawnFacing');
          definition.packstones.push({ id: obj.id, x: obj.x, y: obj.y, checkpointId, spawnFacing });
          break;
        }

        case 'stone': {
          const order = Number(requireProp(obj, 'order'));
          const kind = String(requireProp(obj, 'kind')) as StoneDef['kind'];
          const skin = String(requireProp(obj, 'skin')) as StoneDef['skin'];
          if (seenStoneOrders.has(order)) {
            throw new LevelValidationError(`Object ${obj.id} (stone) duplicates order ${order}, already used by another stone`);
          }
          seenStoneOrders.add(order);
          definition.stones.push({ id: obj.id, x: obj.x, y: obj.y, order, kind, skin });
          break;
        }

        case 'trigger': {
          const flag = String(requireProp(obj, 'flag'));
          const textKey = optionalProp(obj, 'textKey');
          const gateKind = optionalProp(obj, 'gateKind');
          definition.triggers.push({
            id: obj.id,
            x: obj.x,
            y: obj.y,
            w: obj.width,
            h: obj.height,
            flag,
            textKey: textKey === undefined ? undefined : String(textKey),
            gateKind: gateKind === undefined ? undefined : String(gateKind),
          });
          break;
        }

        case 'platform': {
          const path = String(requireProp(obj, 'path'));
          const speedPxS = Number(requireProp(obj, 'speedPxS'));
          const flagsRaw = optionalProp(obj, 'flags');
          const flags = flagsRaw === undefined ? [] : String(flagsRaw).split(',').map((f) => f.trim());
          const periodS = optionalProp(obj, 'periodS');
          const waitS = optionalProp(obj, 'waitS');
          const waypointsRaw = optionalProp(obj, 'waypoints');
          const waypoints =
            waypointsRaw === undefined
              ? undefined
              : String(waypointsRaw)
                  .split(';')
                  .map((pair) => pair.trim())
                  .filter((pair) => pair.length > 0)
                  .map((pair) => {
                    const [wx, wy] = pair.split(',').map(Number);
                    return { x: wx, y: wy };
                  });
          definition.platforms.push({
            id: obj.id,
            x: obj.x,
            y: obj.y,
            w: obj.width,
            h: obj.height,
            path,
            speedPxS,
            flags,
            periodS: periodS === undefined ? undefined : Number(periodS),
            waitS: waitS === undefined ? undefined : Number(waitS),
            waypoints,
          });
          break;
        }

        case 'fence': {
          definition.fences.push({ id: obj.id, x: obj.x, y: obj.y, w: obj.width, h: obj.height });
          break;
        }

        case 'enemy': {
          const entry = Number(requireProp(obj, 'entry'));
          const patrolLeft = Number(requireProp(obj, 'patrolLeft'));
          const patrolRight = Number(requireProp(obj, 'patrolRight'));
          const facing = requireFacing(obj, 'facing');
          const flagsRaw = optionalProp(obj, 'flags');
          const flags = flagsRaw === undefined ? [] : String(flagsRaw).split(',').map((f) => f.trim());
          const scriptRaw = optionalProp(obj, 'script');
          const script = scriptRaw === undefined ? 'lobber' : (String(scriptRaw) as EnemyDef['script']);
          if (script !== 'lobber' && script !== 'charger' && script !== 'turret') {
            throw new LevelValidationError(`Object ${obj.id} (enemy) has unknown script "${script}"`);
          }
          definition.enemies.push({ id: obj.id, x: obj.x, y: obj.y, entry, patrolLeft, patrolRight, facing, flags, script });
          break;
        }

        case 'exit': {
          const characterId = String(requireProp(obj, 'characterId'));
          definition.exit = { id: obj.id, x: obj.x, y: obj.y, characterId };
          break;
        }

        case 'pickup': {
          const kind = String(requireProp(obj, 'kind'));
          definition.pickups.push({ id: obj.id, x: obj.x, y: obj.y, kind });
          break;
        }

        case 'bossDoor': {
          const bossId = String(requireProp(obj, 'bossId'));
          definition.bossDoor = { id: obj.id, x: obj.x, y: obj.y, w: obj.width, h: obj.height, bossId };
          break;
        }

        case 'helper': {
          const kind = String(requireProp(obj, 'kind'));
          definition.helpers.push({ id: obj.id, x: obj.x, y: obj.y, kind });
          break;
        }

        // bunch, pile, altar, card: parsed by later milestones
        default:
          break;
      }
    }
  }

  if (!spawnFound) {
    throw new LevelValidationError('Map has no spawn object');
  }
  if (!groundLayer) {
    throw new LevelValidationError('Map has no "ground" tile layer');
  }

  return definition;
}

export function tilePropertiesAt(definition: LevelDefinition, tileX: number, tileY: number): GroundTileProperties | null {
  if (!definition.groundLayer) return null;
  if (tileX < 0 || tileY < 0 || tileX >= definition.groundLayer.width || tileY >= definition.groundLayer.height) return null;
  const index = tileY * definition.groundLayer.width + tileX;
  const gid = definition.groundLayer.data[index];
  if (gid === 0) return null;
  return definition.tileProperties.get(gid) ?? null;
}
