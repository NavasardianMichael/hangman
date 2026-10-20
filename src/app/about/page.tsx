import { Metadata } from 'next'
import { CONTACT_EMAIL } from 'helpers/constants/app'
import { aboutJsonLd, AUTHOR_NAME, infoPageRobots, SITE_DESCRIPTION } from 'helpers/constants/seo'
import { ContentPage } from 'components/contentPage'
import { JsonLd } from 'components/jsonLd'

export const metadata: Metadata = {
  title: 'Մեր մասին | Կախաղան',
  description: `«Կախաղան»-ը ${AUTHOR_NAME}ի անվճար հայերեն խաղն է՝ բառ գուշակելու համար, արհեստական բանականությամբ, երկու հոգով կամ մարտահրավերով։`,
  alternates: { canonical: '/about' },
  robots: infoPageRobots,
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutJsonLd} />
      <ContentPage
        title='Մեր մասին'
        intro={
          <p>
            {SITE_DESCRIPTION} Այն ստեղծվել է հայերենով խաղալու, բառապաշարը հարստացնելու և ընկերների հետ ժամանց
            անցկացնելու համար։
          </p>
        }
        sections={[
          {
            title: 'Ինչ կա խաղում',
            body: (
              <ul>
                <li>Ավելի քան 30 թեմա և բարդության հինգ մակարդակ՝ շատ հեշտից մինչև շատ դժվար</li>
                <li>Երեք ռեժիմ՝ արհեստական բանականության դեմ, երկու հոգով նույն սարքով, և մարտահրավեր հղումով</li>
                <li>Մինչև երեք անվճար հուշում օրական, երբ բառն առաջարկել է արհեստական բանականությունը</li>
                <li>Վիճակագրություն և հաջողությունների շարք, որոնք պահվում են ձեր սարքում</li>
                <li>Աշխատում է հեռախոսում, պլանշետում և համակարգչում, նաև առանց ինտերնետի</li>
                <li>Կարելի է տեղադրել որպես հավելված</li>
              </ul>
            ),
          },
          {
            title: 'Հեղինակ',
            body: <p>Խաղը ստեղծել է {AUTHOR_NAME}ը։</p>,
          },
          {
            title: 'Կապ',
            body: (
              <p>
                Առաջարկների, սխալների կամ հարցերի դեպքում գրեք՝ <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </p>
            ),
          },
        ]}
      />
    </>
  )
}
