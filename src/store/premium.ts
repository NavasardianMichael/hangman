import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// This browser's premium (docs/PAYMENTS.md). Kept apart from the game store so starting a game never touches it.
// The server is the source of truth; `until` is its last answer, kept so premium works offline too.

type TPremiumStore = {
  // A random secret made at the first checkout; the server knows only its hash. It is the purchase: clearing the
  // site's data loses it.
  buyerKey: string | null
  // End of the latest paid month (epoch ms); in the past once it expired
  until: number | null
  // A checkout was started and the bank's answer hasn't been read yet
  checkoutPending: boolean
  // The `until` whose "the month is over" notice was already shown
  expiryNoticeFor: number | null
  setPremium: (update: Partial<Omit<TPremiumStore, 'setPremium'>>) => void
}

export const usePremiumStore = create<TPremiumStore>()(
  persist(
    (set) => ({
      buyerKey: null,
      until: null,
      checkoutPending: false,
      expiryNoticeFor: null,
      setPremium: (update) => set(update),
    }),
    {
      name: 'hangman-premium',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)

export const isPremiumActive = (until: number | null, now = Date.now()) => !!until && until > now
