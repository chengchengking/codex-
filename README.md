# Codex Auth Helper

从浏览器里**已登录的 ChatGPT 会话**，生成 Codex 可以直接用的 `auth.json`。

没有服务端，没有账号，没有后台。全部动作都发生在你自己的浏览器里：读一次同源的会话接口，把结果拼成 Codex 认识的格式。

---

## 原理

Codex 启动时读 `~/.codex/auth.json`，里面要有一组 OpenAI 风格的 token。
而你已经登录的 ChatGPT 网页，本身就持有这组信息——`chatgpt.com/api/auth/session` 会返回一个 `accessToken`，它是一个 JWT，payload 里带着账号信息。

所以只需要三步：

```
1. 在 chatgpt.com 页面里读 /api/auth/session  →  拿到 accessToken（JWT）
2. 解 JWT 的 payload                          →  取出 chatgpt_account_id / plan / user
3. 按 Codex 的格式拼 JSON                     →  auth.json
```

关键的一点：Codex 校验 `id_token` 时只做 JWT 结构解析，所以把 `access_token` 原样填进 `id_token` 就能通过。这也是为什么不需要额外换取别的凭证。

生成的产物长这样：

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

| 字段 | 来源 |
|---|---|
| `id_token` / `access_token` | 会话接口返回的 `accessToken` |
| `account_id` | JWT payload 里 `https://api.openai.com/auth.chatgpt_account_id` |
| `last_refresh` | 生成时刻，ISO 8601 |
| `auth_mode` | 固定 `chatgpt` |

---

## 三种用法

### 方式一：书签（最省事）

1. 双击打开仓库里的 [`bookmarklet.html`](bookmarklet.html)（本地文件，不用联网）
2. 把页面上的按钮**拖进浏览器书签栏**（拖不动就复制文本框里的代码，手动新建书签粘到"网址"里）
3. 打开并登录 `https://chatgpt.com`
4. 点一下书签 → 右下角出现面板 → 复制或下载 `auth.json`
5. 放进 Codex 的配置目录（`~/.codex/auth.json`）

书签的源码是 [`bookmarklet.js`](bookmarklet.js)，一共一百多行，可以直接读。改完重新生成页面：

```bash
npm run build      # node tools/build-bookmarklet.js
```

### 方式二：Chrome 扩展

```bash
chrome://extensions  →  打开"开发者模式"  →  "加载已解压的扩展程序"  →  选 extension/ 目录
```

在 ChatGPT 页面点扩展图标，取会话、生成配置、复制或下载。权限只有 `chatgpt.com` 加 `downloads`、`clipboardWrite`，没有 `<all_urls>`、没有 `cookies`。

### 方式三：控制台脚本

不想装任何东西的话：登录 ChatGPT 后按 F12 打开控制台，把 [`codex_session_extractor.js`](codex_session_extractor.js) 整段粘进去回车，配置会直接进剪贴板。

---

## 你会遇到什么限制

| 现象 | 原因 |
|---|---|
| 提示未登录 / `UNAUTHORIZED` | 当前页面没登录 ChatGPT，或会话已失效 |
| 过几天 Codex 又要重新登录 | `access_token` 有效期一般是 10 天左右，过期后重跑一次即可 |
| 必须在 `chatgpt.com` 上点 | 脚本只做同源请求，跨域读不到会话 |
| 换账号后不生效 | 重新生成一次 `auth.json` |

---

## 隐私边界

- 只请求同源的 `chatgpt.com/api/auth/session`，没有第三方接口、没有埋点、没有远程代码加载。
- 凭证全程在你自己的浏览器里：读出来 → 拼好 → 复制/下载，不发给任何服务器。
- 生成的 `auth.json` 等价于你的登录凭证，**不要发给别人**。

---

## 目录

| 文件 | 说明 |
|---|---|
| `bookmarklet.js` | 书签运行时源码（核心逻辑都在这） |
| `bookmarklet.html` | 由上面的源码生成的拖拽页面，`npm run build` 可重新生成 |
| `tools/build-bookmarklet.js` | 把 `bookmarklet.js` 打包成 `javascript:` 链接并生成页面 |
| `extension/` | Chrome 扩展（Manifest V3） |
| `codex_session_extractor.js` | 控制台版脚本，粘进 DevTools 即可用 |

---

## 许可

[The Unlicense](LICENSE)：公共领域。
