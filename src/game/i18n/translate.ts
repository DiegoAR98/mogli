/**
 * t(dict, key, params): resolves a dictionary entry, picking a plural form through
 * Intl.PluralRules when needed, then interpolates {param} tokens (GDD §14.1). Pure and
 * testable: it takes the resolved locale id as a parameter rather than reading it itself.
 */

import type { Dictionary, DictValue } from './types';

function selectPluralForm(value: DictValue, localeId: string, count: number): string {
  if (typeof value === 'string') return value;
  if (count === 0 && value.zero !== undefined) return value.zero;
  const category = new Intl.PluralRules(localeId).select(count);
  if (category === 'one') return value.one;
  return value.other;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

export function t(dict: Dictionary, localeId: string, key: string, params?: Record<string, string | number>): string {
  const entry = dict[key];
  if (entry === undefined) {
    throw new Error(`Missing i18n key "${key}"`);
  }
  const count = typeof params?.count === 'number' ? params.count : 0;
  const template = selectPluralForm(entry, localeId, count);
  return interpolate(template, params);
}
