// A choice in a form control
export type TOption<T> = { label: string; value: T }

export const SITE_URL = 'https://hangman.eapps.site'

export const MAX_PASSED_WORDS = 50

export const CONTACT_EMAIL = 'navasardianmichael@gmail.com'

export const SUPPORT_URL = 'https://buymeacoffee.com/navasardian'

export const GET_WORD_ERROR_MESSAGE = 'Չհաջողվեց ստանալ բառը։ Խնդրում ենք կրկին փորձել։'

export const PLAYERS = {
  player1: 'player1',
  player2: 'player2',
} as const

export const PLAY_MODES = {
  single: 'single',
  multiplayer: 'multiplayer',
  challenge: 'challenge',
} as const

export const GAME_STAGES = {
  start: 'start',
  settings: 'settings',
  composition: 'composition',
  discovery: 'discovery',
  summary: 'summary',
  share: 'share',
  end: 'end',
} as const

// The figure is complete after this many mistakes; one more ends the round
export const MAX_MISTAKES = 6

// Free hints in single-player, counted on the local calendar day
export const FREE_HINTS_PER_DAY = 3

export const CATEGORIES = {
  ցանկացած: 'ցանկացած',
  քաղաքներ: 'քաղաքներ',
  ['հայկական տեղանուններ']: 'հայկական տեղանուններ',
  երկրներ: 'երկրներ',
  ['անվանի մարդիկ']: 'անվանի մարդիկ',
  ['հայ անվանի մարդիկ']: 'հայ անվանի մարդիկ',
  կենդանիներ: 'կենդանիներ',
  ուտելիք: 'ուտելիք',
  մասնագիտություններ: 'մասնագիտություններ',
  սպորտ: 'սպորտ',
  ֆուտբոլ: 'ֆուտբոլ և ֆուտբոլիստներ',
  երաժշտություն: 'երաժշտություն',
  ֆիլմեր: 'ֆիլմեր',
  գրքեր: 'գրքեր',
  ['հայոց պատմություն']: 'հայոց պատմություն',
  ['հայոց լեզու']: 'հայոց լեզու',
  ['հայ գրականություն']: 'հայ գրականություն',
  ['համաշխարհային գրականություն']: 'համաշխարհային գրականություն',
  եկեղեցի: 'եկեղեցի',
  ['հայ եկեղեցի']: 'հայ եկեղեցի',
  բնություն: 'բնություն',
  պատմություն: 'պատմություն',
  արվեստ: 'արվեստ',
  գիտություն: 'գիտություն',
  լեզուներ: 'լեզուներ',
  քաղաքականություն: 'քաղաքականություն',
  բժշկություն: 'բժշկություն',
  տնտեսություն: 'տնտեսություն',
  հոգեբանություն: 'հոգեբանություն',
  փիլիսոփայություն: 'փիլիսոփայություն',
  մեքենաներ: 'մեքենաներ',
  ['մինչև 8 տարեկանների համար']: 'մինչև 10 տարեկանների համար',
} as const

export const CATEGORIES_OPTIONS: TOption<(typeof CATEGORIES)[keyof typeof CATEGORIES]>[] = Object.entries(
  CATEGORIES
).map(([label, value]) => ({
  label,
  value,
}))

export const DIFFICULTY_LEVELS = {
  ['շատ հեշտ']: 'շատ հեշտ',
  հեշտ: 'հեշտ',
  միջին: 'միջին',
  դժվար: 'դժվար',
  ['շատ դժվար']: 'շատ դժվար',
} as const

export const DIFFICULTY_LEVELS_OPTIONS: TOption<(typeof DIFFICULTY_LEVELS)[keyof typeof DIFFICULTY_LEVELS]>[] =
  Object.entries(DIFFICULTY_LEVELS).map(([label, value]) => ({
    label,
    value,
  }))

export const STAGES_HIDE_BREADCRUMB: (keyof typeof GAME_STAGES)[] = [
  GAME_STAGES.start,
  GAME_STAGES.end,
  GAME_STAGES.settings,
]

export const LETTERS = [
  'Է',
  'Թ',
  'Փ',
  'Ձ',
  'Ջ',
  'Ր',
  'Չ',
  'Ճ',
  'Ժ',
  'Ծ',
  'Ք',
  'Ո',
  'Ե',
  'Ռ',
  'Տ',
  'Ը',
  'ՈՒ',
  'Ի',
  'Օ',
  'Պ',
  'Ա',
  'Ս',
  'Դ',
  'Ֆ',
  'Գ',
  'Հ',
  'Յ',
  'Կ',
  'Լ',
  'Խ',
  'Զ',
  'Ղ',
  'Ց',
  'Վ',
  'Բ',
  'Ն',
  'Մ',
  'Շ',
] as const

export const SPACE_CHAR = '⌴' as const

export const STORE_VARS = {
  PERSIST_KEY: 'hangman-store',
  PASSED_WORDS: 'hangman-store-passedWords',
  PWA_INSTALLED_DATE: 'hangman-store-pwa-installed',
  IOS_INSTALL_HINT_CLOSED_DATE: 'hangman-store-ios-install-hint-closed',
} as const
