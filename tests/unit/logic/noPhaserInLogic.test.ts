import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * PLAN.md §3.3 rule 1: a file under src/game/logic/ or src/game/data/ never imports phaser,
 * window or document. This is what makes the rules testable in Vitest's node environment.
 */
function collectFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectFiles(full, out);
    } else if (entry.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('no-phaser-in-logic guard', () => {
  const root = path.resolve(process.cwd(), 'src/game');
  const dirs = ['logic', 'data'].map((d) => path.join(root, d));

  it('never imports phaser, window or document from src/game/logic or src/game/data', () => {
    const offenders: string[] = [];
    for (const dir of dirs) {
      for (const file of collectFiles(dir)) {
        const content = readFileSync(file, 'utf-8');
        if (/from\s+['"]phaser['"]/.test(content) || /\bwindow\./.test(content) || /\bdocument\./.test(content)) {
          offenders.push(file);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
