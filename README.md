# Կախաղան | Hangman

The Armenian version of Hangman, playable on phones, tablets and desktops (and installable as a PWA). You can:
- guess a word chosen by AI (Google Gemini);
- play against a friend on one device;
- send a friend a challenge link.

Live: **https://hangman.eapps.site**

Stack: Next.js 16 (App Router, standalone output) · React 19 · TypeScript 6 · Tailwind CSS 4 · Zustand · `@google/genai`.

## Features

- **Modes:**
  - **Single player** against AI words, by category and difficulty.
  - **Two players** on one device.
  - **Challenge**: write a word, then share a link; the friend plays it on their own device.
- **Hints and letter reveals** in single player: one free hint and three free letter reveals a day. A letter reveal
  opens every cell of one random hidden letter.
- **Premium** (Ameriabank card payment, no account): 1000 ֏ for 30 days of unlimited hints and letter reveals. It's
  a one-time payment, not a subscription; when the month ends the player is told to pay again. See
  [docs/PAYMENTS.md](docs/PAYMENTS.md).
- **Contact and legal pages:** `/contact` (a form to the admin inbox, plus address, email and phone), `/terms`,
  `/privacy` and `/refund-policy`, linked from the start screen.
- **Next-word prefetch:** the next AI word loads while the current round is played.
- **Stats and streaks** for single-player rounds, stored locally.
- **Sound on/off toggle.**
- **Offline play:**
  - a service worker (`public/sw.js`) caches the app;
  - single-player falls back to a built-in word list (`src/helpers/constants/offlineWords.ts`) when offline or when the AI fails.
- **Responsive layout:**
  - a full-width game on phones;
  - a two-pane layout on short landscape screens;
  - a centered 600px column on larger screens.
- **Ink-style SVG hangman** that is drawn stroke by stroke with each mistake.
- **Routing and back gestures** (`src/helpers/utils/gameRouter.ts`, `src/helpers/utils/gameFlow.ts`):
  - Every screen has its own URL: `/`, `/settings`, `/composition`, `/discovery`, `/summary`, `/share`, `/end`. The URL is the source of truth for the current screen, and reloads keep you on it.
  - The device back gesture or browser back first closes an open dialog. Otherwise:
    - **Settings** goes back to start.
    - **Composition** goes back to settings in round 1.
    - **Share** goes back to editing the word.
    - **Finished screens** go home.
    - **A game in progress** asks "Leave the game?", and the timer pauses while it asks.
  - Start offers **Continue** for an unfinished saved game, and asks before a new game replaces it.
  - A link to a screen that doesn't fit the saved game goes to one that does.
- **SEO:** only `/` is indexed. Its title, description and JSON-LD (`WebSite`, `VideoGame`) carry the names the game is searched by, in `src/helpers/constants/seo.ts`. The game screens are noindex, with `/` as canonical.
- **GTM `dataLayer` events** (`src/helpers/utils/analytics.ts`): `game_start`, `round_end`, `game_end`, `hint_used`, `hint_locked`, `letter_revealed`, `letter_locked`, `premium_offer_shown`, `premium_checkout_started`, `premium_checkout_failed`, `purchase`, `premium_expired_shown`, `ai_word_failed`, `offline_word_used`, `challenge_created`, `challenge_opened`, `sound_toggled`, `pwa_prompt_shown`, `pwa_installed`.

Game state lives in one persisted Zustand store (`src/store/game.ts`, saved to localStorage); this browser's premium
lives in another (`src/store/premium.ts`). The server keeps only payment records, in a SQLite file
(`src/server/db.ts`).

## Development

Requirements: Node.js 24 LTS (see `.nvmrc`) and pnpm 11. The version is pinned in `package.json` `packageManager`, and pnpm switches to it automatically.

```bash
pnpm install
cp .env.example .env.development.local   # set GEMINI_KEY
pnpm dev                                  # http://localhost:7005
```

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server on port 7005 |
| `pnpm build` / `pnpm start` | Production build / serve it locally on port 7005 |
| `pnpm lint` | ESLint (flat config, `eslint-config-next`) |
| `pnpm format` | Prettier over `src/` |
| `pnpm envtob64` | Prints `.env.production.local` as base64 for the `ENV_FILE_BASE64` GitHub secret |

The service worker is registered in production builds only.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_KEY` | yes | Google Gemini API key. Used server-side only by `POST /getWord`. |
| `PAYMENT_GATEWAY` | for premium | `ameria` in production; `mock` (the default) is a fake bank for development, refused in production. |
| `AMERIA_CLIENT_ID`, `AMERIA_USERNAME`, `AMERIA_PASSWORD` | for premium | Ameriabank vPOS credentials. |
| `AMERIA_TEST_MODE`, `AMERIA_ORDER_ID_OFFSET`, `AMERIA_AMOUNT_OVERRIDE` | no | Test terminal, OrderID offset, test amount ([docs/PAYMENTS.md](docs/PAYMENTS.md)). |
| `DATA_DIR` | no | Payments database directory. Default `./.data`; production: set by the deploy to `APP_DIR/shared/data`. |
| `MAIL_API_URL`, `MAIL_API_KEY` | production | Mail engine for the contact form and payment alerts. Empty in development: they print to the console. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | no | GA4 Measurement ID (`G-…`). Build time. Empty: analytics off. |
| `NEXT_PUBLIC_SENTRY_DSN` | no | Sentry DSN. Build time. Empty: error tracking off. |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | no | Source map upload to Sentry. Build time, CI only. |

`GEMINI_KEY`, the payment and the mail variables are read at runtime. Without a key, single player still works with the built-in words. The other variables
are optional and read by `pnpm build` (`NEXT_PUBLIC_*` values are inlined into the bundle); in production the
build job reads them from the `ENV_FILE_BASE64` secret, and they're kept out of the server `.env`.

A free-tier key is enough. `/getWord` tries `gemini-3.5-flash-lite`, then `gemini-3.6-flash`, then `gemini-3.8-flash`. Free quotas are per model, so the fallback also adds capacity. After a quota (429) or overload (503) error, that model is skipped for the wait time Google returns.

## Analytics and error tracking

Both are off unless their build-time variable is set.

- **Google Analytics 4** (`NEXT_PUBLIC_GA_MEASUREMENT_ID`): `gtag.js` is loaded in `<head>` (`src/app/layout.tsx`).
  - Every screen change sends a `page_view` (`src/components/pageViewTracker`), because the game screens change the
    URL without a page load.
  - `trackEvent` (`src/helpers/utils/analytics.ts`) sends the game events.
  - Setup and the event list: [docs/GOOGLE_ANALYTICS.md](docs/GOOGLE_ANALYTICS.md).
- **Sentry** (`NEXT_PUBLIC_SENTRY_DSN`), via `@sentry/nextjs`:
  - Browser errors, with a replay of the session when an error happens (`src/instrumentation-client.ts`).
  - Server errors (`src/instrumentation.ts`), plus failed Gemini calls in `/getWord`.
  - Crashes caught by `src/app/global-error.tsx`.
  - Reports go through the app's own `/monitoring` route, so ad blockers don't drop them.
  - Setup: [docs/SENTRY.md](docs/SENTRY.md).

## Deployment

Self-hosted at https://hangman.eapps.site, on the same server and pipeline pattern as bookie:

1. Every push to `master` runs `.github/workflows/deploy.yml`. It lints, builds the standalone bundle and boots it as
   a smoke test.
2. It ships the bundle over SSH to `APP_DIR/releases/<sha>` and points `APP_DIR/current` at it.
3. It restarts the systemd unit `hangman` (`127.0.0.1:9005`) and health-checks it, rolling back if the new release
   doesn't come up.

nginx serves `/_next/static` from disk and proxies everything else; certbot provides TLS. Pull requests run
`.github/workflows/ci.yml` (lint + build).

The one-time server setup, DNS, certificate, GitHub secrets, operations and rollback are in
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). The server templates (systemd unit, nginx site) are in
[deployment/](deployment).
