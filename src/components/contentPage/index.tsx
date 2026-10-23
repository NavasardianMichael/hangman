import { FC, ReactNode } from 'react'
import Link from 'next/link'

export type TContentSection = {
  title: string
  body: ReactNode
}

type TProps = {
  title: string
  intro?: ReactNode
  sections: TContentSection[]
  footnote?: ReactNode
}

// Text styles shared with the content dialogs (components/contentModal)
export const CONTENT_CLASSES = {
  title: 'mx-0 mt-3 mb-2 text-[1.45rem] leading-[1.3] tracking-[1px]',
  intro: 'text-[0.95rem]',
  section: 'mt-5',
  sectionTitle: 'mx-0 mt-0 mb-[0.4rem] text-[1.1rem] leading-[1.4] tracking-[1px]',
  body: 'text-[0.9rem] [&_a]:[word-break:break-word] [&_a]:text-[#1f4e79] [&_li]:mb-[0.3rem] [&_ol]:mt-0 [&_ol]:mb-2 [&_ol]:pl-5 [&_p]:mt-0 [&_p]:mb-2 [&_ul]:mt-0 [&_ul]:mb-2 [&_ul]:pl-5',
}

// Static text pages (rules, about, privacy) in the same column as the game.
// The display font is all caps and wide, so long text uses smaller sizes and tighter spacing than the game.
export const ContentPage: FC<TProps> = ({ title, intro, sections, footnote }) => (
  <main
    data-content-page
    className='fixed inset-0 box-border flex h-dvh max-h-dvh justify-center overflow-hidden overscroll-none bg-[linear-gradient(160deg,#9a9a9a,#6f6f6f)] px-4 pt-[calc(var(--ad-band-height)_+_1rem)] pb-4 select-text'
  >
    <article className='box-border flex h-full min-h-0 w-[min(100%,var(--column-width))] flex-col overflow-hidden bg-paper px-5 pt-5 pb-6 leading-[1.6] tracking-[1px] text-[#2b2b2b] shadow-[0_0_48px_8px_rgba(0,0,0,0.25)] [&_a]:leading-[inherit] [&_a]:tracking-[inherit] [&_div]:leading-[inherit] [&_div]:tracking-[inherit]'>
      <Link href='/' className='flex-none text-[0.85rem] text-secondary no-underline hover:underline'>
        ← Վերադառնալ խաղին
      </Link>
      <div className='min-h-0 flex-[1_1_auto] [-webkit-overflow-scrolling:touch] overflow-y-auto overscroll-contain'>
        <h1 className={CONTENT_CLASSES.title}>{title}</h1>
        {intro && <div className={CONTENT_CLASSES.intro}>{intro}</div>}
        {sections.map(({ title: sectionTitle, body }) => (
          <section key={sectionTitle} className={CONTENT_CLASSES.section}>
            <h2 className={CONTENT_CLASSES.sectionTitle}>{sectionTitle}</h2>
            <div className={CONTENT_CLASSES.body}>{body}</div>
          </section>
        ))}
        {footnote && <p className='mt-6 text-[0.8rem] text-[#6a6a6a]'>{footnote}</p>}
      </div>
    </article>
  </main>
)
