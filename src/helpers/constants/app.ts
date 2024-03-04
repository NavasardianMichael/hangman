export const PLAYERS = {
  player1: 'player1',
  player2: 'player2',
} as const

export const GAME_STAGES = {
  start: 'start',
  composition: 'composition',
  discovery: 'discovery',
  summary: 'summary',
  end: 'end',
} as const

export const STAGES_WITH_CLEAR_BACKGROUND: (keyof typeof GAME_STAGES)[] = [
  GAME_STAGES.start,
  // GAME_STAGES.summary,
]

export const STAGES_HIDE_BREADCRUMB: (keyof typeof GAME_STAGES)[] = [
  GAME_STAGES.start,
  GAME_STAGES.summary,
  GAME_STAGES.end
]

export const ALPHABET = [
  'Ա', 'Բ', 'Գ', 'Դ', 'Ե', 'Զ', 'Է', 'Ը', 'Թ', 'Ժ', 'Ի', 'Լ', 'Խ', 'Ծ', 'Կ', 'Հ', 'Ձ', 'Ղ', 'Ճ', 'Մ', 'Յ', 'Ն', 'Շ', 'Ո', 'Չ', 'Պ', 'Ջ', 'Ռ', 'Ս', 'Վ', 'Տ', 'Ր', 'Ց', 'ւ', 'Փ', 'Ք', 'Օ', 'Ֆ'
] as const