import { Metadata } from 'next'
import Link from 'next/link'
import { PREMIUM_DAYS, PREMIUM_PRICE_TEXT } from 'helpers/constants/premium'
import { INFO_PATHS } from 'helpers/constants/routes'
import { InfoPage } from 'components/infoPage'

// A draft; have it reviewed before going live with payments. Required on the site by Ameriabank's merchant agreement.

export const metadata: Metadata = {
  title: 'Վերադարձի քաղաքականություն | Կախաղան',
  description: '«Կախաղան» խաղի պրեմիումի վճարումների վերադարձի պայմանները։',
  alternates: { canonical: INFO_PATHS.refund },
  robots: { index: false, follow: true },
}

export default function RefundPolicyPage() {
  return (
    <InfoPage
      title='Վերադարձի քաղաքականություն'
      sections={[
        {
          title: '1. Թվային ծառայություն',
          body: (
            <p>
              Պրեմիումը ({PREMIUM_PRICE_TEXT}՝ {PREMIUM_DAYS} օրով) թվային ծառայություն է, որն ակտիվանում է բանկի կողմից
              վճարումը հաստատվելուն պես։ Վճարելուց առաջ խաղը, ներառյալ հուշումները և տառերի բացումը, կարող եք անվճար
              փորձել օրական սահմանաչափով։
            </p>
          ),
        },
        {
          title: '2. Երբ ենք վերադարձնում գումարը',
          body: (
            <ul>
              <li>
                Եթե գումարը գանձվել է, բայց պրեմիումը տեխնիկական պատճառով չի ակտիվացել, և մենք չենք կարողանում դա շտկել։
              </li>
              <li>Եթե սխալմամբ վճարել եք երկու անգամ (օրինակ՝ երկու պատուհանից)․ վերադարձվում է կրկնակի վճարումը։</li>
            </ul>
          ),
        },
        {
          title: '3. Երբ գումարը չի վերադարձվում',
          body: (
            <p>
              Ակտիվացած պրեմիումի գումարը, այդ թվում՝ ամսվա չօգտագործված օրերի համար, չի վերադարձվում, բացառությամբ վերը
              նշված դեպքերի։ Պրեմիումն ինքնաշխատ չի երկարաձգվում, ուստի չեղարկելու կարիք չկա։
            </p>
          ),
        },
        {
          title: '4. Ինչպես դիմել',
          body: (
            <p>
              <Link href={INFO_PATHS.contact}>Կապվեք մեզ հետ</Link> վճարումից 14 օրվա ընթացքում՝ նշելով վճարման
              ամսաթիվը, գումարը և քարտի վերջին չորս թվանշանները։ Հաստատված վերադարձը կատարվում է նույն քարտին՝ բանկի
              ժամկետներում, և դրանով ավարտվում է այդ վճարման պրեմիումը։
            </p>
          ),
        },
      ]}
      footnote='Վերջին թարմացում՝ 6 նոյեմբերի, 2026թ.'
    />
  )
}
