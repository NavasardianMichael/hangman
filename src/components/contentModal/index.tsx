'use client'

import { FC, ReactNode } from 'react'
import { Dialog } from 'components/shared/dialog'

export type TContentSection = {
  title: string
  body: ReactNode
}

// The display font is all caps and wide, so long text uses smaller sizes and tighter spacing than the game
const CONTENT_CLASSES = {
  title: 'mx-0 mt-0 mb-1 text-[1.45rem] leading-[1.3] tracking-[1px]',
  intro: 'text-[0.95rem] [&_a]:text-[#1f4e79]',
  section: 'mt-5',
  sectionTitle: 'mx-0 mt-0 mb-[0.4rem] text-[1.1rem] leading-[1.4] tracking-[1px]',
  body: 'text-[0.9rem] [&_a]:[word-break:break-word] [&_a]:text-[#1f4e79] [&_li]:mb-[0.3rem] [&_ol]:mt-0 [&_ol]:mb-2 [&_ol]:pl-5 [&_p]:mt-0 [&_p]:mb-2 [&_ul]:mt-0 [&_ul]:mb-2 [&_ul]:pl-5',
}

type TProps = {
  open: boolean
  title: string
  intro?: ReactNode
  sections?: TContentSection[]
  footer: ReactNode
  onClose: () => void
}

// A paper dialog for longer text, such as the round's hint
export const ContentModal: FC<TProps> = ({ open, title, intro, sections = [], footer, onClose }) => (
  <Dialog
    variant='paper'
    open={open}
    onClose={onClose}
    footer={footer}
    width='min(92vw, 480px)'
    bodyClassName='px-2 pt-3 pb-1 leading-[1.6] tracking-[1px] text-[#2b2b2b] select-text [&_div]:leading-[inherit] [&_div]:tracking-[inherit]'
  >
    <h2 className={CONTENT_CLASSES.title}>{title}</h2>
    {intro && <div className={CONTENT_CLASSES.intro}>{intro}</div>}
    {sections.map(({ title: sectionTitle, body }) => (
      <section key={sectionTitle} className={CONTENT_CLASSES.section}>
        <h3 className={CONTENT_CLASSES.sectionTitle}>{sectionTitle}</h3>
        <div className={CONTENT_CLASSES.body}>{body}</div>
      </section>
    ))}
  </Dialog>
)
