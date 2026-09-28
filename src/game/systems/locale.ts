/**
 * Locale detection (GDD §14.1): any navigator.languages entry starting with "pt" gives pt-BR,
 * else EN; a ?lang= query overrides for testing; an explicit Options choice (passed in by the
 * caller from the settings record) wins over both.
 */

import { en, type DictKey } from '../i18n/en';
import { ptBR } from '../i18n/pt-BR';
import { t as translate } from '../i18n/translate';
import type { Dictionary } from '../i18n/types';

export type LocaleId = 'en' | 'pt-BR';

const DICTS: Record<LocaleId, Dictionary> = { en, 'pt-BR': ptBR };

export function detectLocale(navigatorLanguages: readonly string[], queryLang?: string | null, savedLocale?: LocaleId | null): LocaleId {
  if (savedLocale) return savedLocale;
  if (queryLang === 'en' || queryLang === 'pt-BR') return queryLang;
  if (navigatorLanguages.some((l) => l.toLowerCase().startsWith('pt'))) return 'pt-BR';
  return 'en';
}

export class Translator {
  constructor(public locale: LocaleId) {}

  t(key: DictKey, params?: Record<string, string | number>): string {
    return translate(DICTS[this.locale], this.locale, key, params);
  }

  setLocale(locale: LocaleId): void {
    this.locale = locale;
  }
}
