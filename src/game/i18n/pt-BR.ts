import type { Dictionary } from './types';
import type { DictKey } from './en';

/** Brazilian Portuguese strings (GDD §14.1, §14.4), typed against en.ts's key set. */
export const ptBR: Record<DictKey, Dictionary[string]> = {
  'boot.attribution':
    'Baseado nas histórias de Mowgli, de Rudyard Kipling (1894-95, domínio público). Sem afiliação, endosso ou patrocínio da The Walt Disney Company ou do jogo de 1994 da Virgin Interactive.',
  'boot.storageWarning': 'Nenhum armazenamento de save encontrado -- o progresso ficará apenas na memória e não será mantido após fechar esta aba.',

  'title.wordmark': 'Seeonee',
  'title.pressAnyKey': 'Pressione qualquer tecla',
  'title.tapToStart': 'Toque para começar',
  'title.continue': 'Continuar',
  'title.newGame': 'Novo Jogo',
  'title.options': 'Opções',
  'title.extras': 'Extras',
  'title.language': 'Idioma',

  'saveSlot.title': 'Espaços de save',
  'saveSlot.empty': 'Vazio',
  'saveSlot.delete': 'Apagar',
  'saveSlot.deleteConfirm': 'Apagar este save? Isso não pode ser desfeito.',
  'saveSlot.stonesCount': { zero: '{count} pedras-da-lua', one: '{count} pedra-da-lua', other: '{count} pedras-da-lua' },

  'tier.pickTitle': 'Escolha seu caminho',
  'tier.cub': 'Filhote',
  'tier.wolf': 'Lobo',
  'tier.loneWolf': 'Lobo Solitário',
  'tier.cubDesc': 'Menos pedras necessárias, golpes mais leves. Boa caçada.',
  'tier.wolfDesc': 'A Lei da Selva como a Alcateia a conhece.',
  'tier.loneWolfDesc': 'Sem ajuda, sem piedade. Para um Lobo Solitário.',
  'tier.questOf': '{quota} de 15',

  'zone.z1': 'Colinas de Seeonee',
  'level.l1.title': 'Rocha do Conselho',
  'card.l1.map': 'O filhote de homem é meu, Lungri--meu, só meu! Ele não será morto.',
  'card.l1.intro': 'Ouvi o chamado!--Boa caçada a todos / Que guardam a Lei da Selva!',
  'card.l1.exit': 'Olhem bem--olhem bem, ó Lobos!',
  'card.skipPrompt': 'Pressione qualquer botão para continuar',

  'level.l2.title': 'Tocas Frias',
  'card.l2.kidnapCarry': 'Os Bandar-log agarram Mowgli e o carregam pelas copas das árvores.',
  'card.l2.intro': 'Lá vamos nós num festão a voar, / Rumo à lua ciumenta, sem parar!',
  'card.l2.birdGate': 'Nós somos do mesmo sangue, tu e eu',
  'card.l2.exit': 'Um coração corajoso e uma língua cortês. Eles te levarão longe pela selva, filhote de homem.',

  'hud.counter': 'achadas {count}/{quota}',
  'hud.counterTotal': '{total}',
  'hud.quotaToast': 'Encontre {name}',
  'hud.fullMoon': 'Lua Cheia',

  'exit.akela': 'Akela',
  'exit.kaa': 'Kaa',

  'pause.title': 'Pausado',
  'pause.resume': 'Retomar',
  'pause.restart': 'Reiniciar do ponto',
  'pause.assist': 'Assistência',
  'pause.options': 'Opções',
  'pause.map': 'Mapa',

  'options.title': 'Opções',
  'options.audio': 'Áudio',
  'options.video': 'Vídeo',
  'options.controls': 'Controles',
  'options.assist': 'Assistência',
  'options.retro': 'Modo Retrô',
  'options.language': 'Idioma',
  'options.copyDiagnostics': 'Copiar diagnóstico',
  'options.copyDiagnosticsDone': 'Diagnóstico copiado',
  'options.back': 'Voltar',

  'assist.gameSpeed': 'Velocidade do jogo',
  'assist.invincibility': 'Invencibilidade',
  'assist.infiniteClods': 'Torrões infinitos',
  'assist.skipLevel': 'Pular fase',
  'assist.chilEverywhere': 'Chil em toda parte',
  'assist.crouch': 'Agachar: segurar ou alternar',

  'results.title': 'Resultados',
  'results.stones': 'Pedras {count}/15',
  'results.time': 'Tempo {time}',
  'results.deaths': 'Mortes {count}',
  'results.best': 'Melhor {time}',
  'results.continue': 'Pressione qualquer botão para continuar',
  'results.assistStamp': 'Modo Assistência foi usado',

  'common.on': 'Ligado',
  'common.off': 'Desligado',
  'common.modern': 'Moderno',
  'common.retro': 'Retrô',
};
