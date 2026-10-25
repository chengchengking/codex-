# Codex Auth Helper

Generate the `auth.json` that Codex needs — straight from your logged-in ChatGPT browser session.

No server, no account, no backend. Everything happens inside your own browser: read one same-origin session endpoint, then assemble the format Codex expects.

---

## How it works

Codex reads `~/.codex/auth.json` on startup and expects a set of OpenAI-style tokens.
Your logged-in ChatGPT tab already holds them: `chatgpt.com/api/auth/session` returns an `accessToken`, which is a JWT whose payload carries the account info.

So it's three steps:

```
1. read /api/auth/session on chatgpt.com        -> accessToken (JWT)
2. decode the JWT payload                       -> chatgpt_account_id / plan / user
3. assemble the JSON Codex expects              -> auth.json
```

The key detail: Codex only parses `id_token` structurally, so putting the `access_token` in there as-is works. No extra token exchange needed.

Output:

```json
{
  "auth_mode": "chatgpt",
  "OPENAI_API_KEY": null,
  "tokens": {
    "id_token": "<accessToken>",
    "access_token": "<accessToken>",
    "refresh_token": "",
    "account_id": "<chatgpt_account_id>"
  },
  "last_refresh": "2026-10-21T12:00:00.000Z"
}
```

| Field | Source |
|---|---|
| `id_token` / `access_token` | `accessToken` from the session endpoint |
| `account_id` | `https://api.openai.com/auth.chatgpt_account_id` in the JWT payload |
| `last_refresh` | Generation time, ISO 8601 |
| `auth_mode` | Always `chatgpt` |

---

## Three ways to run it

All three run inside the browser and are **platform-agnostic — Windows, macOS and Linux all work**. Chrome, Edge and Brave are fine; on macOS the extension loads the same way via `chrome://extensions`. Output always goes to `~/.codex/auth.json` (`%USERPROFILE%\.codex\auth.json` on Windows).

### 1. Bookmarklet (simplest)

1. Open [`bookmarklet.html`](bookmarklet.html) from this repo (a local file, no network needed)
2. **Drag the button onto your bookmarks bar** (or copy the code from the textarea and create a bookmark manually)
3. Open and sign in to `https://chatgpt.com`
4. Click the bookmark → a panel appears bottom-right → copy or download `auth.json`
5. Drop it into your Codex config directory (`~/.codex/auth.json`)

Source is [`bookmarklet.js`](bookmarklet.js), ~190 lines. Regenerate the page after editing:

```bash
npm run build      # node tools/build-bookmarklet.js
```

### 2. Chrome extension

```bash
chrome://extensions  ->  enable "Developer mode"  ->  "Load unpacked"  ->  select the extension/ folder
```

Click the icon on a ChatGPT page to fetch the session, build the config, and copy or download it. Permissions: `chatgpt.com` plus `downloads` and `clipboardWrite`. No `<all_urls>`, no `cookies`.

### 3. Console snippet

Nothing to install: sign in to ChatGPT, press F12, paste [`codex_session_extractor.js`](codex_session_extractor.js) into the console and hit Enter. The config lands in your clipboard.

---

## Limits you'll hit

| Symptom | Cause |
|---|---|
| "not logged in" / `UNAUTHORIZED` | The page isn't signed in, or the session expired |
| Codex asks to log in again after a few days | `access_token` is usually valid ~10 days; just rerun |
| Only works on `chatgpt.com` | The script makes a same-origin request; cross-origin can't read the session |
| Doesn't work after switching accounts | Generate a fresh `auth.json` |

---

## Troubleshooting

### `Failed to refresh token: 400 Bad Request: Invalid 'refresh token'`

```
Failed to refresh token: 400 Bad Request: Invalid 'refresh token': Expected a string
with minimum length 1, but got an empty string instead.
```

**Why**: the browser can only read `access_token`, never `refresh_token`, so the generated `auth.json` carries an empty `refresh_token` (see the field table above). Once `access_token` expires, Codex tries to refresh with that empty string and gets the 400.

Two ways out:

1. **Regenerate `auth.json`** — `access_token` is usually good for ~10 days and won't trigger a refresh inside that window. If you already have a stale `~/.codex/config.toml`, delete it first (see the video walkthrough).
2. **Use an account that comes with an RT** — only credentials obtained through the official OAuth flow carry a real `refresh_token`. A commonly shared community workaround is to complete one phone verification with the *GhostPhone - Generate Phone Numbers and Receive Verification Codes* Chrome extension and then go through the official login. **If you buy an account, make sure it includes an RT**; access-token-only accounts will hit this same error within days.

> Option 2 relies on third-party SMS-verification services. Community practice, use your own judgement.

### Still stuck

"it crashes" alone can't be diagnosed. Gather the details below and post them in the group:

```
1. Account creation date: YYYY.MM.DD
2. Has the mobile app ever been logged in: yes/no
3. Is the IP static: yes/no (location) (Taiwan residential broadband doesn't count as low-risk)
4. Result from ping0.cc purity check: xxx
5. Number of SMS verifications (new number / existing number)
```

---

## Community

- QQ group: **1097037568**
- Video walkthrough (Bilibili): [免费 Codex 重复验证免手机号验证教程](https://b23.tv/1f4CTpN)
- Hosted version: <https://codex-auth.epidemicsituation.workers.dev>

---

## Privacy

- Only same-origin `chatgpt.com/api/auth/session` is called. No third-party endpoints, no telemetry, no remote code loading.
- Credentials stay in your browser: read → assembled → copied/downloaded. Nothing is sent to any server.
- The generated `auth.json` is equivalent to your login credentials — **don't share it**.

---

## Layout

| File | Purpose |
|---|---|
| `bookmarklet.js` | Bookmarklet runtime source (the core logic) |
| `bookmarklet.html` | Drag-and-drop page generated from it; rebuild with `npm run build` |
| `tools/build-bookmarklet.js` | Packs `bookmarklet.js` into a `javascript:` URL and writes the page |
| `extension/` | Chrome extension (Manifest V3) |
| `codex_session_extractor.js` | Console version, paste into DevTools |
| `codex_auth_helper.py` | Legacy Python tool (Windows / macOS, optional). Reads the session, writes `auth.json`, verifies via the Codex CLI. macOS support contributed by [@QingsiLiu](https://github.com/QingsiLiu) ([#1](https://github.com/chengchengking/codex-/pull/1)) |

---

## License

[The Unlicense](LICENSE): public domain.
