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

type TDataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] }

// Pushes a custom event to the GTM dataLayer (tags and triggers are configured in GTM)
export const trackEvent = (event: TAnalyticsEvent, params: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return
  const analyticsWindow = window as TDataLayerWindow
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || []
  analyticsWindow.dataLayer.push({ event, ...params })
}
