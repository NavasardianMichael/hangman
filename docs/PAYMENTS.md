# Payments

One product, **premium**: **1000 ֏** for **30 days** of unlimited hints and letter reveals in single player. It is a
one-time payment, not a subscription. Nothing renews and nothing is charged again. When the month is over, the
player is told once that premium has ended and that another month means paying again, from scratch. A payment never
extends an earlier month, and a checkout is refused while premium is active.

The price, the length and the free allowances are in `src/helpers/constants/premium.ts`. The app and the server share
that file, so the price shown is the price charged.

| | Free | Premium |
|---|---|---|
| Hints (lamp button) | 1 a day | unlimited |
| Reveal a letter (button beside it) | 3 a day | unlimited |

The day is the device's local calendar day (`freeUse` in the game store). Revealing a letter picks a random hidden
letter and opens every cell it appears in. Opening the last hidden letter wins the round, as guessing it would. The
reveal button shows a badge with the free letters left today.

The payment flow follows cv-builder's (its `docs/PAYMENTS.md`), with the same Ameriabank wire code and the same
verification rules. It is adapted to an app with no accounts and no separate API.

## No accounts: the buyer key

The first checkout creates a random **buyer key** (32 bytes) in the browser's localStorage (`store/premium.ts`, key
`hangman-premium`). The server stores only its SHA-256. The key *is* the purchase:

- Premium belongs to the browser or installed app that paid. It isn't on other devices, and clearing the site's data
  loses it. The purchase dialog, the terms and the privacy policy say so.
- If the bank sends the player back to a different browser (an installed iOS app can open the bank in Safari), that
  browser has no key. The result dialog says to open the game where the payment started. Back there, the app reads
  its status again whenever it returns to the front while a checkout is unanswered, so premium turns on by itself.

Premium is enforced in the app, since the word is in the browser anyway. The server is the source of truth for
`until`, and the app re-reads it every time it opens.

## Flow

1. A free limit is reached (or **Պրեմիում** on the start screen) → `PremiumDialog` → **Վճարել 1000 ֏** →
   `POST /api/premium/checkout { key }`.
2. `startCheckout` (`src/server/payments/premium.ts`) first reads the buyer's status: a payment that just went
   through gets `409` instead of a second charge. It then writes a `pending` row, calls the gateway's `init` and
   returns the bank page's URL.
3. The player pays at the bank. The bank redirects to `GET /api/premium/return/<gateway>`.
4. That route calls `settlePayment`, which asks the gateway **server to server** and moves the row
   `pending → succeeded|failed` by compare-and-set. Success sets `premium_until = now + 30 days`. The route then
   redirects to `/?payment=succeeded|failed|pending`.
5. The app reads the parameter at start-up (`takePaymentResultFromUrl`) and puts the player back in their unfinished
   game. The result dialog reads `POST /api/premium/status` rather than trusting the redirect. It polls a few times
   while the bank hasn't confirmed.

**Reconcile on read:** a buyer who paid and closed the tab before step 3 is covered by `POST /api/premium/status`.
It settles that buyer's pending payments from the last 3 days.

**Refunds:** refunds are made in the bank's merchant panel. While a month is active, the status read asks the bank
again at most every 6 hours. A payment the bank shows as refunded or voided becomes `refunded`, and its premium ends.
A bank that cannot answer counts as still paid.

## Storage

A single SQLite file, `DATA_DIR/hangman.db`, through Node's built-in `node:sqlite` (Node 24; no new dependency or
service). The schema is created on first use (`src/server/db.ts`). There is one table, `payments`. Its rows are the
accounting record: they are never deleted. `order_number` is `AUTOINCREMENT`, so a number is never reused.

- Development: `./.data/` (git-ignored).
- Production: `APP_DIR/shared/data`. The deploy writes `DATA_DIR` into `shared/.env`. Without `DATA_DIR` in
  production, payments stay off rather than write into a release directory, which a later deploy would delete.

Backup: copy the file with the app running (WAL mode), e.g. `sqlite3 hangman.db ".backup /path/backup.db"`. To find a
payment:

```bash
sqlite3 /home/michael/apps/hangman/shared/data/hangman.db \
  "SELECT order_number, status, amount, datetime(paid_at/1000,'unixepoch'), datetime(premium_until/1000,'unixepoch')
   FROM payments ORDER BY order_number DESC LIMIT 20;"
```

The bank's OrderID is `AMERIA_ORDER_ID_OFFSET + order_number`.

## Admin mails

These go through the mail engine's internal endpoint (`src/server/payments/notifications.ts`), as in cv-builder:

- **Checkout started:** once the bank answered `init`, or failed to. At most 30 an hour.
- **Payment succeeded:** sent once per payment, by whichever settler won the claim (the bank redirect, or a status
  read).

Both carry the order #, the amount, the gateway's payment id, the IP and the user agent. They are best effort and
never block the player. Without `MAIL_API_*`, they print to the server log in development.

## Gateways (`src/server/payments/gateways/`)

### `mock` (development)

A page served by the app (`/api/premium/mock/<id>`) with Pay and Decline buttons. Its state is in memory. It is
refused in production (`isPaymentConfigured`).

### `ameria`: Ameriabank vPOS 3.1

`ameria-wire.ts` is a copy of cv-builder's `server/src/services/gateways/ameria-wire.ts`, which cv-builder's unit
tests pin and which has been tested against the bank there. Keep the two files equal. `ameria.ts` is the client and
the only reader of the credentials.

What is verified on return: `ResponseCode "00"`, `OrderStatus 2` / `payment_deposited`, the OrderID equals ours, and
the charged amount is at least ours. A two-stage terminal (`OrderStatus 1`) is confirmed with `ConfirmPayment` and
read again.

Going live:

1. Ameriabank needs this site on the vPOS agreement. A terminal is approved per site, so ask
   vpos.support@ameriabank.am whether hangman.eapps.site needs its own terminal or can share cv-builder's. If it
   shares, set `AMERIA_ORDER_ID_OFFSET` so hangman's OrderIDs never collide with cv-builder's. The bank requires the
   Terms, Privacy and Refund pages: `/terms`, `/privacy`, `/refund-policy`, linked from the start screen and the
   purchase dialog. **Their text is a draft; have it reviewed.** The contact page is `/contact`.
2. Test mode: `PAYMENT_GATEWAY=ameria`, `AMERIA_TEST_MODE=true`, `AMERIA_AMOUNT_OVERRIDE=10` (the test terminal
   accepts only 10 AMD), and `AMERIA_ORDER_ID_OFFSET` set to the start of the range the bank assigned.
3. Production: `AMERIA_TEST_MODE=false`, remove `AMERIA_AMOUNT_OVERRIDE`, and choose an offset past the test
   OrderIDs.

All of these go in `.env.production.local` → `pnpm -s envtob64` → the `ENV_FILE_BASE64` secret
([DEPLOYMENT.md](DEPLOYMENT.md)).

## Endpoints

| Route | |
|---|---|
| `POST /api/premium/checkout { key }` | `{ url }` of the bank page · `409 { until }` if already active · `503` if not configured · `502` if the bank refused · 10/hour per IP |
| `POST /api/premium/status { key }` | `{ until, pending }` · settles pending payments · 60/min per IP |
| `GET /api/premium/return/<gateway>` | the bank's BackURL → `303 /?payment=…` |
| `GET /api/premium/mock/<id>[/approve\|decline]` | the mock bank (development only) |
| `POST /api/contact { fullName, email, message, website }` | the contact form → the admin inbox · `website` is a honeypot · 5/hour per IP |

The service worker never answers `/api/*` from its cache.
