# Codex Auth Helper

把浏览器里已登录的 ChatGPT 会话，转换成 Codex 可用的 `auth.json`。

服务端是一个 **Cloudflare Worker**（单文件，零依赖，无数据库），客户端是一个 **浏览器书签**：在 ChatGPT 页面点一下，配置就在本地生成。

- 线上站点：<https://codex-auth.epidemicsituation.workers.dev>
- 主线代码：[`codex-auth-helper-v2/`](codex-auth-helper-v2/)
- 许可：The Unlicense（公共领域）

---

## 它是怎么工作的

```
浏览器（已登录 ChatGPT）
   │  点击书签 → 读取 chatgpt.com/api/auth/session
   ▼
书签脚本（在页面内运行，本地生成 auth.json）
   │  复制 / 下载
   ▼
~/.codex/auth.json
```

| 环节 | 跑在哪 | 做什么 |
|---|---|---|
| Worker（`worker.js`） | Cloudflare 边缘 | 渲染页面、签发带过期时间的书签、可选地校验每日验证码 |
| 书签运行时 | 你的 ChatGPT 页面里 | 读取你自己的会话，拼出 Codex 需要的 `auth.json` |
| 本地开发服务器（`server.js`） | 本机 | Worker 的本地镜像，`node server.js` 即可预览 |
| Chrome 扩展（`popup/`、`background.js`） | 浏览器 | 可选的图形界面，做同样的会话转换 |

**关键点：凭证只在你自己的浏览器里流转。** Worker 只签发书签的代码，不接收、不存储 ChatGPT 凭证——服务端 `/api/generate-auth` 直接返回 `410 Gone`。

---

## 直接用（不用部署）

1. 打开 <https://codex-auth.epidemicsituation.workers.dev>
2. 把「拖到书签栏」按钮拖进浏览器书签栏（或点「复制书签代码」手动新建书签）
3. 打开并登录 `https://chatgpt.com`
4. 点一下书签 → 在弹出面板里复制或下载 `auth.json` → 放进 Codex 配置目录

书签 **30 分钟有效**，且成功使用一次后即失效（`worker.js` 里的 `BOOKMARKLET_TTL_MS`）。过期回站点刷新即可重新获取。

---

## 自己部署一份

```bash
cd codex-auth-helper-v2
npm test                                   # 校验逻辑

cp wrangler.toml.example wrangler.toml     # 填入你的 KV namespace id
cp .env.example .env                       # 填入你的 CODEX_DAILY_SECRET / CODEX_ADMIN_CODE

wrangler login
wrangler kv namespace create CODEX_AUTH_STORE --binding CODEX_AUTH_STORE
wrangler secret put CODEX_DAILY_SECRET
wrangler secret put CODEX_ADMIN_CODE
wrangler deploy
```

Windows 也可以直接右键「使用 PowerShell 运行」 [`codex-auth-helper-v2/deploy_to_cloudflare.ps1`](codex-auth-helper-v2/deploy_to_cloudflare.ps1)，它会引导登录并同步密钥。

需要 Node 18+ 和一个 Cloudflare 账号。

---

## 两种访问控制模式

| 模式 | 开关 | 行为 |
|---|---|---|
| 开放模式（当前线上） | `OPEN_ACCESS = "true"` | 打开页面即可拿到书签，不需要任何验证 |
| 每日验证码模式 | `OPEN_ACCESS = "false"` | 页面要求输入当日验证码；验证码由 `CODEX_DAILY_SECRET` 做 HMAC-SHA256 派生，本地 `node tools/generate-daily-code.js` 可生成 |

验证码算法：

```
HMAC_SHA256(CODEX_DAILY_SECRET, "codex-auth-helper:v2:<PREFIX>:<YYYYMMDD>")
```

默认接受昨天 / 今天 / 明天三个日期，避免跨时区午夜卡住。

---

## 仓库结构

| 路径 | 说明 |
|---|---|
| [`codex-auth-helper-v2/`](codex-auth-helper-v2/) | **主线**：Worker、书签运行时、本地服务器、测试、部署脚本 |
| [`codex-auth-helper-v2/worker.js`](codex-auth-helper-v2/worker.js) | 服务端全部逻辑（页面 + 接口 + 书签运行时源码） |
| [`codex-auth-helper-v2/server.js`](codex-auth-helper-v2/server.js) | 本地开发镜像，行为与线上一致 |
| [`cloudflare-worker/`](cloudflare-worker/) | 早期版本的 Worker（TypeScript，无状态会话转换） |
| [`codex-auth-helper.ps1`](codex-auth-helper.ps1)、[`双击运行.bat`](双击运行.bat) | 早期版本的 Windows 一键脚本 |
| [`codex_session_extractor.js`](codex_session_extractor.js) | 早期版本在浏览器控制台手工提取会话的脚本 |

早期版本（`cloudflare-worker/`、`codex-auth-helper.ps1`）保留供参考，不再维护；新部署请直接用 `codex-auth-helper-v2/`。

---

## 隐私与边界

- 书签运行时只请求 `chatgpt.com/api/auth/session`（同源，读的是你自己的登录态），没有第三方地址、没有埋点、没有远程代码加载。
- Worker 的 KV 里只保存群名 / 群链接这类展示配置，不保存 token、Cookie 或任何用户标识。
- 服务端不处理凭证：`/api/generate-auth` 恒返回 `410 Gone`。
- 扩展只申请 `chatgpt.com` 一个主机权限加 `downloads`、`clipboardWrite`，没有 `<all_urls>`、没有 `cookies`。
- `CODEX_ADMIN_CODE`（管理面板口令）默认值为空，不配置就打不开，代码里没有内置口令。
- 生成的 `auth.json` 等价于你的登录凭证，**不要发给别人**。

---

## 开发

```bash
cd codex-auth-helper-v2
npm test          # 单元测试
npm run dev       # 本地预览 http://localhost:3000
npm run check     # 语法检查 + 测试
```

---

## 许可

[The Unlicense](LICENSE)：公共领域，随便用，无需署名。
