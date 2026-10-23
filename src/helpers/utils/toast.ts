import { useUiStore } from 'store/ui'

// Short notices at the top of the screen (components/toaster)
export const toast = {
  success: (text: string) => useUiStore.getState().showToast({ type: 'success', text }),
  error: (text: string) => useUiStore.getState().showToast({ type: 'error', text }),
}
