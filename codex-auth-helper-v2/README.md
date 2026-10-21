# Codex Auth Helper（Cloudflare Worker 版）

一个把已登录的 ChatGPT 网页会话转换成 Codex 可用 `auth.json` 的工具，服务端是单个 Cloudflare Worker，客户端是一个浏览器书签。

核心思路：

- 网页负责签发书签，可选地用“每日群验证码”做一道访问控制。
- 网页签发书签；书签在 `https://chatgpt.com` 页面内本地读取会话，并在浏览器内生成 `auth.json`。
- 书签在 `https://chatgpt.com` 页面内本地读取会话，并在浏览器内生成 `auth.json`。
- 服务器默认不接收、不处理用户的 ChatGPT 登录凭证。
- 每日验证码由本地生成器和 Cloudflare Worker 使用同一个私密种子生成。

## 开放模式（当前线上状态）

当前部署已开启 `OPEN_ACCESS`：网页不再要求每日验证码，任何人打开就能直接拿到书签使用。

- 开启后普通用户无需加入 QQ 群、也无需输入任何暗号。
- `CODEX_DAILY_SECRET` 此时只用于隐藏管理面板里的群暗号设置，不再影响普通用户。
- 想恢复"每日群验证码"流程：把 `wrangler.toml` 里的 `OPEN_ACCESS` 改成 `"false"` 重新部署即可，页面和接口会自动切回验证流程。
- 开放模式下，若 QQ 群链接仍是占位符（`REPLACE_WITH_YOUR_QQ_GROUP_LINK`），页面上那一行会自动隐藏；在隐藏面板里填入真实群链接后，刷新页面即会重新显示。

## 网页里设置群暗号

线上页面默认只显示普通使用流程。需要设置 QQ 群暗号时，连续点击左上角 Codex 图标 5 次，输入开发者暗号后即可设置新的群暗号和有效小时数。

开发者暗号由 Cloudflare Worker Secret `CODEX_ADMIN_CODE` 控制，必须显式配置；源码不再提供默认开发者暗号。输错 3 次会等待 1 分钟，继续输错会逐步延长冷却时间。

## 每天怎么发群验证码（兜底方式）

双击根目录下的：

```text
生成今日验证码.bat
```

首次运行会自动创建本地 `.env`，里面包含 `CODEX_DAILY_SECRET`。这个文件已经被 `.gitignore` 忽略，不要发给别人，也不要提交到仓库。

运行后会输出类似：

```text
今日验证码: CXA-20260625-A1B2C-3D4E5
群公告可直接发送: 今日 Codex Auth Helper 验证码：CXA-20260625-A1B2C-3D4E5
```

如果不使用网页隐藏面板，也可以把“今日验证码”复制到 QQ 群公告。Worker 默认也接受昨天和明天的码，用来避免跨午夜时区边界卡住。

## 🌐 一键自动化部署 (New)

我们为您提供了一个完全自动化的部署脚本 `deploy_to_cloudflare.ps1`，用于一键完成 Cloudflare Worker 的发布和密钥同步。

### 部署步骤：
1. **运行脚本**：在文件夹中找到 `deploy_to_cloudflare.ps1`，右键选择 **“使用 PowerShell 运行”**。
2. **浏览器授权**：脚本会自动拉起您的默认浏览器，弹出 Cloudflare 官方的授权页面。点击 **“Allow”** 允许登录（全程无需透露任何密码给脚本）。
3. **自动发布与密钥同步**：
   - 脚本会自动执行 `wrangler deploy` 发布您的 Worker 服务。
   - 随后，脚本会自动读取本地 `.env` 中的 `CODEX_DAILY_SECRET` 和 `CODEX_ADMIN_CODE`，并同步上传至 Cloudflare 密钥库中，全面完成安全性闭环。

## 云端怎么保持一致（手动模式参考）

Cloudflare Worker 必须配置和本地 `.env` 完全相同的 `CODEX_DAILY_SECRET`，并配置开发者暗号 `CODEX_ADMIN_CODE`。如果缺少 `CODEX_ADMIN_CODE`，普通用户输入每日验证码的流程仍可使用，但网页隐藏管理面板不可用。

推荐设置方式：

```bash
wrangler secret put CODEX_DAILY_SECRET
wrangler secret put CODEX_ADMIN_CODE
```

然后把 `.env` 里的 `CODEX_DAILY_SECRET` 值粘贴进去。

可公开的普通变量可以放在 `wrangler.toml`：

```toml
[vars]
CODEX_CODE_PREFIX = "CXA"
CODEX_CODE_TZ_OFFSET_MINUTES = "480"
QQ_GROUP_LABEL = "QQ群：替换为你的群号"
QQ_GROUP_URL = "https://qm.qq.com/q/替换为你的QQ群链接"
```

## 验证码算法

每日码不是简单固定密码，而是用 HMAC-SHA256 生成：

```text
HMAC_SHA256(CODEX_DAILY_SECRET, "codex-auth-helper:v2:<PREFIX>:<YYYYMMDD>")
```

最终格式：

```text
<PREFIX>-<YYYYMMDD>-<前5位摘要>-<后5位摘要>
```

默认按北京时间（UTC+8）计算日期，前缀默认 `CXA`。

## 本地预览

```bash
node server.js
```

打开：

```text
http://localhost:3000
```

本地预览和 Cloudflare Worker 共用 `worker.js`，所以本地看到的页面就是线上页面。

## 用户使用流程（开放模式）

1. 打开站点 https://codex-auth.epidemicsituation.workers.dev 。
2. 拖动“拖到书签栏”按钮到浏览器书签栏，或点“复制书签代码”手动新建书签。
3. 打开并登录 `https://chatgpt.com`。
4. 点击书签，在页面右下角面板复制或下载 `auth.json`。
5. 将 `auth.json` 放到 Codex 配置目录。

如果切回“每日群验证码”模式（`OPEN_ACCESS = "false"`），第 1 步改为：从 QQ 群公告复制当天验证码，在网页输入后解锁书签。

## 透明说明：这里没有套路

开源就是把话说明白。逐条对照源码：

- **不上传你的凭证。** 书签只在你的浏览器里读取 `https://chatgpt.com/api/auth/session`，`auth.json` 在本地生成并下载。服务端 `/api/generate-auth` 已硬编码禁用（返回 `410 Gone`），服务器从不接收 ChatGPT 凭证。
- **只碰一个域。** 整份代码（Worker 网页、书签运行时、Chrome 扩展）除 `chatgpt.com` 自身的会话接口外，没有任何第三方地址、埋点、统计脚本或远程代码加载；没有 `eval`，`obfuscated_loader.js` 只是一个提示桩，不加载任何代码。
- **没有账号体系、没有后门口令。** 全链路只有一条：网页签发书签 → 书签在浏览器本地生成 `auth.json`。管理面板的 `CODEX_ADMIN_CODE` 默认值为空，不配置就打不开，代码里也不存在任何万能口令。
- **两个容易被误解的设计，先说清楚：**
  1. 书签 **30 分钟有效**，且**成功使用一次后失效**（`worker.js` 的 `BOOKMARKLET_TTL_MS`，防滥用）。过期后回网页刷新就能重新拿到，不加群、不要暗号。
  2. Chrome 扩展只申请 `chatgpt.com` 一个主机权限，加上 `downloads` 和 `clipboardWrite`；没有 `<all_urls>`，没有 `cookies`。
- **不留你的使用痕迹。** KV 里只存群名/群链接和群暗号记录，不存任何 token、Cookie 或用户标识。
- **开源副本不含真实配置。** 仓库里只有 `.env.example` 和 `wrangler.toml.example`，真实 `.env`（含 `CODEX_DAILY_SECRET`）和真实 `wrangler.toml`（含 KV id）不入库。

## 私密边界

这个项目可以公开页面、扩展、生成器和 Worker 逻辑，但以下内容必须保持私密：

- `.env`
- `CODEX_DAILY_SECRET`
- `CODEX_ADMIN_CODE`
- Cloudflare Worker 的 secret 配置
- 用户生成的 `auth.json`

本仓库已按 The Unlicense 公开（公共领域），你可以直接 fork 自行部署；也欢迎对照上面的“透明说明”审计代码。

## 测试

```bash
npm test
```

或逐项检查：

```bash
node -c worker.js
node -c server.js
node -c tools/generate-daily-code.js
node tests/daily-code.test.js
```

## 本仓库里没有的两个文件

开源副本只提供模板，真实配置需要你自己生成（不要提交到仓库）：

```bash
cp wrangler.toml.example wrangler.toml   # 填入自己的 KV namespace id
cp .env.example .env                     # 填入自己的 CODEX_DAILY_SECRET / CODEX_ADMIN_CODE
```

然后：

```bash
npm test
wrangler login
wrangler secret put CODEX_DAILY_SECRET
wrangler secret put CODEX_ADMIN_CODE
wrangler deploy
```

## 开源许可

沿用仓库根目录的 [LICENSE](../LICENSE)（The Unlicense，公共领域）。
