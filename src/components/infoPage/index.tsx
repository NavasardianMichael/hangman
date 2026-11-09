import { FC, ReactNode } from 'react'
import Link from 'next/link'
import { Background } from 'components/background'
import { BackIcon } from 'components/shared/icons'

export type TInfoSection = {
  title: string
  body: ReactNode
}

type TProps = {
  title: string
  intro?: ReactNode
  sections?: TInfoSection[]
  children?: ReactNode
  footnote?: ReactNode
}

// The display font is all caps and wide, so long text uses smaller sizes and tighter spacing than the game
const CLASSES = {
  title: 'mx-0 mt-0 mb-2 text-[1.45rem] leading-[1.3] tracking-[1px]',
  intro: 'text-[0.9rem] leading-[1.65] text-[#4a4a4a] [&_p]:m-0',
  section: 'mt-5',
  sectionTitle: 'mx-0 mt-0 mb-[0.4rem] text-[1.1rem] leading-[1.4] tracking-[1px]',
  body: 'text-[0.9rem] [&_li]:mb-[0.3rem] [&_ol]:mt-0 [&_ol]:mb-2 [&_ol]:pl-5 [&_p]:mt-0 [&_p]:mb-2 [&_ul]:mt-0 [&_ul]:mb-2 [&_ul]:pl-5',
}

// Pages outside the game (contact, terms, privacy, refund): a sheet of paper pinned over the blurred gallows art, in
// the game's column, scrolling inside
export const InfoPage: FC<TProps> = ({ title, intro, sections = [], children, footnote }) => (
  <>
    <Background />
    <main
      data-info-page
      className='fixed inset-0 box-border flex h-dvh max-h-dvh justify-center overflow-hidden overscroll-none px-3 pt-[calc(var(--top-inset)+0.9rem)] pb-[calc(var(--safe-bottom)+0.9rem)] select-text min-[600px]:px-4'
    >
      <article className='box-border flex h-full min-h-0 w-[min(100%,var(--column-width))] paper-sheet flex-col overflow-hidden rounded-[2px] px-6 pt-6 pb-2 leading-[1.6] tracking-[1px] text-[#2b2b2b] [&_a]:leading-[inherit] [&_a]:tracking-[inherit] [&_a]:[word-break:break-word] [&_a]:text-[#1f4e79] [&_div]:leading-[inherit] [&_div]:tracking-[inherit]'>
        <Link
          href='/'
          className='inline-flex flex-none items-center gap-1.5 self-start text-[0.8rem] text-secondary! underline underline-offset-4 transition-colors hover:text-ink!'
        >
          <BackIcon className='size-[1.1em]' />
          Վերադառնալ խաղին
        </Link>
        <div className='-mx-2 min-h-0 flex-auto [-webkit-overflow-scrolling:touch] overflow-y-auto overscroll-contain px-2 pt-3 pb-4'>
          <h1 className={CLASSES.title}>{title}</h1>
          {intro && <div className={CLASSES.intro}>{intro}</div>}
          {sections.map(({ title: sectionTitle, body }) => (
            <section key={sectionTitle} className={CLASSES.section}>
              <h2 className={CLASSES.sectionTitle}>{sectionTitle}</h2>
              <div className={CLASSES.body}>{body}</div>
            </section>
          ))}
          {children}
          {footnote && <p className='mt-6 text-[0.8rem] text-[#6a6a6a]'>{footnote}</p>}
        </div>
      </article>
    </main>
  </>
)
