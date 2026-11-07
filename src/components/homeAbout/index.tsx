import { FC } from 'react'
import { HOME_ABOUT } from 'helpers/constants/seo'

// The display font is all caps and wide, so long text uses smaller sizes and tighter spacing than the game. The base
// styles give headings their own letter spacing, so they set it again.
const CLASSES = {
  title: 'mx-0 mt-0 mb-2 text-[1.3rem] leading-[1.35] font-normal tracking-[1px]',
  heading: 'mx-0 mt-5 mb-[0.4rem] text-[1.05rem] leading-[1.4] font-normal tracking-[1px]',
  text: 'mt-0 mb-2',
  list: 'mt-0 mb-2 pl-5 [&_li]:mb-[0.3rem]',
}

// The home page's text under the start screen: what the game is and how to play it, in the words people search it by
// (helpers/constants/seo.ts). Rendered on the server for the home page only; once the start screen is gone (the
// game's screens change the URL without leaving this page), it hides with it.
export const HomeAbout: FC = () => (
  <section
    aria-labelledby='about-game'
    className='mx-auto box-border w-[min(100%,var(--column-width))] px-4 pt-4 pb-[calc(var(--safe-bottom)+1.5rem)] select-text [[data-challenge-opening]_&]:hidden [body:not(:has([data-start-screen]))_&]:hidden'
  >
    <article className='box-border paper-sheet px-6 pt-6 pb-5 text-[0.85rem] leading-[1.6] tracking-[1px] text-[#2b2b2b]'>
      <h2 id='about-game' className={CLASSES.title}>
        {HOME_ABOUT.title}
      </h2>
      {HOME_ABOUT.intro.map((paragraph) => (
        <p key={paragraph} className={CLASSES.text}>
          {paragraph}
        </p>
      ))}

      {HOME_ABOUT.faq.map(({ question, answer, list }) => {
        const ListTag = list
        return (
          <section key={question}>
            <h3 className={CLASSES.heading}>{question}</h3>
            {ListTag ? (
              <ListTag className={CLASSES.list}>
                {answer.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ListTag>
            ) : (
              answer.map((line) => (
                <p key={line} className={CLASSES.text}>
                  {line}
                </p>
              ))
            )}
          </section>
        )
      })}

      {HOME_ABOUT.translations.map(({ lang, title, text }) => (
        <section key={lang} lang={lang}>
          <h3 className={CLASSES.heading}>{title}</h3>
          <p className={CLASSES.text}>{text}</p>
        </section>
      ))}
    </article>
  </section>
)
