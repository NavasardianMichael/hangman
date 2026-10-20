import { FREE_HINTS_PER_DAY, MAX_MISTAKES, SITE_URL } from 'helpers/constants/app'

export const AUTHOR_NAME = 'Միքայել Նավասարդյան'
export const AUTHOR_URL = 'https://www.linkedin.com/in/michael-navasardyan/'

export const SITE_TITLE = 'Կախաղան | հայերեն բառ գուշակելու խաղ'

// One sentence answer engines can quote, and the meta description
export const SITE_DESCRIPTION =
  '«Կախաղան»-ը հայերեն բառ գուշակելու անվճար առցանց խաղ է։ Խաղացեք արհեստական բանականության դեմ, երկու հոգով նույն սարքով, կամ ուղարկեք մարտահրավեր ընկերոջը։'

// Temporary: /rules, /about and /privacy stay out of search. Set back to true to index them again.
export const INFO_PAGES_INDEXABLE = false

export const infoPageRobots = INFO_PAGES_INDEXABLE
  ? { index: true, follow: true }
  : { index: false, follow: false }

export type TFaqItem = {
  question: string
  // Each string is one visible sentence. Schema uses the same words, joined.
  answer: string[]
  list?: 'ol' | 'ul'
}

// Visible on /rules and repeated in FAQPage JSON-LD. Keep the two in this one list.
export const RULES_FAQ: TFaqItem[] = [
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
      'Երկու հոգով. խաղացողները հերթով բառ են գրում միմյանց համար նույն սարքով, իսկ միավորը ստանում է գուշակողը։ Հաղթում է նա, ով առաջինը հավաքում է նշված միավորները, և երկու խաղացողն էլ ունենում են հավասար թվով հերթեր։',
      'Մարտահրավեր. գրեք բառ և ուղարկեք ստացված հղումը ընկերոջը, որպեսզի նա գուշակի այն։',
    ],
  },
  {
    question: 'Քանի՞ հուշում կարելի է բացել օրական։',
    answer: [
      `Մեկ հոգով ռեժիմում, երբ բառն առաջարկել է արհեստական բանականությունը, օրվա ընթացքում կարելի է բացել մինչև ${FREE_HINTS_PER_DAY} հուշում։ Սահմանաչափը թարմանում է հաջորդ օրը։`,
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
      'Այո։ Առանց ինտերնետի խաղը շարունակում է աշխատել. մեկ հոգով ռեժիմում բառն ընտրվում է ներկառուցված ցանկից, իսկ երկու հոգով խաղը լիովին հասանելի է։',
    ],
  },
]

const author = {
  '@type': 'Person',
  name: AUTHOR_NAME,
  url: AUTHOR_URL,
}

const application = {
  '@type': 'WebApplication',
  '@id': `${SITE_URL}/#app`,
  name: 'Կախաղան',
  alternateName: ['Hangman', 'կախաղան խաղ'],
  url: `${SITE_URL}/`,
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  inLanguage: 'hy',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'AMD' },
  description: SITE_DESCRIPTION,
  author,
}

export const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'Կախաղան',
      alternateName: 'Hangman',
      inLanguage: 'hy',
      description: SITE_DESCRIPTION,
    },
    application,
  ],
}

export const rulesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: 'hy',
  url: `${SITE_URL}/rules`,
  mainEntity: RULES_FAQ.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer.join(' ') },
  })),
}

export const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: `${SITE_URL}/about`,
  name: 'Մեր մասին | Կախաղան',
  inLanguage: 'hy',
  description: `«Կախաղան»-ը ${AUTHOR_NAME}ի անվճար հայերեն խաղն է՝ բառ գուշակելու համար։`,
  mainEntity: application,
  author,
}
