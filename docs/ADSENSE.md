# AdSense Auto ads: manual setup

The code side is done. Ads are served by **Auto ads**: Google places them itself, so the code has no ad units or
slot IDs. Everything stays switched off until `ADSENSE_CLIENT` is filled in (step 2).

Once it's set, the app:
- loads the AdSense script and the `google-adsense-account` meta tag in `<head>` (`src/app/layout.tsx`);
- reserves a band at the top for the anchor ad (`--ad-band-height` in `src/styles/variables.css`), so the anchor
  never covers the game or the on-screen keyboard;
- ignores the `#google_vignette` URL hash in the game router, so a vignette isn't taken for a back gesture.

How the layout stays safe:

| Format | Phone | Desktop | Why it's safe |
|---|---|---|---|
| Anchor, **top only** | yes | yes | It sits in the reserved band; the keyboard is at the bottom. |
| Side rails | no | wide screens | They are fixed overlays in the free space beside the 600px column. |
| Vignettes | yes | yes | They are full-screen overlays between page loads; the layout isn't touched. |
| In-page | **off** | **off** | They would be injected into the fixed-height game board and break it. |

AdSense menu names change from time to time. If a label below doesn't match exactly, look for the closest one.

---

## 1. Account and site

1. Sign in at https://adsense.google.com (or create the account).
2. Copy your **publisher ID**: Account → Settings → Account information. It looks like `ca-pub-1234567890123456`.
3. Go to **Sites → Add site** and enter **`mnavasardian.com`**.
   - Add the root domain, not `hangman.mnavasardian.com`. AdSense works per root domain, and adding it covers the
     subdomain.

## 2. Turn the code on

1. In `src/helpers/constants/ads.ts`, set:
   ```ts
   export const ADSENSE_CLIENT = 'ca-pub-1234567890123456' // your ID
   ```
2. Commit and push to `master`. The deploy workflow ships it.

## 3. Check the deploy

Open https://hangman.mnavasardian.com and use View source (`Ctrl+U`). In `<head>`, confirm:
- `<meta name="google-adsense-account" content="ca-pub-…">`
- `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-…">`

## 4. ads.txt (on the root domain)

AdSense reads `ads.txt` from the root domain, so the file belongs to the portfolio site, not this app.

1. In the portfolio repo, add this line to `public/ads.txt` with your number (the ID without `ca-`):
   ```
   google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
   ```
2. Deploy the portfolio and confirm https://mnavasardian.com/ads.txt shows the line.

AdSense may report ads.txt as "Not found" for up to a few days after you add it. That's normal.

## 5. Verify the site and request review

1. Go to **Sites → mnavasardian.com**.
2. For verification, choose **AdSense code snippet**. The snippet is already in `<head>` (step 3), so just confirm it.
3. Click **Request review**. Before you do, make sure `/rules`, `/about` and `/privacy` are live: reviewers look for
   real content and a privacy policy.
4. Wait. The review usually takes a few days and can take up to a few weeks. The status stays "Getting ready"
   until it's approved.

## 6. Privacy & messaging (consent)

Visitors from the EEA, UK and Switzerland must see a consent message from a Google-certified CMP. Without one, they
get few or no ads.

1. Go to **Privacy & messaging → European regulations → Create message**.
2. Select the site `mnavasardian.com`. Set the language to English (Armenian isn't offered), and link the privacy
   policy at `https://hangman.mnavasardian.com/privacy`.
3. **Publish** the message.
4. Optional: also publish the **US state regulations** message.

The privacy page already describes AdSense cookies and the consent message, so no change is needed there.

## 7. Auto ads settings

Go to **Ads → By site**, then click the edit (pencil) icon next to `mnavasardian.com`.

1. Turn **Auto ads** on.
2. **In-page formats: off.** They are inserted inside the page content, which would push the fixed-height game
   board and keyboard around. (For text pages, see step 8.)
3. **Overlay formats:**
   - **Anchor ads: on.**
     - Position: **top only**. Never bottom or automatic: a bottom anchor covers the keyboard and the bottom
       buttons.
     - **Allow anchor ads on wide screens: on.** The band is reserved on desktop as well.
   - **Side rail ads: on** (desktop only; they appear when the screen has enough free space).
   - **Vignette ads: on.**
     - **Allow additional triggers for vignette ads: off.** Those triggers show vignettes on back navigation or
       when the user returns, which clashes with the game's own back-gesture handling (back closes a dialog,
       then leaves the round).
4. **Ad load:** start at the middle or lower. You can raise it after watching how it feels.
5. Use the **preview** at the top of the settings panel to check both phone and desktop.
6. Click **Apply to site**. Changes can take about an hour to show up.

## 8. Optional: in-page ads on the text pages only

`/rules`, `/about` and `/privacy` are plain text pages, so in-page ads are safe there.

1. Go to **Ads → By site → URL groups → New URL group**.
2. Add these URLs:
   - `hangman.mnavasardian.com/rules`
   - `hangman.mnavasardian.com/about`
   - `hangman.mnavasardian.com/privacy`
3. Use the same settings as step 7, but turn **In-page formats on**.
4. Save and apply.

Keep the game screens (`/`, `/settings`, `/discovery`, …) on the site settings, with in-page ads off.

## 9. Check on real devices (after approval)

Ads don't serve on `localhost` or to an ad blocker. Use the live site in a normal browser window with no blocker.

- **Phone, portrait:**
  - the anchor sits in the top title band;
  - the top-right buttons, the board and the whole keyboard stay visible and usable.
- **Phone, landscape:** the same checks. The two-pane layout must not be covered.
- **Desktop, 1280px wide and up:**
  - the anchor is in the top band;
  - any side rails appear in the empty sides, not over the 600px game column.
- **Vignette:**
  - from the start screen, open Rules / About / Privacy; a vignette may show (not every time);
  - close it, then use browser back;
  - in the game, open a dialog and press back: the dialog closes as usual.
- **Double gap:** if the page shows a gap below the anchor that's twice the band's height, AdSense pushed the page
  down by itself. Report it so the reserved band can be adjusted.

## 10. Troubleshooting

| Symptom | Likely cause |
|---|---|
| Blank band, no ads | Not approved yet, an ad blocker, `localhost`, or no fill for that visitor. The band staying empty is expected. |
| Site status "Getting ready" | The review is still running (step 5). |
| ads.txt warning | The root file is missing or wrong (step 4), or AdSense hasn't re-crawled it yet. |
| No ads for EU visitors | The consent message isn't published (step 6). |
| Ads inside the game board | In-page formats got turned on for the game pages (step 7.2). |
| Anchor at the bottom covering the keyboard | The anchor position isn't set to top only (step 7.3). |
