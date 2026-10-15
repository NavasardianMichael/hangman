'use client'

import { FC, ReactNode } from 'react'
import { ConfigProvider, Modal, ThemeConfig } from 'antd'
import { TContentSection } from 'components/contentPage'
import pageStyles from 'components/contentPage/styles.module.css'
import styles from './styles.module.css'

// The paper card of the content pages (rules, about, privacy)
const THEME_CONFIG: ThemeConfig = {
  token: {
    colorPrimary: '#575757',
    borderRadius: 0,
  },
  components: {
    Modal: {
      contentBg: '#f6f3ec',
      footerBg: '#f6f3ec',
    },
  },
}

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
  <ConfigProvider theme={THEME_CONFIG}>
    <Modal
      centered
      open={open}
      onCancel={onClose}
      footer={footer}
      width='min(92vw, 480px)'
      classNames={{ body: styles.content }}
    >
      <h2 className={pageStyles.title}>{title}</h2>
      {intro && <div className={pageStyles.intro}>{intro}</div>}
      {sections.map(({ title: sectionTitle, body }) => (
        <section key={sectionTitle} className={pageStyles.section}>
          <h3 className={pageStyles.sectionTitle}>{sectionTitle}</h3>
          <div className={pageStyles.body}>{body}</div>
        </section>
      ))}
    </Modal>
  </ConfigProvider>
)
