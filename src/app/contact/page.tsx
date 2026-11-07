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
      <ul className='mx-0 mt-8 mb-0 flex list-none flex-col gap-5 [border-top:1px_solid_rgba(35,35,35,0.2)] p-0 pt-6 min-[480px]:flex-row min-[480px]:justify-center min-[480px]:gap-6'>
        {details.map(({ key, label, value }) => (
          <li key={key} className='flex min-w-0 flex-col items-center gap-1 text-center min-[480px]:flex-1'>
            <span
              aria-hidden='true'
              className='flex size-8 items-center justify-center rounded-full border-[1.5px] border-solid border-[#2b2b2b] text-[1.05rem]'
            >
              {DETAIL_ICONS[key]}
            </span>
            <span className='text-[0.75rem] text-[#6a6a6a]'>{label}</span>
            <span className='text-[0.85rem] font-semibold [overflow-wrap:anywhere]'>{value}</span>
          </li>
        ))}
      </ul>
    </InfoPage>
  )
}
