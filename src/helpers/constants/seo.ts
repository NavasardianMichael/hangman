import { CATEGORIES, MAX_MISTAKES, SITE_URL } from 'helpers/constants/app'
import { FREE_HINTS_PER_DAY, FREE_LETTERS_PER_DAY, PREMIUM_DAYS, PREMIUM_PRICE_TEXT } from 'helpers/constants/premium'

// Only the home page is indexed; the game screens (/settings, /discovery, …) are noindex with the home page as canonical.
// Google ranks by the title, the description and the page's visible text, so the phrases people search the game by
// ("կախաղան խաղ", "հայերեն խաղ", "armenian hangman game") are written there as text: the title and description below,
// and HOME_ABOUT, the text under the start screen. The keywords meta tag is ignored by Google (Bing and Yandex may
// still read it).

export const AUTHOR_NAME = 'Միքայել Նավասարդյան'
export const AUTHOR_NAME_LATIN = 'Michael Navasardyan'
export const AUTHOR_URL = 'https://www.linkedin.com/in/michael-navasardyan/'
const AUTHOR_GITHUB_URL = 'https://github.com/NavasardianMichael'

export const SITE_NAME = 'Կախաղան'

// The search result's title: "կախաղան խաղ" and "armenian hangman game" word for word, "հայերեն" for "հայերեն խաղ".
// About 50 characters, so it isn't cut off.
export const SITE_TITLE = 'Կախաղան խաղ հայերեն առցանց | Armenian Hangman Game'

// The search snippet, the share preview and the sentence answer engines quote. The other names come first, within the
// ~150 characters a snippet shows.
export const SITE_DESCRIPTION =
  'Կախաղան (կախամարդ) — անվճար հայերեն խաղ առցանց՝ Armenian Hangman game, виселица на армянском։ Գուշակեք բառը AI-ի դեմ, ընկերոջ հետ կամ մարտահրավերով։'

// Other names of the game: Armenian, English, Latin-script Armenian and Russian
const SITE_ALTERNATE_NAMES = [
  'Կախաղան խաղ',
  'Կախամարդ',
  'Հայերեն կախաղան',
  'Armenian Hangman',
  'Armenian Hangman Game',
  'Hangman հայերեն',
  'Kaxaghan',
  'Kakhaghan',
  'Kaxaxan',
  'Виселица на армянском',
]

export const SITE_KEYWORDS = [
  'կախաղան',
  'կախաղան խաղ',
  'կախաղան հայերեն խաղ',
  'կախամարդ',
  'հայերեն խաղ',
  'հայերեն խաղեր',
  'հայկական խաղեր',
  'հայերեն բառախաղ',
  'բառ գուշակել',
  'armenian hangman',
  'armenian hangman game',
  'armenian word game',
  'hayeren hangman',
  'kaxaghan',
  'kaxaxan hayeren',
  'veselica hayeren',
  'виселица на армянском',
]

// The share preview (Open Graph, X) and the structured data's image: the start screen, 16:9
export const SHARE_IMAGE = {
  url: '/images/screenshot-wide-home.png',
  width: 2560,
  height: 1440,
  alt: 'Կախաղան — հայերեն Hangman խաղի գլխավոր էջը',
}

// The topics the AI picks words from, without "any" and the one for children (named separately in the text)
const KIDS_TOPIC = CATEGORIES['մինչև 8 տարեկանների համար']
const TOPICS = Object.values(CATEGORIES).filter((topic) => topic !== CATEGORIES.ցանկացած && topic !== KIDS_TOPIC)

type TFaqItem = { question: string; answer: string[]; list?: 'ol' | 'ul' }

// The text under the start screen (components/homeAbout), also given to search engines as FAQ structured data. Every
// sentence must stay true of the game: the numbers come from the constants they describe.
export const HOME_ABOUT: {
  title: string
  intro: string[]
  faq: TFaqItem[]
  translations: { lang: string; title: string; text: string }[]
} = {
  title: 'Կախաղան խաղ հայերեն՝ առցանց և անվճար',
  intro: [
    '«Կախաղան»-ը (կախամարդ) աշխարհում հայտնի Hangman բառախաղի հայերեն տարբերակն է։ Գուշակեք թաքնված հայերեն բառը տառ առ տառ, մինչև կախաղանի նկարն ամբողջանա։ Խաղն անվճար է և առանց գրանցման․ խաղացեք առցանց՝ հեռախոսով, պլանշետով կամ համակարգչով։',
    'Սա հայերեն խաղ է բոլորի համար՝ երեխաների, դպրոցականների և մեծերի։ Այն օգնում է հարստացնել բառապաշարը, կրկնել հայերենի ուղղագրությունը և ժամանցն անցկացնել ընտանիքի ու ընկերների հետ։',
  ],
  faq: [
    {
      question: 'Ինչպե՞ս խաղալ «Կախաղան»-ը։',
      list: 'ol',
      answer: [
        'Ընտրեք տառ էկրանի ստեղնաշարից։',
        'Եթե տառը կա բառում, այն բացվում է բոլոր այն տեղերում, որտեղ հանդիպում է։',
        `Յուրաքանչյուր սխալ տառ ավելացնում է կախաղանի նկարի մի մաս։ ${MAX_MISTAKES + 1}-րդ սխալից հետո ռաունդը պարտված է։`,
        'Եթե միացված է ժամանակի սահմանափակումը, բառը պետք է գուշակել մինչև ժամանակի ավարտը։',
      ],
    },
    {
      question: 'Ի՞նչ ռեժիմներ ունի խաղը։',
      list: 'ul',
      answer: [
        'Մեկ հոգով. բառն ընտրում է արհեստական բանականությունը՝ ըստ ձեր ընտրած թեմայի և բարդության։ Յուրաքանչյուր գուշակված բառի համար ստանում եք մեկ միավոր։',
        'Երկու հոգով. խաղացողները հերթով բառ են գրում միմյանց համար նույն սարքով, իսկ միավորը ստանում է գուշակողը։',
        'Մարտահրավեր. գրեք բառ և ուղարկեք ստացված հղումը ընկերոջը, որպեսզի նա գուշակի այն։',
      ],
    },
    {
      question: 'Ի՞նչ թեմաներով բառեր կան։',
      answer: [
        `${TOPICS.length} թեմա՝ ${TOPICS.join(', ')}, ինչպես նաև բառեր փոքրերի համար։ Բարդության մակարդակները հինգն են՝ շատ հեշտից մինչև շատ դժվար։`,
      ],
    },
    {
      question: 'Կա՞ն հուշումներ։',
      answer: [
        `Այո։ Մեկ հոգով ռեժիմում «Հուշում» կոճակը ցույց է տալիս բառի նկարագրությունը, իսկ կողքի կոճակը բացում է պատահական տառ՝ բառի բոլոր այն տեղերում, որտեղ այն հանդիպում է։ Ամեն օր անվճար են ${FREE_HINTS_PER_DAY} հուշում և ${FREE_LETTERS_PER_DAY} տառ։ Պրեմիումով (${PREMIUM_PRICE_TEXT}՝ ${PREMIUM_DAYS} օրով, առանց բաժանորդագրության) դրանք անսահմանափակ են։`,
      ],
    },
    {
      question: 'Որտե՞ղ է պահվում վիճակագրությունը։',
      answer: [
        'Մեկ հոգով խաղերի արդյունքները՝ գուշակված բառերը, անընդմեջ հաջողությունների շարքը և հաղթած խաղերը, պահվում են միայն ձեր սարքում և երևում են «Վիճակագրություն» բաժնում։',
      ],
    },
    {
      question: 'Կարելի՞ է խաղալ առանց ինտերնետի։',
      answer: [
        'Այո։ Առանց ինտերնետի խաղը շարունակում է աշխատել․ մեկ հոգով ռեժիմում բառն ընտրվում է ներկառուցված ցանկից, իսկ երկու հոգով խաղը լիովին հասանելի է։ Խաղը կարելի է տեղադրել որպես հավելված հեռախոսում և համակարգչում։',
      ],
    },
  ],
  // For searches in English and Russian; each block is marked with its language
  translations: [
    {
      lang: 'en',
      title: 'Armenian Hangman game',
      text: `Kakhaghan is a free online Armenian Hangman game. Guess the hidden Armenian word letter by letter before the gallows drawing is complete. Play against AI in ${TOPICS.length} topics and five difficulty levels, with a friend on one device, or send a friend a challenge link. It works on phones, tablets and computers, offline too, and installs as an app. No sign-up needed.`,
    },
    {
      lang: 'ru',
      title: 'Виселица на армянском языке',
      text: '«Կախաղան» — бесплатная онлайн-игра «Виселица» на армянском языке. Угадайте армянское слово по буквам, пока не дорисована виселица: против ИИ, вдвоём на одном устройстве или по ссылке-вызову другу. Работает на телефоне и компьютере, в том числе без интернета.',
    },
  ],
}

const author = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#author`,
  name: AUTHOR_NAME,
  alternateName: AUTHOR_NAME_LATIN,
  url: AUTHOR_URL,
  sameAs: [AUTHOR_URL, AUTHOR_GITHUB_URL],
}

// Home page only. Every value is true of the page; ratings are left out because the game collects none.
export const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      // Google takes the site name shown above the result from here
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      description: SITE_DESCRIPTION,
      inLanguage: 'hy',
      publisher: { '@id': author['@id'] },
    },
    {
      '@type': ['VideoGame', 'WebApplication'],
      '@id': `${SITE_URL}/#app`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: SITE_ALTERNATE_NAMES,
      description: SITE_DESCRIPTION,
      inLanguage: 'hy',
      keywords: SITE_KEYWORDS.join(', '),
      genre: ['Word game', 'Puzzle'],
      // The classic game it is a version of
      about: {
        '@type': 'Thing',
        name: 'Hangman',
        sameAs: ['https://en.wikipedia.org/wiki/Hangman_(game)', 'https://ru.wikipedia.org/wiki/Виселица_(игра)'],
      },
      applicationCategory: 'GameApplication',
      applicationSubCategory: 'Word game',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Installable, and playable offline once loaded.',
      gamePlatform: ['Web browser', 'Android', 'iOS'],
      playMode: ['SinglePlayer', 'MultiPlayer'],
      numberOfPlayers: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2 },
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'AMD' },
      image: `${SITE_URL}/images/icon-512x512.png`,
      screenshot: `${SITE_URL}${SHARE_IMAGE.url}`,
      author: { '@id': author['@id'] },
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    author,
    {
      // The questions under the start screen, word for word
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      url: `${SITE_URL}/`,
      inLanguage: 'hy',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: HOME_ABOUT.faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer.join(' ') },
      })),
    },
  ],
}
