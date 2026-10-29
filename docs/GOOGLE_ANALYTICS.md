# Google Analytics 4: manual setup

The code side is done. GA4 loads with the native `gtag.js` snippet, and Google Tag Manager is gone. Everything stays off
until `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set at build time.

What the app does once the ID is set:
- **`<head>`** (`src/app/layout.tsx`): defines `gtag`, sends `config` with `send_page_view: false`, and loads
  `https://www.googletagmanager.com/gtag/js?id=G-…`. Development builds also add `debug_mode`.
- **Page views** (`src/components/pageViewTracker`): one `page_view` per screen (`/`, `/settings`, `/discovery`,
  `/rules`, …).
  - The game changes the URL without a page load, so the app sends these itself.
  - Only the path is sent. A challenge link's `?c=…` token holds the word and never reaches GA.
- **Game events** (`trackEvent` in `src/helpers/utils/analytics.ts`), listed below.

---

## 1. Create the property and stream

1. Go to https://analytics.google.com and open **Admin**.
2. **Create → Property**:
   - Name: `Hangman`.
   - Time zone: Armenia.
   - Currency: whatever you prefer.
3. **Data streams → Add stream → Web**:
   - URL: `https://hangman.eapps.site`.
   - Stream name: `hangman web`.
4. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
   - Don't use a `GTM-…` container ID: the app rejects it and warns in the dev console.

## 2. Stop GA from counting page views twice

The app sends page views itself. GA's automatic counting of URL changes must be off, or every screen change counts
twice.

1. Go to **Admin → Data streams → hangman web → Enhanced measurement** (gear icon).
2. Open **Page views → Show advanced settings**.
3. **Uncheck "Page changes based on browser history events"**.
4. Keep the other enhanced measurement options as they are (scrolls, outbound clicks and so on are fine), then save.

## 3. Set the ID and deploy

1. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-…` to `.env.production.local`.
2. Run `pnpm -s envtob64` and save the output as the `ENV_FILE_BASE64` secret (GitHub → repository → **Settings →
   Secrets and variables → Actions**).
3. Push to `master`, or run the **Deploy to Production** workflow. The ID is baked in at build time, so
   changing it always needs a new build. Re-running only the Deploy job reuses the old bundle.

For local testing, put the same line in `.env.development.local` and run `pnpm dev`. Dev builds set `debug_mode`.

## 4. Verify

1. Open https://hangman.eapps.site with no ad blocker (ad blockers block GA too).
2. **DevTools → Network**, filtered by `collect`: requests to `google-analytics.com/g/collect` appear on load and
   on each screen change.
3. In GA, **Reports → Realtime**: you appear within a minute. Play a round and watch `game_start` and `round_end`
   arrive.
4. **Admin → DebugView** shows events from `pnpm dev` sessions in detail.

## 5. Register the event parameters

GA only shows custom parameters in reports after you register them.

1. Go to **Admin → Data display → Custom definitions → Create custom dimension**.
2. Choose scope **Event** and add the dimensions you want from the table below. Each event parameter name must
   match exactly (e.g. `mode`).
3. Numeric parameters (`wordLength`, `mistakes`) can be added as **custom metrics** instead.

Data from before you registered a dimension isn't filled in afterwards, so do this early.

## 6. Mark key events

Go to **Admin → Data display → Events**. Each event shows up there after it has fired at least once. Toggle **Mark
as key event** on the ones that mean success, for example:
- `game_end`: a finished game;
- `challenge_created`: someone shared a challenge;
- `pwa_installed`: an install.

## 7. Consent (EU visitors)

The AdSense **European regulations** consent message (see [ADSENSE.md](ADSENSE.md), step 6) is a Google-certified
CMP.
- It sends Google consent mode signals that `gtag.js` follows.
- So GA respects the visitor's choice with no extra code, as long as that message is published.
- To check it, go to **Admin → Data collection → Consent settings** in GA.

## 8. Retire the old Tag Manager container

The site no longer loads GTM (`GTM-NFWCRW7P`).

1. Once the new stream shows data, open https://tagmanager.google.com.
2. Pause or delete that container's tags (or the whole container) so nothing stale is left.
3. If its GA4 tag fed an older GA property, you can keep that property for its history.

## 9. Data retention (optional)

Go to **Admin → Data collection and modification → Data retention** and raise **Event data retention** to 14 months.
The default of 2 months limits Explorations to recent data.

---

## Events the app sends

| Event | When | Parameters |
|---|---|---|
| `page_view` | each screen change | `page_path`, `page_title`, `page_location` |
| `game_start` | a game starts from settings | `mode` |
| `round_end` | a round is won or lost | `mode`, `result`, `wordLength`, `mistakes`, `usedHint` |
| `game_end` | the final result screen | `mode`, `winner` |
| `game_abandoned` | the player leaves a running game with back | `stage` |
| `hint_used` | a hint is opened | `source` |
| `hint_locked` | a hint was asked for but none is left | none |
| `ai_word_failed` | the AI word request failed | `status` |
| `offline_word_used` | a built-in word was used instead | `category` |
| `challenge_created` | a challenge link was made | `wordLength` |
| `challenge_opened` | a challenge link was opened | none |
| `sound_toggled` | sound on/off | `enabled` |
| `pwa_prompt_shown` | the install prompt was shown | `source` |
| `pwa_installed` | the app was installed | none |
| `interstitial_shown` | an H5 interstitial ad started | `name` |

To add an event, extend `TAnalyticsEvent` in `src/helpers/utils/analytics.ts` and call `trackEvent`. Never send
personal data or the guessed word.

## Troubleshooting

| Symptom | Check |
|---|---|
| No `collect` requests | Does the deploy log's "Load build-time env" step show the ID as set? Did the build run after it was set? Is an ad blocker on? Does the head contain `gtag/js?id=G-…`? |
| Every screen counted twice | Step 2: "browser history events" is still on. |
| Parameters missing in reports | Step 5: register them. They fill in from that point on. |
| Few or no EU users | Expected until they accept consent, as long as the consent message is published. |
