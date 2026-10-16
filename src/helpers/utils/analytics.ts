import { GA_ENABLED } from 'helpers/constants/analytics'

type TAnalyticsEvent =
  | 'game_start'
  | 'round_end'
  | 'game_end'
  | 'game_abandoned'
  | 'hint_used'
  | 'hint_locked'
  | 'ai_word_failed'
  | 'offline_word_used'
  | 'challenge_created'
  | 'challenge_opened'
  | 'sound_toggled'
  | 'pwa_prompt_shown'
  | 'pwa_installed'
  | 'interstitial_shown'

type TDataLayerWindow = Window & { dataLayer?: unknown[] }

// Queues a gtag command; gtag.js reads the queue once it loads. It must push the real `arguments` object.
const gtag: (...args: unknown[]) => void = function () {
  const analyticsWindow = window as TDataLayerWindow
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || []
  // eslint-disable-next-line prefer-rest-params
  analyticsWindow.dataLayer.push(arguments)
}

// Sends a custom event to GA4 (docs/GOOGLE_ANALYTICS.md lists them)
export const trackEvent = (event: TAnalyticsEvent, params: Record<string, unknown> = {}) => {
  if (!GA_ENABLED || typeof window === 'undefined') return
  gtag('event', event, params)
}

// The path only: a challenge link's ?c= token holds the word and stays out of GA
export const trackPageView = (path: string) => {
  if (!GA_ENABLED || typeof window === 'undefined') return
  gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
    page_location: `${window.location.origin}${path}`,
  })
}
