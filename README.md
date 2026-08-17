

# OpenAI Codex Login Bypass Tool (免验证码登录辅助工具)

一個簡單、免配置、100% 成功率的 OpenAI Codex 登錄繞過工具。

## 💡 為什麼需要這個工具？

在使用 OpenAI Codex 桌面客戶端進行登錄時，默認登錄流程會要求綁定並驗證**手機號**。
本工具通過直接提取網頁端已登錄的 Token，並利用 Cloudflare Worker 進行無狀態的 ID Token 嫁接，直接將合法的登錄態寫入本地配置文件 `~/.codex/auth.json`，從而跳過手機驗證。

---

## 🚀 一键免密钥启动

我們已經去除了所有不透明的 `.exe` 可执行文件、去除了所有需要註冊的 `Secret Key` 同步密鑰。代碼 100% 開源透明，一鍵雙击即用。

### 使用步驟

1. **下載項目**：
   - 下載本倉庫的所有代碼文件到本地。
2. **雙擊運行**：
   - 直接雙擊運行 [双击运行.bat](双击运行.bat)。
3. **自動捕獲**：
   - 腳本會掃描系統中已安裝的 Chrome 或 Edge 瀏覽器。
   - 自動為您拉起一個獨立的 ChatGPT 登錄窗口。
   - 請在網頁中登錄您的 ChatGPT 帳號。進入聊天界面後，**直接手動關閉該瀏覽器窗口**。
   - 腳本會自動提取 Token，並通過 Cloudflare 進行無狀態嫁接，自動寫入本地。
4. **啟動 Codex**：
   - 更新完成後，按提示直接啟動 Codex 桌面應用即可正常使用！

---

## 📁 倉庫文件說明

- [双击运行.bat](双击运行.bat) : Windows 平台一鍵啟動腳本。
- [codex-auth-helper.ps1](codex-auth-helper.ps1) : 原生 PowerShell 同步內核，開源透明，無毒免殺。
- [codex_session_extractor.js](codex_session_extractor.js) : 網頁端手動提取 Token 的備用 JavaScript 腳本，執行後會將生成的 Codex 配置 JSON 複製到剪貼板。
- [cloudflare-worker/](cloudflare-worker/) : Cloudflare Worker 的完整無狀態服務端源代碼。

---

## ⚠️ 安全與隱私說明

1. 本項目**不收集、不存儲**您的任何 Token。改版後的 Cloudflare Worker `/graft` 接口採用無狀態設計，僅在內存中進行字符串替換後立即返回給客戶端，不涉及任何數據库或 KV 存儲。
2. `access_token` 的有效期一般為 **10天**。過期後如果 Codex 提示重新登錄，再次雙擊運行一次本工具即可。
3. 項目代碼完全開源，您也可以使用 [cloudflare-worker/](cloudflare-worker/) 的代碼自行部署專屬的 Cloudflare Worker 服務端。

---

## 📄 開源許可證

本项目基于 [The Unlicense](LICENSE) 协议发布，完全進入公共領域（Public Domain）。
