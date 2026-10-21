# Codex Auth Helper

Turn your logged-in ChatGPT browser session into an `auth.json` that Codex can use.

The server side is a **single-file Cloudflare Worker** (zero dependencies, no database). The client side is a **bookmarklet**: click it on a ChatGPT page and the config is generated locally.

- Live site: <https://codex-auth.epidemicsituation.workers.dev>
- Main code: [`codex-auth-helper-v2/`](codex-auth-helper-v2/)
- License: The Unlicense (public domain)

---

## How it works

```
Browser (logged into ChatGPT)
   │  click bookmarklet → read chatgpt.com/api/auth/session
   ▼
Bookmarklet runtime (runs in the page, builds auth.json locally)
   │  copy / download
   ▼
~/.codex/auth.json
```

| Component | Runs on | Role |
|---|---|---|
| Worker (`worker.js`) | Cloudflare edge | Renders the page, issues a time-limited bookmarklet, optionally checks a daily code |
| Bookmarklet runtime | Inside your ChatGPT page | Reads your own session and assembles the `auth.json` Codex expects |
| Local dev server (`server.js`) | Your machine | Local mirror of the Worker: `node server.js` |
| Chrome extension (`popup/`, `background.js`) | Browser | Optional UI for the same session conversion |

**Credentials never leave your browser.** The Worker only serves the bookmarklet source; it does not receive or store ChatGPT credentials (`/api/generate-auth` always returns `410 Gone`).

---

## Use it without deploying

1. Open <https://codex-auth.epidemicsituation.workers.dev>
2. Drag the bookmarklet button onto your bookmarks bar (or copy the code and create it manually)
3. Open and sign in to `https://chatgpt.com`
4. Click the bookmarklet → copy or download `auth.json` from the panel → drop it into your Codex config directory

The bookmarklet is valid for **30 minutes** and expires after one successful use (`BOOKMARKLET_TTL_MS` in `worker.js`). Refresh the site to get a fresh one.

---

## Deploy your own

```bash
cd codex-auth-helper-v2
npm test                                   # sanity check

cp wrangler.toml.example wrangler.toml     # put your KV namespace id here
cp .env.example .env                       # put your CODEX_DAILY_SECRET / CODEX_ADMIN_CODE here

wrangler login
wrangler kv namespace create CODEX_AUTH_STORE --binding CODEX_AUTH_STORE
wrangler secret put CODEX_DAILY_SECRET
wrangler secret put CODEX_ADMIN_CODE
wrangler deploy
```

On Windows you can also right-click → "Run with PowerShell" on [`codex-auth-helper-v2/deploy_to_cloudflare.ps1`](codex-auth-helper-v2/deploy_to_cloudflare.ps1); it walks you through login and secret sync.

Requires Node 18+ and a Cloudflare account.

---

## Two access modes

| Mode | Flag | Behavior |
|---|---|---|
| Open (current live site) | `OPEN_ACCESS = "true"` | Anyone can grab the bookmarklet, no verification |
| Daily code | `OPEN_ACCESS = "false"` | Page asks for today's code, derived via HMAC-SHA256 from `CODEX_DAILY_SECRET`; generate it locally with `node tools/generate-daily-code.js` |

Code derivation:

```
HMAC_SHA256(CODEX_DAILY_SECRET, "codex-auth-helper:v2:<PREFIX>:<YYYYMMDD>")
```

Yesterday / today / tomorrow are all accepted by default, so timezone boundaries don't lock anyone out.

---

## Repository layout

| Path | Description |
|---|---|
| [`codex-auth-helper-v2/`](codex-auth-helper-v2/) | **Main line**: Worker, bookmarklet runtime, local server, tests, deploy script |
| [`codex-auth-helper-v2/worker.js`](codex-auth-helper-v2/worker.js) | Entire server-side logic (page + API + bookmarklet source) |
| [`codex-auth-helper-v2/server.js`](codex-auth-helper-v2/server.js) | Local mirror with identical behavior |
| [`cloudflare-worker/`](cloudflare-worker/) | Early-generation Worker (TypeScript, stateless conversion) |
| [`codex-auth-helper.ps1`](codex-auth-helper.ps1), [`双击运行.bat`](双击运行.bat) | Early-generation Windows one-click script |
| [`codex_session_extractor.js`](codex_session_extractor.js) | Early-generation manual session extractor for the browser console |

The early-generation files are kept for reference and are no longer maintained. For a new deployment, use `codex-auth-helper-v2/`.

---

## Privacy boundaries

- The bookmarklet only calls `chatgpt.com/api/auth/session` (same-origin, your own session). No third-party endpoints, no telemetry, no remote code loading.
- The Worker's KV stores only display config such as group name and group link — never tokens, cookies, or user identifiers.
- The server does not process credentials: `/api/generate-auth` returns `410 Gone`.
- The extension requests only `chatgpt.com` plus `downloads` and `clipboardWrite` — no `<all_urls>`, no `cookies`.
- `CODEX_ADMIN_CODE` (admin panel passcode) defaults to empty: without configuring it the panel cannot open, and there is no built-in passcode.
- The generated `auth.json` is equivalent to your login credentials — **do not share it**.

---

## Development

```bash
cd codex-auth-helper-v2
npm test          # unit tests
npm run dev       # local preview at http://localhost:3000
npm run check     # syntax check + tests
```

---

## License

[The Unlicense](LICENSE): public domain, use it however you like, no attribution required.
