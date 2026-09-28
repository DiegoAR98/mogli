import type { Dictionary } from './types';

/** English strings (GDD §14.1): the key source of truth. pt-BR.ts is typed against these keys. */
export const en = {
  'boot.attribution':
    'Based on the public-domain Mowgli stories of Rudyard Kipling (1894-95). Not affiliated with, endorsed by or sponsored by The Walt Disney Company or the 1994 Virgin Interactive game.',
  'boot.storageWarning': 'No save storage found on this device -- progress runs in memory only and will not be kept after this tab closes.',

  'title.wordmark': 'Seeonee',
  'title.pressAnyKey': 'Press any key',
  'title.tapToStart': 'Tap to start',
  'title.continue': 'Continue',
  'title.newGame': 'New Game',
  'title.options': 'Options',
  'title.extras': 'Extras',
  'title.language': 'Language',

  'saveSlot.title': 'Save slots',
  'saveSlot.empty': 'Empty',
  'saveSlot.delete': 'Delete',
  'saveSlot.deleteConfirm': 'Delete this save? This cannot be undone.',
  'saveSlot.stonesCount': { zero: '{count} moon-stones', one: '{count} moon-stone', other: '{count} moon-stones' },

  'tier.pickTitle': 'Choose your path',
  'tier.cub': 'Cub',
  'tier.wolf': 'Wolf',
  'tier.loneWolf': 'Lone Wolf',
  'tier.cubDesc': 'Fewer stones needed, softer hits. Good hunting.',
  'tier.wolfDesc': 'The Jungle Law as the Pack knows it.',
  'tier.loneWolfDesc': 'No help, no mercy. For a Lone Wolf.',
  'tier.questOf': '{quota} of 15',

  'zone.z1': 'Seeonee Hills',
  'level.l1.title': 'Council Rock',
  'card.l1.map': 'The man’s cub is mine, Lungri--mine to me! He shall not be killed.',
  'card.l1.intro': 'Oh, hear the call!--Good hunting all / That keep the Jungle Law!',
  'card.l1.exit': 'Look well--look well, O Wolves!',
  'card.skipPrompt': 'Press any button to continue',

  'hud.counter': 'found {count}/{quota}',
  'hud.counterTotal': '{total}',
  'hud.quotaToast': 'Find {name}',
  'hud.fullMoon': 'Full Moon',

  'exit.akela': 'Akela',

  'pause.title': 'Paused',
  'pause.resume': 'Resume',
  'pause.restart': 'Restart from checkpoint',
  'pause.assist': 'Assist',
  'pause.options': 'Options',
  'pause.map': 'Map',

  'options.title': 'Options',
  'options.audio': 'Audio',
  'options.video': 'Video',
  'options.controls': 'Controls',
  'options.assist': 'Assist',
  'options.retro': 'Retro mode',
  'options.language': 'Language',
  'options.copyDiagnostics': 'Copy diagnostics',
  'options.copyDiagnosticsDone': 'Diagnostics copied',
  'options.back': 'Back',

  'assist.gameSpeed': 'Game speed',
  'assist.invincibility': 'Invincibility',
  'assist.infiniteClods': 'Infinite clods',
  'assist.skipLevel': 'Skip level',
  'assist.chilEverywhere': 'Chil everywhere',
  'assist.crouch': 'Crouch: hold or toggle',

  'results.title': 'Results',
  'results.stones': 'Stones {count}/15',
  'results.time': 'Time {time}',
  'results.deaths': 'Deaths {count}',
  'results.best': 'Best {time}',
  'results.continue': 'Press any button to continue',
  'results.assistStamp': 'Assist Mode was used',

  'common.on': 'On',
  'common.off': 'Off',
  'common.modern': 'Modern',
  'common.retro': 'Retro',
} as const satisfies Dictionary;

export type DictKey = keyof typeof en;
