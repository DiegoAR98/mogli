import { describe, expect, it } from 'vitest';
import { en } from '../../../src/game/i18n/en';
import { ptBR } from '../../../src/game/i18n/pt-BR';
import { t } from '../../../src/game/i18n/translate';
import type { DictValue } from '../../../src/game/i18n/types';

function placeholdersOf(value: DictValue): Set<string> {
  const strings = typeof value === 'string' ? [value] : [value.zero, value.one, value.other].filter((s): s is string => s !== undefined);
  const found = new Set<string>();
  for (const s of strings) {
    for (const match of s.matchAll(/\{(\w+)\}/g)) found.add(match[1]);
  }
  return found;
}

describe('i18n parity (GDD §14.1)', () => {
  const enKeys = Object.keys(en);
  const ptKeys = Object.keys(ptBR);

  it('en and pt-BR have exactly the same key set', () => {
    expect(new Set(ptKeys)).toEqual(new Set(enKeys));
  });

  it('every key has the same {placeholder} set in both languages', () => {
    const mismatches: string[] = [];
    for (const key of enKeys) {
      const enPlaceholders = placeholdersOf(en[key as keyof typeof en]);
      const ptPlaceholders = placeholdersOf(ptBR[key as keyof typeof ptBR]);
      if (enPlaceholders.size !== ptPlaceholders.size || [...enPlaceholders].some((p) => !ptPlaceholders.has(p))) {
        mismatches.push(key);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('no empty strings in either dictionary', () => {
    const empties: string[] = [];
    for (const [key, value] of [...Object.entries(en), ...Object.entries(ptBR)]) {
      const strings = typeof value === 'string' ? [value] : [value.zero, value.one, value.other].filter((s): s is string => s !== undefined);
      if (strings.some((s) => s.trim() === '')) empties.push(key);
    }
    expect(empties).toEqual([]);
  });

  it('plural entries resolve zero, one and other distinctly where pt-BR provides all three', () => {
    const zero = t(ptBR, 'pt-BR', 'saveSlot.stonesCount', { count: 0 });
    const one = t(ptBR, 'pt-BR', 'saveSlot.stonesCount', { count: 1 });
    const other = t(ptBR, 'pt-BR', 'saveSlot.stonesCount', { count: 5 });
    expect(zero).toBe('0 pedras-da-lua');
    expect(one).toBe('1 pedra-da-lua');
    expect(other).toBe('5 pedras-da-lua');
  });

  it('t() interpolates {param} tokens', () => {
    expect(t(en, 'en', 'hud.quotaToast', { name: 'Akela' })).toBe('Find Akela');
    expect(t(ptBR, 'pt-BR', 'hud.quotaToast', { name: 'Akela' })).toBe('Encontre Akela');
  });

  it('t() throws on a missing key rather than silently rendering nothing', () => {
    expect(() => t(en, 'en', 'nonexistent.key')).toThrow(/Missing i18n key/);
  });
});
