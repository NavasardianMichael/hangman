# Deployment

Push to `master` → GitHub Actions lints, builds and boots the standalone bundle → the tarball lands on the
server → `current` symlink flip → `systemctl restart hangman` → health check. A release that doesn't come up is
rolled back to the previous one automatically. Same pattern as bookie.

## Shape

```
hangman.eapps.site ──► nginx :443 ──► 127.0.0.1:9005  hangman  (Next standalone, systemd)
                            └──────► /_next/static/   from disk (APP_DIR/current/.next/static)
```

There is no separate API: `POST /getWord` is a route of the same Next server, and it calls Gemini with `GEMINI_KEY`.

On-host layout:

```
$APP_DIR/                    e.g. /home/michael/apps/hangman
  releases/<sha>/            server.js · .next · public · node_modules (the 3 newest are kept)
  current -> releases/<sha>  the unit's WorkingDirectory; systemd resolves it at start
  shared/.env                GEMINI_KEY, mode 600, written by every deploy
```

The nginx site has the same shape as `portfolio.mnavasardian.com.conf`: port 80 serves the ACME challenge and redirects,
port 443 uses the shared certbot options. Portfolio is a static build served with `root`; this app is a Node server, so
443 proxies to it and serves only `/_next/static/` from disk.

Server templates live in [`deployment/`](../deployment). Nothing deploys them: they are copied to the server by hand,
so a change to one means copying it again.

| File | Goes to |
|---|---|
| `hangman.service` | `/etc/systemd/system/hangman.service` |
| `hangman.eapps.site.conf` | `/etc/nginx/sites-available/`, symlinked into `sites-enabled/` |
| `hangman.mnavasardian.com.conf` | the same; the old domain, redirected (see [Old domain](#old-domain)) |

## One-time setup

### 1. Retire Vercel

The app used to deploy on Vercel. In the Vercel dashboard, open the hangman project:
- **Settings → Domains:** remove `hangman.mnavasardian.com`.
- **Settings → Git:** disconnect the repository, or delete the project. Otherwise every push still triggers a Vercel
  build.

### 2. DNS

In the `eapps.site` zone, add the record for `hangman`:

| Type | Name | Content | Proxy status |
|---|---|---|---|
| `A` | `hangman` | the server's IP (the same one `bookie` points at) | **DNS only** (grey cloud, if the zone is on Cloudflare) |

Keep the old `hangman` record in the `mnavasardian.com` zone: it serves the redirect (see [Old domain](#old-domain)).
Check it before going on:

```bash
nslookup hangman.eapps.site    # must answer with the server's IP
```

DNS only is deliberate. TLS is terminated on the server by Let's Encrypt, and nginx sees the visitor's real IP, which
`/getWord` uses for its per-IP rate limit. Behind the orange cloud every visitor would arrive from a Cloudflare IP and
share one limit (see [Gotchas](#gotchas)).

### 3. Server

On the server, as `michael`. Where a step creates a file, open it with `sudo nano <path>` and paste the matching file
from `deployment/` (save with Ctrl+O, Enter, Ctrl+X).

```bash
# 1. Directory tree
mkdir -p /home/michael/apps/hangman/{releases,shared}

# 2. Node 24 LTS for this app only, from nvm; the server's other apps keep their own Node (25 at /usr/bin/node).
#    systemd ignores nvm's PATH, so the unit runs a fixed path: ~/.local/node-24, a link to nvm's Node 24.
#    The host needs no pnpm: the bundle carries its node_modules.
nvm install 24                     # latest 24.x; leaves other versions and nvm's default alias alone
mkdir -p ~/.local
ln -sfn "$(dirname "$(dirname "$(nvm which 24)")")" ~/.local/node-24
~/.local/node-24/bin/node -v       # v24.x

# 3. Is the port free? (nothing should be listed)
sudo ss -ltnp | grep -E ':9005\b'

# 4. systemd unit: paste deployment/hangman.service. Enable it, but don't start it yet: no release exists
sudo nano /etc/systemd/system/hangman.service
sudo systemctl daemon-reload
sudo systemctl enable hangman

# 5. Let the deploy user restart exactly this unit
echo 'michael ALL=(root) NOPASSWD: /usr/bin/systemctl restart hangman' | sudo tee /etc/sudoers.d/hangman
sudo chmod 440 /etc/sudoers.d/hangman
sudo visudo -c        # also check `command -v systemctl`: on some distros it is /bin/systemctl
# so a failed deploy can print the service log (skip if bookie already did this)
sudo usermod -aG systemd-journal michael

# 6. TLS certificate. certbot's nginx plugin answers the challenge with a temporary server block, so this works
#    before the site exists; the hook reloads nginx after every renewal so it serves the new certificate.
#    options-ssl-nginx.conf and ssl-dhparams.pem, which the site includes, already exist from portfolio's certificate
sudo certbot certonly --nginx -d hangman.eapps.site --deploy-hook "systemctl reload nginx"

# 7. nginx site (needs the certificate from step 6): paste deployment/hangman.eapps.site.conf
sudo nano /etc/nginx/sites-available/hangman.eapps.site.conf
sudo ln -s /etc/nginx/sites-available/hangman.eapps.site.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 8. Renewal works (certbot's timer renews automatically)
sudo certbot renew --dry-run --cert-name hangman.eapps.site

# 9. DNS, certificate and nginx work: "502 Bad Gateway" is the expected answer until the first deploy
curl -I https://hangman.eapps.site
```

If the deploy key isn't on the server yet (bookie's CI uses one already), append its public half to
`/home/michael/.ssh/authorized_keys`.

### 4. GitHub secrets

Repository → Settings → Secrets and variables → Actions → **Secrets**:

| Name | Value |
|---|---|
| `SSH_HOST` | server hostname or IP |
| `SSH_USER` | `michael` |
| `SSH_KEY` | private half of the deploy key (the full PEM, as for bookie) |
| `SSH_PORT` | optional, defaults to 22 |
| `APP_DIR` | `/home/michael/apps/hangman` |
| `ENV_FILE_BASE64` | output of `pnpm -s envtob64` (see below) |

`ENV_FILE_BASE64` is the whole local `.env.production.local` (same keys as `.env.example`), and the workflow splits it:
- **Build job:** takes `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` and
  `SENTRY_AUTH_TOKEN` (see [GOOGLE_ANALYTICS.md](GOOGLE_ANALYTICS.md) and [SENTRY.md](SENTRY.md)). `NEXT_PUBLIC_*`
  values are inlined into the bundle, so they must be there when `pnpm build` runs. The "Load build-time env" step
  logs each one as set or not set. A service stays off when its key is empty.
- **Deploy job:** writes the rest (`GEMINI_KEY`) to the server `.env`. The build-time keys are stripped from it.

Any change to these values needs a new secret and a full run: re-running only the Deploy job reuses the old bundle.

```bash
pnpm -s envtob64 | clip      # Windows: base64 of .env.production.local straight to the clipboard
pnpm -s envtob64 | pbcopy    # macOS
pnpm -s envtob64 other.env   # a different file
```

The script puts only the base64 on stdout. On stderr it lists the key names (never values) and warns about an empty
`GEMINI_KEY`. `-s` keeps pnpm's own header out of the clipboard. Don't put `NODE_ENV`, `PORT` or `HOSTNAME` in the file:
the unit sets them, and the deploy strips them.

### 5. First deploy

Push to `master`, or Actions → **Deploy to Production** → **Run workflow**. The first run creates
`releases/<sha>`, writes `shared/.env`, points `current` at it and starts the unit.

## The workflows

| | |
|---|---|
| `ci.yml` | Pull request into `master`: install, lint, build. |
| `deploy.yml` | Push to `master` (changes only to `*.md`, `docs/` or `deployment/` don't deploy), or a manual run. |

What `deploy.yml` does, in two jobs:

**build** (steps 1–3) leaves the checked bundle as a run artifact. **deploy** (steps 4–7) ships it. When the server side
fails, fix it and use **Re-run failed jobs**: only `deploy` runs again, with the same bundle, for up to 3 days.

1. Installs, lints and builds. Type checking is part of the build. `.next/cache` (Turbopack's build cache) is kept
   between runs with `actions/cache`, so builds after the first start warm.
2. Copies `public/` and `.next/static` into `.next/standalone` and packs it.
3. **Boots the bundle** and requires `GET /` → 200 and `POST /getWord {}` → 400. The 400 proves the word route loads,
   without calling Gemini. A tracing gap would otherwise surface only on the server.
4. Decodes `ENV_FILE_BASE64`: strips CRLF, `export ` and the unit-owned keys, and prints key names only.
5. Copies the tarball and env file over SSH, then extracts `releases/<sha>` and installs `shared/.env` (mode 600).
6. Points `current` at the new release, runs `sudo -n systemctl restart hangman` and polls `127.0.0.1:9005` for
   60s. If it fails, it prints `systemctl status` and the journal, rolls `current` back to the previous release and
   deletes the broken one.
7. Keeps the 3 newest releases, and never deletes the live one.

Deploys queue rather than cancel each other, so `current` never points at a release whose service wasn't restarted.

## Ports

Bound to loopback only; nothing is exposed but 80/443 through nginx.

| Port | What | Declared in |
|---|---|---|
| 9005 | Next (production) | `hangman.service` (`Environment=PORT`), `hangman.eapps.site.conf` (`proxy_pass`), `deploy.yml` (`APP_PORT`) |
| 7005 | Next (`pnpm dev`, local only) | `package.json` |

### Changing the port

Edit every production row above, then copy the unit and the nginx conf to the server again:

```bash
sudo systemctl daemon-reload && sudo nginx -t && sudo systemctl reload nginx
```

Grep for the old number afterwards.

## Operations

```bash
journalctl -u hangman -f                 # logs
systemctl status hangman                 # status

# rollback by hand (the deploy already rolls back a release that doesn't come up)
ls -t /home/michael/apps/hangman/releases                     # pick the previous sha
ln -sfn /home/michael/apps/hangman/releases/<sha> /home/michael/apps/hangman/current
sudo systemctl restart hangman

# new GEMINI_KEY: update the ENV_FILE_BASE64 secret and re-run the workflow
# (or edit shared/.env on the server, then: sudo systemctl restart hangman)

# redeploy without a code change: Actions → "Deploy to Production" → Run workflow

sudo certbot certificates                   # certificate expiry

# Node 24 security update (the link moves first, so it never points at an uninstalled version)
nvm install 24
ln -sfn "$(dirname "$(dirname "$(nvm which 24)")")" ~/.local/node-24
sudo systemctl restart hangman
# the old 24.x can go after that: nvm uninstall <old version>
```

## Old domain

The app used to live at `hangman.mnavasardian.com`. That name still resolves to this server, and
`deployment/hangman.mnavasardian.com.conf` answers every request with a 301 to `https://hangman.eapps.site`, path and
query included, so shared challenge links (`?c=…`) and search results keep working. It reuses the existing
certificate, which certbot keeps renewing.

```bash
# replace the old proxying site with the redirect: paste deployment/hangman.mnavasardian.com.conf
sudo nano /etc/nginx/sites-available/hangman.mnavasardian.com.conf
sudo nginx -t && sudo systemctl reload nginx
curl -I "https://hangman.mnavasardian.com/rules?x=1"   # 301, Location: https://hangman.eapps.site/rules?x=1
```

Browser storage is per origin, so stats, streaks and the passed-word list stay behind on the old domain, and an
installed app keeps its old start URL (it follows the redirect, but reinstalling from the new domain is cleaner).

## HTTPS only

- **Port 80:** it serves only the ACME challenge and page loads (`GET`/`HEAD`). Those get a 301 to `https://`.
  `/getWord`, `/monitoring` and any request with another method get a 403 and are never redirected: a redirect would
  turn the POST into a GET, and the body has already crossed the network unencrypted.
- **HSTS:** port 443 sends `Strict-Transport-Security: max-age=31536000`, so after the first visit the browser never
  uses HTTP again. It has no `includeSubDomains` and no `preload`, because the rest of `eapps.site` isn't managed
  here.
- **Node:** it listens on `127.0.0.1:9005` only, so nothing reaches it except nginx's HTTPS block.

```bash
curl -I http://hangman.eapps.site/rules                 # 301 → https://hangman.eapps.site/rules
curl -i -X POST http://hangman.eapps.site/getWord       # 403
curl -sI https://hangman.eapps.site | grep -i strict    # strict-transport-security: max-age=31536000
```

## Gotchas

- **Cloudflare proxy (orange cloud):** don't turn it on without two changes.
  - Every request would come from a Cloudflare IP, and the in-memory `/getWord` limit (20 requests/min per IP) would
    be shared by everyone behind the same edge. You'd need nginx `real_ip_header CF-Connecting-IP` with
    `set_real_ip_from` for Cloudflare's ranges.
  - SSL/TLS mode must be **Full (strict)**.
- **systemd `EnvironmentFile` is not dotenv:** no `export` (the deploy strips it), no multi-line values, and quotes
  are stripped.
- **One process only:** the `/getWord` rate limit and the Gemini model cooldowns are in-memory and per process. A
  second instance doubles every limit.
- **`/_next/static` is served from disk by nginx (`www-data`):** every directory down to the release needs `o+x`.
  The symptom is 403 for every script and style. Portfolio is served from `/home/michael/apps` the same way, so this
  already holds on the current server.
- **Never add `proxy_cache` to the site:** `/sw.js` must always be fresh, and `/getWord` answers per request.
- **Releases are disposable:** rotation deletes everything under `releases/`, so nothing stateful may live there.
  `shared/` is outside on purpose.
