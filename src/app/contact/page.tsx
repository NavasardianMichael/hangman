import { Metadata } from 'next'
import { CONTACT_DETAILS } from 'helpers/constants/contact'
import { ContactForm } from 'components/contactForm'
import { InfoPage } from 'components/infoPage'
import { LocationIcon, MailIcon, PhoneIcon } from 'components/shared/icons'

export const metadata: Metadata = {
  title: 'Կապ մեզ հետ | Կախաղան',
  description: 'Հարց, առաջարկ կամ խնդիր «Կախաղան» խաղի կամ պրեմիումի վճարման հետ կապված․ գրեք մեզ։',
  alternates: { canonical: '/contact' },
  robots: { index: false, follow: true },
}

const DETAIL_ICONS = {
  address: <LocationIcon />,
  email: <MailIcon />,
  phone: <PhoneIcon />,
}

// Email and phone open the mail app or the dialer; the phone is written the Armenian way (0 + 8 digits)
const getDetailHref = (key: (typeof CONTACT_DETAILS)[number]['key'], value: string) => {
  if (key === 'phone') return `tel:+374${value.replace(/\D/g, '').replace(/^0/, '')}`
  return undefined
}

// The contact form, with the address, email and phone below it (as on cv-builder's contact page)
export default function ContactPage() {
  const details = CONTACT_DETAILS.filter(({ value }) => value.trim() !== '')

  return (
    <InfoPage
      title='Կապ մեզ հետ'
      intro={
        <p>Հարց, առաջարկ կամ խնդիր կա՞, այդ թվում՝ վճարման հետ կապված։ Գրեք մեզ, և մենք կպատասխանենք Ձեր էլ. փոստին։</p>
      }
    >
      <ContactForm />
      <ul className='mx-0 mt-7 mb-0 flex list-none flex-col gap-1 border-0 border-t border-dashed border-[rgba(35,35,35,0.22)] p-0 pt-5'>
        {details.map(({ key, label, value }) => {
          const href = getDetailHref(key, value)
          // Email and phone are Latin letters and digits: the system font keeps them readable
          const valueClasses = `block text-[0.75rem] leading-[1.45] text-ink! no-underline wrap-anywhere ${key === 'address' ? '' : 'font-sans tracking-normal!'}`

          return (
            <li key={key} className='flex min-w-0 items-center gap-3 py-1.5'>
              <span
                aria-hidden='true'
                className='flex size-9 flex-none items-center justify-center rounded-full bg-secondary/10 text-[1.05rem] text-secondary'
              >
                {DETAIL_ICONS[key]}
              </span>
              <span className='flex min-w-0 flex-col'>
                <span className='text-[0.7rem] leading-[1.4] text-[#7a7a7a]'>{label}</span>
                {href ? (
                  <a href={href} className={`${valueClasses} hover:underline`}>
                    {value}
                  </a>
                ) : (
                  <span className={valueClasses}>{value}</span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </InfoPage>
  )
}
