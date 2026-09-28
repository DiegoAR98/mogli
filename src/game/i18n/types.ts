/**
 * i18n dictionary shape (GDD §14.1, PLAN.md §7.2): a hand-rolled typed dictionary. en.ts is the
 * key source of truth; pt-BR.ts is typed against its keys so a missing translation is a compile
 * error. A value is either a plain string or a plural form set, selected through
 * Intl.PluralRules with an explicit "zero" override (pt-BR's CLDR "one" category covers both 0
 * and 1, but "0 pedras" still needs the plural noun, GDD §14.1).
 */

export interface PluralForm {
  zero?: string;
  one: string;
  other: string;
}

export type DictValue = string | PluralForm;
export type Dictionary = Record<string, DictValue>;
