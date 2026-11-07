import { create } from 'zustand'

// Short-lived UI state that isn't saved with the game

export type TLeaveDialogVariant = 'game' | 'challenge' | 'new-game'

type TLeaveDialog = {
  variant: TLeaveDialogVariant
  onConfirm: () => void
}

// The premium dialog (components/premiumDialog): an offer when a free daily limit is reached, the payment's result
// after the bank's redirect, or the notice that the paid month is over
export type TPremiumDialog =
  'offer' | 'hint-limit' | 'letter-limit' | 'expired' | 'result-succeeded' | 'result-failed' | 'result-pending'

export type TToast = {
  id: number
  type: 'success' | 'error'
  text: string
}

// How long a toast stays on screen
const TOAST_DURATION_MS = 3000

let nextToastId = 0

type TUiStore = {
  // The router has restored the screen from the URL
  isRouterReady: boolean
  leaveDialog: TLeaveDialog | null
  // A hint dialog is open; the round's timer waits meanwhile
  isHintFlowActive: boolean
  // Also pauses the round's timer
  premiumDialog: TPremiumDialog | null
  toasts: TToast[]
  setRouterReady: () => void
  openLeaveDialog: (dialog: TLeaveDialog) => void
  closeLeaveDialog: () => void
  setHintFlowActive: (active: boolean) => void
  setPremiumDialog: (dialog: TPremiumDialog | null) => void
  showToast: (toast: Omit<TToast, 'id'>) => void
}

export const useUiStore = create<TUiStore>()((set) => ({
  isRouterReady: false,
  leaveDialog: null,
  isHintFlowActive: false,
  premiumDialog: null,
  toasts: [],
  setRouterReady: () => set({ isRouterReady: true }),
  openLeaveDialog: (leaveDialog) => set({ leaveDialog }),
  closeLeaveDialog: () => set({ leaveDialog: null }),
  setHintFlowActive: (isHintFlowActive) => set({ isHintFlowActive }),
  setPremiumDialog: (premiumDialog) => set({ premiumDialog }),
  showToast: (toast) => {
    const id = nextToastId++
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })), TOAST_DURATION_MS)
  },
}))
