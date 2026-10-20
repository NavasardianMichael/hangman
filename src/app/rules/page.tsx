import { Metadata } from 'next'
import { infoPageRobots, RULES_FAQ, rulesJsonLd } from 'helpers/constants/seo'
import { ContentPage } from 'components/contentPage'
import { JsonLd } from 'components/jsonLd'

export const metadata: Metadata = {
  title: 'Խաղի կանոնները | Կախաղան',
  description:
    'Ինչպես խաղալ «Կախաղան»-ը հայերեն. տառ առ տառ գուշակել բառը, երեք ռեժիմ, օրական երեք հուշում և խաղ առանց ինտերնետի։',
  alternates: { canonical: '/rules' },
  robots: infoPageRobots,
}

export default function RulesPage() {
  return (
    <>
      <JsonLd data={rulesJsonLd} />
      <ContentPage
        title='Խաղի կանոնները'
        intro={
          <p>
            «Կախաղան»-ը հայերեն բառ գուշակելու խաղ է։ Նպատակն է գուշակել թաքնված բառը՝ տառ առ տառ, մինչև կախաղանի նկարն
            ամբողջանա։
          </p>
        }
        sections={RULES_FAQ.map(({ question, answer, list }) => ({
          title: question,
          body: list ? (
            list === 'ol' ? (
              <ol>
                {answer.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            ) : (
              <ul>
                {answer.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )
          ) : (
            <p>{answer[0]}</p>
          ),
        }))}
      />
    </>
  )
}
