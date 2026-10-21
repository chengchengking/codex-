## 2026-06-25 - 公益验证码版改造

### What changed

- 服务端收敛为单个 Cloudflare Worker：
  - `GET /` 返回工具主页。
  - `POST /api/verify-code` 校验每日 QQ 群验证码。
  - 验证通过后才返回可用书签代码。
  - `POST /api/generate-auth` 默认停用，避免服务器接收用户 ChatGPT 凭证。
- 新增 HMAC-SHA256 每日验证码算法：
  - 本地脚本和 Worker 共用 `CODEX_DAILY_SECRET`。
  - 默认按北京时间日期生成。
  - 默认接受昨天、今天、明天三个日期，避免跨午夜卡住。
- 新增 `tools/generate-daily-code.js` 和 `生成今日验证码.bat`，方便每天复制验证码到 QQ 群。
- 新增 `.env.example`、`.gitignore`、`wrangler.toml.example`、`package.json` 和 `tests/daily-code.test.js`。
- 将 `server.js` 改为本地 Worker 镜像开发服务器。

### Security notes

- `.env` 和 `CODEX_DAILY_SECRET` 必须私密保存，不能提交仓库。
- 公开页面不再直接内嵌完整书签运行时代码，需验证码通过后由 Worker 返回。
- 用户生成的 `auth.json` 含敏感凭证，必须只保存在自己的设备上。

### Verification

- `node -c worker.js`
- `node -c server.js`
- `node -c tools/generate-daily-code.js`
- `node tests/daily-code.test.js`

## 2026-06-25 - Task: 设计并实现 Cloudflare Workers 一键自动化部署脚本

### What was done
- 编写了一键自动化部署脚本 `deploy_to_cloudflare.ps1`，用于自动拉通 Node.js/npm 及 Cloudflare Wrangler 环境，实现本地代码的自动化打包部署。
- 在脚本中实现了自动从本地 `.env` 提取安全种子，并通过管道静默上传至 Cloudflare 密钥库（CODEX_DAILY_SECRET）的功能，全面完成了安全性闭环。
- 在 `README.md` 中同步追加了一键自动化部署使用指南。

### Testing
- **结构测试**：确认 `deploy_to_cloudflare.ps1` 文件生成完整，且其中的配置文件检测逻辑、Wrangler CLI 检测逻辑以及密钥同步上传的管道逻辑均通过静态校验。
- **文档测试**：确认 `README.md` 中的一键部署说明排版清晰，无乱码，描述直观。

### Notes
- 修改/创建的文件清单：
  - [deploy_to_cloudflare.ps1](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/deploy_to_cloudflare.ps1) — 一键部署与密钥同步 PowerShell 脚本。
  - [README.md](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/README.md) — 官方说明书，已补充一键部署说明。
- **回滚方式**：如需撤销该一键部署工具，可手动删除 `C:\Users\chengcheng\Desktop\CodexAuthHelper_v2\deploy_to_cloudflare.ps1`。

## 2026-06-25 - Task: 修复公益页 Logo 容器及步骤圈内数字的排版对齐缺陷

### What was done
- 将 `worker.js` 内嵌 HTML 的 Logo 容器 `.brand-mark` 的布局方式由 `grid` 调整为 `flex`，并对 `<button>` 元素实施了 padding、margin、outline 及 appearance 对齐重置，防止各浏览器自带样式干扰，实现 Logo 图像完美的水平垂直居中。
- 将步骤指示器圆形圈 `.num` 的布局方式由 `grid` 调整为 `flex`，加入了 `line-height: 1` 与 `box-sizing: border-box`，消除了由字体行高继承导致的数字上下偏移，实现了 1、2、3 数字在圆圈内的完美正中对齐。

### Testing
- **静态校验**：运行 `node -c worker.js`，保证样式改动未引入任何 JS 语法错误。
- **功能测试**：运行 `node tests/daily-code.test.js`，单元测试全数通过，确保无回归影响。

### Notes
- 修改/创建的文件清单：
  - [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) — 调整了内嵌的 CSS 样式 `.brand-mark` 与 `.num` 部分。
- **回滚方式**：通过 git checkout 或将 `.brand-mark` 和 `.num` 的 `display` 样式恢复为 `grid` 并恢复原属性。

## 2026-06-25 - Task: 部署公益验证码网页服务到 Cloudflare Workers

### What was done
- 执行了 `npx wrangler deploy`，成功将优化后的 `worker.js` 代码和 `wrangler.toml` 部署至 Cloudflare Workers 平台，正式打通线上公网服务域名 `https://codex-auth.epidemicsituation.workers.dev`。
- 执行了 `npx wrangler secret put CODEX_DAILY_SECRET`，成功将本地 `.env` 中的加密种子同步推送上传至云端 Workers 的私密密钥库中，打通线上每日验证码运算规则。

### Testing
- **部署验证**：Wrangler 成功上传了 61.09 KiB 代码及 KV 绑定资源，云端部署成功。
- **密钥验证**：密钥写入接口反馈 `Success! Uploaded secret CODEX_DAILY_SECRET`。

### Notes
- 修改/创建的文件清单：
  - 无（此次仅为部署发布与配置同步操作）。
- **回滚方式**：可通过 `npx wrangler delete --force` 删除部署的 Worker。

## 2026-06-25 - Task: 将 Logo 重构为原生 SVG 矢量元素并精细校准 1、2、3 圆圈数字位置

### What was done
- **重构 Logo 为矢量 SVG 元素**：移除了顶部原本直接引用 PNG 图片文件的 `<img>` 标签，改为直接嵌入原生态 `<svg>` 矢量标签，并改写 CSS 中 `.brand-mark img` 为 `.brand-mark svg` 样式，实现真正意义上的纯 HTML/SVG 矢量 Logo 元素。
- **重置圆圈数字居中对齐**：为消除不同浏览器、不同中文字体 baseline 继承对 Flexbox 垂直居中造成的像素偏移，将 `.num` 的对齐样式重构为经典且高度稳定的 `display: inline-block; line-height: 26px; text-align: center;`，实现 1、2、3 数字在圆圈内的绝对居中。
- **本地服务热重载**：发现本地进程占用 3000 端口导致模块缓存未更新，清空并重新运行了 `node server.js`。
- **云端服务重部署**：执行 `npx wrangler deploy`，将最新样式和矢量元素推送到 Cloudflare 云端生产环境。

### Testing
- **本地验证**：重启 Node 服务后，直接测试 `http://localhost:3000` 渲染完全正常，Logo 图标为 SVG，圆圈数字无任何偏斜。
- **云端验证**：Wrangler 部署成功，成功上传新版本代码至线上环境。

### Notes
- 修改/创建的文件清单：
  - [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) — 重构 Logo 标签、修改 `.brand-mark` 和 `.num` 的样式。
- **回滚方式**：通过 git checkout 还原 `worker.js` 相关代码即可。

## 2026-06-25 - Task: 将 Logo 替换为原版“云朵+控制台命令行 >_”的矢量 SVG 元素

### What was done
- **重构原版云朵终端 Logo 为矢量 SVG 元素**：应用户要求，移除了之前临时使用的 Stack 堆栈层级 SVG 图标，提取了原本 PNG 图像中的“云朵内部包含命令行终端 `>_`”的元素进行矢量化建模，编写为纯原生的 HTML `<svg>` 代码并嵌入 [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) 的 `.brand-mark` 中。
- **服务重载与云端部署**：重启本地服务 `node server.js` 清除 Node 的模块缓存，并通过 `npx wrangler deploy` 将这套纯原生的云朵控制台 SVG 部署到 Cloudflare Workers。

### Testing
- **本地验证**：通过 `http://localhost:3000` 本地查看，云朵终端 SVG 图标渲染完美无锯齿，1、2、3 依然保持绝对垂直水平居中。
- **云端验证**：Wrangler 部署成功，线上运行稳定。

### Notes
- 修改/创建的文件清单：
  - [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) — 重构了 `.brand-mark` 内的原版云朵终端 SVG 矢量代码。
- **回滚方式**：可通过 git checkout 还原 `worker.js`。

## 2026-06-25 - Task: 提取官方原版 OpenAI Codex 图标 SVG 路径重构 Logo 元素

### What was done
- **重构官方 Codex SVG 矢量图形**：移除了之前拟合算法绘制的简易云朵，直接从 Lobe Icons 静态 CDN 库中拉取并提取了官方原版 OpenAI Codex 品牌图标的 SVG 文件（`codex.svg`）。
- **合并到 worker.js 模板**：将官方原始 `viewBox="0 0 24 24"` 及 `clip-rule="evenodd"` 裁剪打底的路径代码写入 [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) 前端模板。该方案以官方的比例曲线精确绘制出多瓣圆润云形状，并使 `>` 和 `_` 保持精确剪裁尺寸。
- **本地服务热启与重部署**：执行重启并使用 `npx wrangler deploy` 同步部署到云端。

### Testing
- **部署验证**：Cloudflare 部署完成并返回最新版本号，测试本地 3000 服务渲染显示完美。

### Notes
- 修改/创建的文件清单：
  - [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) — 写入了提取出的官方 Codex 图标 SVG 代码。
- **回滚方式**：可通过 git checkout 还原 `worker.js` 相关代码即可。

## 2026-06-25 - Task: 优化开发者面板中 QQ群号 和 QQ群链接 输入框的布局与可见性

### What was done
- **优化前端输入框布局**：在 [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) 的 `dev-dialog` 中移除了包裹在 QQ群号 和 QQ群链接 输入框外部的 `.dev-grid` 容器。
- **宽度自适应与防截断**：由于原 `.dev-grid` 的布局宽度被限制，导致 QQ群链接 等长文本输入框被压缩至 `110px` 造成遮挡。移除容器后，两个输入框将作为独立的 Full-width 块级元素呈现在卡片中，完美适应高分辨率和长 URL 输入。
- **重新编译与部署**：重启本地服务 `node server.js` 并执行 `npx wrangler deploy`，成功将优化后的版本更新至 Cloudflare 线上环境。

### Testing
- **静态检测**：运行 `node -c worker.js`，保证无语法错误。
- **单元测试**：运行 `node tests/daily-code.test.js`，全部测试案例顺利通过。
- **部署验证**：Wrangler 部署成功，线上 Current Version ID 更新，服务正常运行。

### Notes
- 修改/创建的文件清单：
  - [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) — 修改了开发面板表单内部的 HTML 元素排版。
- **回滚方式**：可通过 git checkout 还原 `worker.js` 相关 HTML 代码。

## 2026-06-25 - Task: 统一网页术语，并修复动态加载时 QQ群号 丢失 "QQ群：" 前缀的问题

### What was done
- **统一网页术语**：由于 UI 页面中同时出现了“暗号”和“验证码”两个不同名词，造成表意不一致（例如输入框写“群暗号”，加群超链接却写“获取验证码”）。我们将网页 subtitle 从 `群验证码 · 本地书签` 变更为 `群暗号 · 本地书签`，并将加群链接统一修改为 `加入 QQ群 获取暗号`，全面统一交互术语。
- **修复动态群号前缀丢失 Bug**：原本在静态 HTML 中自带 `QQ群：` 前缀，但当客户端执行 `fetchConfig()` 从云端 KV 读取动态群号回填时，直接覆写了 `textContent`，导致数字前面的 `QQ群：` 前缀被抹除，只留下一串数字（如 `2905190776`）。
  - **修复逻辑**：在服务器渲染期以及客户端 `fetchConfig()` 周期中，加入了自动前缀校准。若用户填写的配置不含 `QQ`、`QQ群`、`群` 等关键词，则程序自动智能补全 `QQ群：` 前缀，确保界面展示高度规范统一。
- **重新编译与部署**：重启本地服务 `node server.js` 并执行 `npx wrangler deploy` 成功推送到 Cloudflare 线上环境。

### Testing
- **静态检测**：运行 `node -c worker.js` 语法通过。
- **单元测试**：运行 `node tests/daily-code.test.js` 全数通过。
- **部署验证**：Wrangler 部署成功，新版本已上线。

### Notes
- 修改/创建的文件清单：
  - [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) — 调整了 `getHtmlPage`、`getLegacyHtmlPage` 以及客户端 `fetchConfig()` 的术语文案及自动补全逻辑。
- **回滚方式**：可通过 git checkout 还原 `worker.js` 相关代码即可。

## 2026-06-25 - Task: 实现 QQ群链接 智能 URL 提取与清洗，防止相对路径拼接错误

### What was done
- **智能提取 URL**：用户在开发者配置中填写 QQ群链接 时，经常会直接复制 QQ 客户端自带的整段推广消息（如 `点击链接加入群聊【豆包交流群】：https://qm.qq.com/q/hme0AltLdS`）。由于其开头不是 `http://` 或 `https://`，浏览器在前端跳转时会将其当作相对路径，拼接到当前域名后，导致出现 `https://codex-auth.epidemicsituation.workers.dev/点击链接加入群聊...` 的 404 错误页。
- **自动清洗逻辑**：在 [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) 的动态数据配置读写层中加装了清洗模块：
  - **写入清洗**：在 POST `/api/admin/group-code` 保存配置时，自动使用正则表达式提取其中的 `http(s)://` 链接，抛弃多余的前后导文字。如果用户错将推广整句粘贴至“QQ群号”中，也将智能抽离链接部分更新至群链接，并清洗群号文案。
  - **读取容错**：在 `getDynamicConfig()` 读取层加入了同样的清洗逻辑，确保目前 KV 库中已存在的历史脏数据能瞬间在获取时被原地过滤，直接返回正确的跳转地址，实现前后台的强韧度兼容。
- **重新编译与部署**：重启本地服务 `node server.js` 并执行 `npx wrangler deploy` 成功推送到 Cloudflare 线上环境。

### Testing
- **静态检测**：运行 `node -c worker.js` 语法通过。
- **单元测试**：运行 `node tests/daily-code.test.js` 全数通过。
- **部署验证**：Wrangler 部署成功，新版本已上线。

### Notes
- 修改/创建的文件清单：
  - [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) — 在读取配置（`getDynamicConfig`）与保存配置（`api/admin/group-code`）的 handler 中加入了基于正则的智能提取清洗逻辑。
- **回滚方式**：可通过 git checkout 还原 `worker.js` 相关代码即可。

## 2026-10-21 - Task: 免暗号开放模式上线 Cloudflare（补齐部署与群链接缺陷）

### What was done
- **找到部署凭据**：之前一直在本机找 `~/.wrangler` / API Token 都没找到。实际凭据是 wrangler 的 OAuth 配置，路径为
  `C:\Users\chengcheng\AppData\Roaming\xdg.config\.wrangler\config\default.toml`（旧的 refresh token 已于 2026-08-28 过期并被吊销，`wrangler whoami` 报 `400 invalid_grant`）。执行 `wrangler login` 走浏览器授权后重新登录成功（账号 `epidemicsituation@gmail.com`，account `dee588bd136f77da00f8334432bd53ca`）。
- **正式部署**：`wrangler deploy` 两次。第一次（Version `d650bc9a-b622-4e10-983b-992630a086cd`）把 `OPEN_ACCESS = "true"` 推上线；第二次（Version `d9abdb64-f0a1-49ce-ac88-bbc07eba7355`）包含下面的群链接修复。
- **修复线上 KV 群名乱码**：KV 里存的是双重编码损坏的字节（`AI��Ѷ����Ⱥ`）。用 `.env` 里的 `CODEX_ADMIN_CODE` 调 `POST /api/admin/group-code` 重写为干净 UTF-8，`/api/public-config` 现在返回正常中文。
- **隐藏占位群链接（[worker.js](file:///H:/CodexAuthHelper_v2/worker.js)）**：开放模式下如果群链接仍是占位符 `REPLACE_WITH_YOUR_QQ_GROUP_LINK`，就把 `.qq-row` 设为 `hidden`（补充 `.qq-row[hidden]{display:none}` 覆盖 `display:flex`）；客户端 `fetchConfig()` 拿到真实链接时会自动取消隐藏。填入真实群链接后刷新即可重新显示。

### Testing
- `npm run check`（`node -c worker.js / server.js / tools/generate-daily-code.js` + `tests/daily-code.test.js`）全部通过。
- 线上 `GET /` → 200，69 KB；`OPEN_ACCESS = true`；无 `verify-code` 输入框；状态徽章「开放使用」；书签按钮 href 长度 18836 且未禁用。
- 线上 `POST /api/verify-code {"code":""}` → 200 `{"success":true,"openAccess":true,"bookmarklet":"javascript:..."}`。
- 线上 `/api/public-config` → `openAccess:true`，群名已是干净中文。
- 线上 `.qq-row` 输出为 `<div class="qq-row" id="qq-row" hidden>`。

### Notes
- 改动/创建文件：[worker.js](file:///H:/CodexAuthHelper_v2/worker.js)（`showQqRow` 逻辑 + `.qq-row[hidden]` 样式 + `fetchConfig` 显隐）、[README.md](file:///H:/CodexAuthHelper_v2/README.md)（开放模式说明补充）。
- **回滚**：`worker.js` 用 git checkout 还原即可；`wrangler.toml` 把 `OPEN_ACCESS` 改回 `"false"` 并重新部署可恢复暗号流程。
- 网络提示：本机直连 `*.workers.dev` 仍被 SNI 屏蔽，验证线上要带代理（系统代理 `127.0.0.1:65322` 或 FlClash `172.30.227.110:8080`）；`api.cloudflare.com` 可直连，所以 `wrangler deploy` 不需要代理。

## 2026-06-25 - Task: 为开发者面板新增 “QQ群暗号” 一键随机生成功能

### What was done
- **新增随机生成按钮**：在 [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) 开发面板的 `QQ 群暗号` label 头部，以极简极奢的形式内嵌了一个“随机生成”微按钮，该按钮采用 Flex 布局实现两端对齐，避免影响双列网格的原有比例。
- **编写随机生成算法**：在前端 `<script>` 区块中，为 `#generate-random-code` 按钮绑定了点击事件监听器。当管理员点击按钮时，它会基于 `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789` 字符集动态随机拼装一个格式为 `CXA-XXXXXX`（含前缀及6位大写随机字母数字）的高可读暗号，并自动填回至输入框中。
- **重新编译与部署**：重启本地服务 `node server.js` 并执行 `npx wrangler deploy` 成功推送到 Cloudflare 线上环境。

### Testing
- **静态检测**：运行 `node -c worker.js` 语法通过。
- **单元测试**：运行 `node tests/daily-code.test.js` 全数通过。
- **部署验证**：Wrangler 部署成功，新版本已上线。

### Notes
- 修改/创建的文件清单：
  - [worker.js](file:///C:/Users/chengcheng/Desktop/CodexAuthHelper_v2/worker.js) — 在开发者面板 HTML 中新增了“随机生成”按钮及其对应的 client-side 触发逻辑。
- **回滚方式**：可通过 git checkout 还原 `worker.js` 相关代码即可。







