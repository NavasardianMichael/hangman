import { CONTACT_EMAIL } from './app'

// The contact page's details (address, email, phone), shown as written; an empty one is left out.
// The same person and address as cv-builder's contact page (src/constants/app.ts there).
export const CONTACT_PHONE = '098 75 16 15'
export const CONTACT_ADDRESS = 'Ք․ Երևան, Կուրղինյան 14շ, 33'

export const CONTACT_DETAILS = [
  { key: 'email', label: 'Էլ. փոստ', value: CONTACT_EMAIL },
  { key: 'phone', label: 'Հեռախոս', value: CONTACT_PHONE },
  { key: 'address', label: 'Հասցե', value: CONTACT_ADDRESS },
] as const

// Shared by the form and POST /api/contact
export const CONTACT_LIMITS = {
  fullName: 100,
  email: 200,
  message: 5000,
} as const
