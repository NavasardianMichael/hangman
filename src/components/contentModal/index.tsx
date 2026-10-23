'use client'

import { FC, ReactNode } from 'react'
import { CONTENT_CLASSES, TContentSection } from 'components/contentPage'
import { Dialog } from 'components/shared/dialog'

type TProps = {
  open: boolean
  title: string
  intro?: ReactNode
  sections?: TContentSection[]
  footer: ReactNode
  onClose: () => void
}

// A dialog with the same look and typography as the content pages
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
