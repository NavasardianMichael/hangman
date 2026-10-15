import { STORE_VARS } from 'helpers/constants/app'

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

const notifyListeners = () => listeners.forEach((listener) => listener())

// Registered when the bundle loads: the event can fire before the Start stage mounts
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the mini-infobar from appearing on mobile; the app shows its own prompt
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    notifyListeners()
  })
  // Installed from the browser menu instead: the saved prompt is no longer usable
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    notifyListeners()
  })
}

export const subscribeToInstallPrompt = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getInstallPrompt = () => deferredPrompt

export const getServerInstallPrompt = () => null

export const clearInstallPrompt = () => {
  deferredPrompt = null
  notifyListeners()
}

export const setAppInstalled = () => {
  localStorage.setItem(STORE_VARS.PWA_INSTALLED_DATE, Date.now().toString())
}

// Opens the browser's own install dialog; must run from a click. A prompt can be shown only once.
export const promptInstall = async () => {
  if (!deferredPrompt) return
  const prompt = deferredPrompt
  await prompt.prompt()
  const { outcome } = await prompt.userChoice
  if (outcome === 'accepted') setAppInstalled()
  clearInstallPrompt()
}
