import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LevelValidationError, parseLevel, tilePropertiesAt, type TiledMap } from '../../../src/game/logic/level/levelData';

function loadGymFixture(): TiledMap {
  const raw = readFileSync(path.resolve(process.cwd(), 'public/game/maps/gym.tmj'), 'utf-8');
  return JSON.parse(raw) as TiledMap;
}

function baseMap(overrides: Partial<TiledMap> = {}): TiledMap {
  return {
    width: 4,
    height: 4,
    tilewidth: 16,
    tileheight: 16,
    orientation: 'orthogonal',
    infinite: false,
    layers: [
      { type: 'tilelayer', id: 1, name: 'ground', width: 4, height: 4, data: [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      {
        type: 'objectgroup',
        id: 2,
        name: 'entities',
        objects: [{ id: 1, type: 'spawn', x: 0, y: 0, width: 0, height: 0, properties: [{ name: 'facing', type: 'int', value: 1 }] }],
      },
    ],
    tilesets: [{ firstgid: 1, name: 'test', tilecount: 1, tiles: [{ id: 0, properties: [{ name: 'collides', type: 'bool', value: true }] }] }],
    ...overrides,
  };
}

describe('levelData', () => {
  it('parses the M1 gym fixture into a LevelDefinition', () => {
    const definition = parseLevel(loadGymFixture());
    expect(definition.widthTiles).toBe(100);
    expect(definition.heightTiles).toBe(12);
    expect(definition.spawn).toEqual({ x: 48, y: 144, facing: 1 });
    expect(definition.packstones).toHaveLength(2);
    expect(definition.stones).toHaveLength(1);
    expect(definition.triggers.some((t) => t.flag === 'pit')).toBe(true);
    expect(definition.platforms.some((p) => p.flags.includes('swing'))).toBe(true);
    expect(definition.platforms.some((p) => p.flags.includes('crumble'))).toBe(true);
    expect(definition.enemies).toHaveLength(1);
  });

  it('resolves ground tile properties by gid, including the climbable creeper column', () => {
    const definition = parseLevel(loadGymFixture());
    // Column 50, row 6 is inside the static creeper column (rows 4-8).
    const creeperTile = tilePropertiesAt(definition, 50, 6);
    expect(creeperTile?.climbable).toBe(true);
    // Column 0, row 9 is ordinary ground.
    const groundTile = tilePropertiesAt(definition, 0, 9);
    expect(groundTile?.collides).toBe(true);
  });

  it('parses a minimal valid map', () => {
    const definition = parseLevel(baseMap());
    expect(definition.spawn).toEqual({ x: 0, y: 0, facing: 1 });
  });

  it('fails on a missing required property, naming the object id', () => {
    const map = baseMap({
      layers: [
        baseMap().layers[0],
        { type: 'objectgroup', id: 2, name: 'entities', objects: [{ id: 7, type: 'packstone', x: 0, y: 0, width: 0, height: 0, properties: [] }] },
      ],
    });
    expect(() => parseLevel(map)).toThrow(LevelValidationError);
    expect(() => parseLevel(map)).toThrow(/Object 7/);
  });

  it('fails on a duplicate stone order, naming the object id', () => {
    const stoneA = { id: 10, type: 'stone', x: 0, y: 0, width: 0, height: 0, properties: [{ name: 'order', type: 'int', value: 1 }, { name: 'kind', type: 'string', value: 'path' }, { name: 'skin', type: 'string', value: 'moon' }] };
    const stoneB = { id: 11, type: 'stone', x: 16, y: 0, width: 0, height: 0, properties: [{ name: 'order', type: 'int', value: 1 }, { name: 'kind', type: 'string', value: 'path' }, { name: 'skin', type: 'string', value: 'moon' }] };
    const spawn = baseMap().layers[1] as Extract<TiledMap['layers'][number], { type: 'objectgroup' }>;
    const map = baseMap({ layers: [baseMap().layers[0], { type: 'objectgroup', id: 2, name: 'entities', objects: [...spawn.objects, stoneA, stoneB] }] });
    expect(() => parseLevel(map)).toThrow(/Object 11/);
    expect(() => parseLevel(map)).toThrow(/duplicates order 1/);
  });

  it('fails on an unknown object type, naming the object id', () => {
    const spawn = baseMap().layers[1] as Extract<TiledMap['layers'][number], { type: 'objectgroup' }>;
    const map = baseMap({
      layers: [baseMap().layers[0], { type: 'objectgroup', id: 2, name: 'entities', objects: [...spawn.objects, { id: 99, type: 'mysteryThing', x: 0, y: 0, width: 0, height: 0 }] }],
    });
    expect(() => parseLevel(map)).toThrow(/Object 99 has unknown type/);
  });

  it('fails on a vertical or diagonal tile flip bit, naming the layer and tile index', () => {
    const VERTICAL_FLIP_BIT = 0x40000000;
    const map = baseMap({
      layers: [{ type: 'tilelayer', id: 1, name: 'ground', width: 4, height: 4, data: [1, (1 | VERTICAL_FLIP_BIT) >>> 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, baseMap().layers[1]],
    });
    expect(() => parseLevel(map)).toThrow(/tile index 1/);
    expect(() => parseLevel(map)).toThrow(/vertical flip/);
  });

  it('fails when the map has no spawn object', () => {
    const map = baseMap({ layers: [baseMap().layers[0], { type: 'objectgroup', id: 2, name: 'entities', objects: [] }] });
    expect(() => parseLevel(map)).toThrow(/no spawn object/);
  });
});
