import { FC, ReactNode } from 'react'
import Link from 'next/link'
import styles from './styles.module.css'

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

const PAGE_LINKS = [
  { href: '/rules', label: 'Կանոններ' },
  { href: '/about', label: 'Մեր մասին' },
  { href: '/privacy', label: 'Գաղտնիություն' },
]

// Static text pages (rules, about, privacy) in the same column as the game
export const ContentPage: FC<TProps> = ({ title, intro, sections, footnote }) => (
  <main className={styles.page}>
    <article className={styles.card}>
      <Link href='/' className={styles.back}>
        ← Վերադառնալ խաղին
      </Link>
      <div className={styles.scroll}>
        <h1 className={styles.title}>{title}</h1>
        {intro && <div className={styles.intro}>{intro}</div>}
        {sections.map(({ title: sectionTitle, body }) => (
          <section key={sectionTitle} className={styles.section}>
            <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
            <div className={styles.body}>{body}</div>
          </section>
        ))}
        {footnote && <p className={styles.footnote}>{footnote}</p>}
        <nav className={styles.links} aria-label='Տեղեկատվություն'>
          {PAGE_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </article>
  </main>
)
