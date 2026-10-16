# Sentry: manual setup

The code side is done, using `@sentry/nextjs`. Everything stays off until `NEXT_PUBLIC_SENTRY_DSN` is set at build
time.

What is captured once it's set:

| Where | What | File |
|---|---|---|
| Browser | Uncaught errors and promise rejections, page-load and navigation traces | `src/instrumentation-client.ts` |
| Browser | A **replay** of the session when an error happens (text and inputs masked; no replays without errors) | `src/instrumentation-client.ts` |
| Browser | Crashes that take the whole app down; the player sees a reload screen | `src/app/global-error.tsx` |
| Server | Errors in page rendering and route handlers | `src/instrumentation.ts` (`onRequestError`) |
| Server | Failed Gemini calls in `/getWord` (handled, so reported by hand, with each model's failure attached) | `src/app/getWord/route.ts` |

Settings live in `src/helpers/constants/sentry.ts`:
- traces are sampled at 20% in production and 100% in dev;
- `environment` is `production` or `development`.

Reports are sent to the app's own `/monitoring` route, which forwards them to Sentry. That way ad blockers don't
drop them.

---

## 1. Create the project

1. Sign in at https://sentry.io. The free **Developer** plan is enough.
2. **Projects → Create Project**:
   - Platform: **Next.js**.
   - Alert frequency: "Alert me on every new issue".
   - Name: `hangman`.
3. Skip the wizard's setup instructions; the code is already in place.
4. Copy the **DSN**: Project Settings → Client Keys (DSN). It looks like
   `https://<key>@o123456.ingest.sentry.io/7890123`.
   - The app accepts only DSNs on `*.sentry.io`. It ignores anything else, with a warning in the dev console.

## 2. Create the source-map token

Without source maps, stack traces point into minified bundles. The upload is optional but strongly recommended.

1. Go to **Settings → Developer Settings → Organization Tokens → Create New Token**.
2. Name it `hangman-ci`. The default scopes include `org:ci`, which covers releases and source maps.
3. Copy the token. It's shown only once.
4. Note your **organization slug** (from the URL `sentry.io/organizations/<slug>/`) and the **project slug**
   (`hangman`).

## 3. Add the GitHub secrets

GitHub → repository → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | the DSN from step 1 |
| `SENTRY_ORG` | organization slug |
| `SENTRY_PROJECT` | `hangman` |
| `SENTRY_AUTH_TOKEN` | the token from step 2 |

Then push to `master`, or re-run **Deploy to Production**.
- The DSN is baked in at build time, so any change needs a new build.
- The build uploads source maps, tags them with the commit as the release, and deletes the map files, so they're
  never served publicly.

For local testing, put `NEXT_PUBLIC_SENTRY_DSN` in `.env.local`. Leave the token out locally, so dev builds don't
upload anything. Events from `pnpm dev` carry the `development` environment, which you can filter out in Sentry.

## 4. Verify

1. Open https://hangman.mnavasardian.com with DevTools.
2. In the console, run:
   ```js
   setTimeout(() => { throw new Error('Sentry test from console') })
   ```
3. In **Network**, a `POST /monitoring?…` request should appear (status 200).
4. Within a minute, the issue appears in Sentry → **Issues**.
5. Open it and check:
   - the stack trace shows readable file names, which means source maps work;
   - there's a **Replay** tab.
6. Resolve the test issue.

## 5. Alerts

New projects email you on every new issue by default. To tune that, go to **Alerts → Create Alert → Issues**. For
example:
- email when an issue is seen more than 10 times in an hour;
- or for anything in `environment:production` only.

Gemini quota errors (`All Gemini models failed (… 429 …)`) can come in bursts when the free quota runs out.
- If they're noisy, open that issue and use **Archive → Until it escalates**.
- Or turn on rate limiting under Project Settings → Client Keys → **Rate Limiting**.

## 6. Quota

The free plan has a monthly allowance of errors, spans (traces) and replays.
- **Spans:** if they run out, lower `SENTRY_TRACES_SAMPLE_RATE` in `src/helpers/constants/sentry.ts` (e.g. to
  `0.05`).
- **Replays:** to save replay quota, lower `replaysOnErrorSampleRate` in `src/instrumentation-client.ts`.
- **Errors:** an inbound filter (Project Settings → Inbound Filters) can drop errors from old browsers and
  extensions.

## Troubleshooting

| Symptom | Check |
|---|---|
| No `/monitoring` request when an error is thrown | Is the secret set, and was the build run after it was set? The DSN must be a `*.sentry.io` URL. |
| `/monitoring` returns 4xx | The DSN key is wrong or was revoked: compare it with Project Settings → Client Keys. |
| Minified stack traces | Check `SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN`; the deploy log's Build step shows the upload. |
| Errors from extensions or bots | Use Project Settings → Inbound Filters. |
