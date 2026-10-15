import { create } from 'zustand'

// Short-lived UI state that isn't saved with the game

export type TLeaveDialogVariant = 'game' | 'challenge' | 'new-game'

type TLeaveDialog = {
  variant: TLeaveDialogVariant
  onConfirm: () => void
}

type TUiStore = {
  // The router has restored the screen from the URL
  isRouterReady: boolean
  leaveDialog: TLeaveDialog | null
  // A hint dialog or the rewarded ad is open; the round's timer waits meanwhile
  isHintFlowActive: boolean
  setRouterReady: () => void
  openLeaveDialog: (dialog: TLeaveDialog) => void
  closeLeaveDialog: () => void
  setHintFlowActive: (active: boolean) => void
}

export const useUiStore = create<TUiStore>()((set) => ({
  isRouterReady: false,
  leaveDialog: null,
  isHintFlowActive: false,
  setRouterReady: () => set({ isRouterReady: true }),
  openLeaveDialog: (leaveDialog) => set({ leaveDialog }),
  closeLeaveDialog: () => set({ leaveDialog: null }),
  setHintFlowActive: (isHintFlowActive) => set({ isHintFlowActive }),
}))
