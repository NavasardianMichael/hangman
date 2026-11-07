import { Metadata } from 'next'
import Link from 'next/link'
import { CONTACT_EMAIL } from 'helpers/constants/app'
import { FREE_HINTS_PER_DAY, FREE_LETTERS_PER_DAY, PREMIUM_DAYS, PREMIUM_PRICE_TEXT } from 'helpers/constants/premium'
import { INFO_PATHS } from 'helpers/constants/routes'
import { InfoPage } from 'components/infoPage'

// A draft written to describe how the game actually works; have it reviewed before going live with payments.
// Ameriabank's merchant agreement requires this page, the privacy policy and the refund policy to be on the site.

export const metadata: Metadata = {
  title: 'Օգտագործման պայմաններ | Կախաղան',
  description: '«Կախաղան» խաղի և պրեմիումի օգտագործման պայմանները։',
  alternates: { canonical: INFO_PATHS.terms },
  robots: { index: false, follow: true },
}

export default function TermsPage() {
  return (
    <InfoPage
      title='Օգտագործման պայմաններ'
      sections={[
        {
          title: '1. Ծառայությունը',
          body: (
            <p>
              «Կախաղան»-ը (hangman.eapps.site) հայերեն բառախաղ է, որը հասանելի է դիտարկիչում և որպես տեղադրվող հավելված։
              Խաղն անվճար է և չի պահանջում գրանցում։ Մեկ հոգով խաղի բառերն առաջարկում է արհեստական բանականությունը,
              ուստի բառերում և հուշումներում հնարավոր են անճշտություններ։
            </p>
          ),
        },
        {
          title: '2. Անվճար և վճարովի հնարավորություններ',
          body: (
            <>
              <p>
                Մեկ հոգով խաղում օրական անվճար է {FREE_HINTS_PER_DAY} հուշում և {FREE_LETTERS_PER_DAY} տառի բացում։ Օրը
                հաշվվում է Ձեր սարքի ժամացույցով։
              </p>
              <p>
                Պրեմիումը վճարման պահից {PREMIUM_DAYS} օր հնարավորություն է տալիս օգտվել հուշումներից և տառերի բացումից
                առանց սահմանափակման։ Խաղի մնացած բոլոր հնարավորությունները նույնն են պրեմիումով և առանց դրա։
              </p>
            </>
          ),
        },
        {
          title: '3. Վճարում',
          body: (
            <>
              <p>
                Պրեմիումի գինը {PREMIUM_PRICE_TEXT} է {PREMIUM_DAYS} օրվա համար՝ մեկանգամյա վճարով։ Սա
                բաժանորդագրություն չէ․ պրեմիումն ինքնաշխատ չի երկարաձգվում, և Ձեր քարտից կրկնակի գանձում չի կատարվում։{' '}
                {PREMIUM_DAYS} օրը լրանալուց հետո պրեմիումը կրկին ստանալու համար անհրաժեշտ է նորից վճարել։ Ակտիվ
                պրեմիումի ընթացքում նոր վճարում հնարավոր չէ։
              </p>
              <p>
                Վճարումը կատարվում է Ամերիաբանկի անվտանգ վճարային էջում։ Քարտի տվյալները մեզ չեն փոխանցվում և մեր կողմից
                չեն պահվում։
              </p>
            </>
          ),
        },
        {
          title: '4. Պրեմիումը և Ձեր սարքը',
          body: (
            <p>
              Պրեմիումը գնվում է առանց հաշվի և կապվում է այն դիտարկիչին կամ հավելվածին, որից կատարվել է վճարումը։ Այլ
              սարքից կամ դիտարկիչից այն հասանելի չէ, և կայքի տվյալները դիտարկիչից ջնջելու դեպքում այդ սարքում այն
              կորչում է։ Խնդրի դեպքում <Link href={INFO_PATHS.contact}>կապվեք մեզ հետ</Link>։
            </p>
          ),
        },
        {
          title: '5. Պատասխանատվություն',
          body: (
            <p>
              Ծառայությունը տրամադրվում է «ինչպես կա» սկզբունքով։ Մենք ձգտում ենք, որ խաղը միշտ հասանելի լինի, բայց չենք
              երաշխավորում դրա անխափան աշխատանքը։
            </p>
          ),
        },
        {
          title: '6. Կապ',
          body: (
            <p>
              Հարցերի դեպքում գրեք <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> հասցեին կամ{' '}
              <Link href={INFO_PATHS.contact}>կապի էջից</Link>։ Տես նաև{' '}
              <Link href={INFO_PATHS.privacy}>գաղտնիության քաղաքականությունը</Link> և{' '}
              <Link href={INFO_PATHS.refund}>վերադարձի քաղաքականությունը</Link>։
            </p>
          ),
        },
      ]}
      footnote='Վերջին թարմացում՝ 6 նոյեմբերի, 2026թ.'
    />
  )
}
