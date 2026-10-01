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

  'level.l2.title': 'Cold Lairs',
  'card.l2.kidnapCarry': 'The Bandar-log snatch Mowgli up and carry him across the tree-tops.',
  'card.l2.intro': 'Here we go in a flung festoon, / Half-way up to the jealous moon!',
  'card.l2.birdGate': 'We be of one blood, ye and I',
  'card.l2.exit': 'A brave heart and a courteous tongue. They shall carry thee far through the jungle, manling.',

  'level.l3.title': 'Water Truce',
  'card.l3.intro': 'The stream is shrunk--the pool is dry, / And we be comrades, thou and I;',
  'card.l3.twist': 'By the Law of the Jungle it is death to kill at the drinking-places when once the Water Truce has been declared.',
  'card.l3.shereKhanPool': 'Shere Khan comes down to the shrunken pool. Every head turns away.',
  'card.l3.exit1': 'Ye know, children, that of all things ye most fear Man;',
  'card.l3.exit2': "Till yonder cloud--Good Hunting!--loose / The rain that breaks our Water Truce.",

  'level.l4.title': 'Man-Pack',
  'card.l4.intro': 'What of the hunting, hunter bold? / Brother, the watch was long and cold.',
  'card.l4.afterB2': 'Look well, O Wolves. Have I kept my word?',
  'card.l4.act1': 'I am two Mowglis, but the hide of Shere Khan is under my feet.',

  'level.l5.title': 'Let in the Jungle',
  'card.l5.intro': 'Veil them, cover them, wall them round-- / Blossom, and creeper, and weed--',
  'card.l5.bagheeraScare': 'Bagheera snarls from the shadows. The watchmen flee and do not return.',
  'card.l5.lettingIn': 'Let in the Jungle, Hathi!',
  'card.l5.exit': 'Thy war shall be our war. We will let in the jungle!',

  'level.l6.title': "King's Treasure",
  'card.l6.intro': 'These are the Four that are never content, that have never been filled since the Dews began--',
  'card.l6.rule': "Carry the King's jewels to the altar. Only banked jewels count.",
  'card.l6.afterB3': 'I will never again bring into the Jungle strange things--not though they be as beautiful as flowers.',

  'hud.counter': 'found {count}/{quota}',
  'hud.counterBanked': 'banked {count}/{quota}',
  'hud.pouch': '({count})',
  'hud.counterTotal': '{total}',
  'hud.quotaToast': 'Find {name}',
  'hud.fullMoon': 'Full Moon',

  'exit.akela': 'Akela',
  'exit.kaa': 'Kaa',
  'exit.hathi': 'Hathi',
  'exit.greyBrother': 'Grey Brother',
  'exit.thuu': 'Thuu',

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
