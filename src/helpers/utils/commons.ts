export const isInWebView = () => {
  const ua = navigator.userAgent || navigator.vendor

  return (
    ua.includes('FBAN') || // Facebook
    ua.includes('FBAV') || // Facebook
    ua.includes('Instagram') || // Instagram
    ua.includes('Line') ||
    ua.includes('Twitter') ||
    ua.includes('Messenger')
  )
}

export const normalizeSpaces = (str: string) => {
  return str.trim().replace(/\s+/g, ' ')
}

// iPadOS reports itself as a Mac, so touch support tells them apart
export const isIos = () => {
  const ua = navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(ua) || (ua.includes('macintosh') && navigator.maxTouchPoints > 1)
}

export const isIosInStandaloneMode = () => 'standalone' in window.navigator && !!window.navigator.standalone

const INSTALLED_DISPLAY_MODES = ['standalone', 'fullscreen', 'minimal-ui'] as const

export const isNonIosStandaloneMode = () =>
  INSTALLED_DISPLAY_MODES.some((mode) => window.matchMedia(`(display-mode: ${mode})`).matches)

export const isInstalledApp = () => (isIos() ? isIosInStandaloneMode() : isNonIosStandaloneMode())
