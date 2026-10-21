/**
 * Codex Auth Helper - Console version
 *
 * 用法：
 * 1. 打开浏览器登录 https://chatgpt.com/
 * 2. 按 F12（Mac 是 Cmd+Option+I）打开 DevTools，切到 Console
 * 3. 把本文件整段粘进去回车
 * 4. 它会读取当前会话、解析 JWT、拼成 Codex 需要的 auth.json，并复制到剪贴板
 * 5. 粘贴保存为 ~/.codex/auth.json 即可
 *
 * 只请求同源的 /api/auth/session，不向任何第三方发送数据。
 */

(function () {
    console.log("%c[Codex Auth Helper]%c 正在读取当前会话...", "color: #10a37f; font-weight: bold;", "color: inherit;");

    if (window.location.hostname !== "chatgpt.com") {
        console.error("[Codex Auth Helper] Error: This script must be run on https://chatgpt.com/");
        alert("错误：此脚本必须在 https://chatgpt.com/ 域名下运行！\n请先登录 ChatGPT，然后再控制台执行本脚本。");
        return;
    }

    fetch("/api/auth/session")
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data || !data.accessToken) {
                throw new Error("Could not find a valid accessToken in the active session. Are you logged in?");
            }

            const token = data.accessToken;
            let accountId = "";

            // Try to extract account_id from JWT payload
            try {
                const payloadPart = token.split(".")[1];
                const decodedPayload = JSON.parse(atob(payloadPart));
                const authInfo = decodedPayload["https://api.openai.com/auth"] || {};
                accountId = authInfo.chatgpt_account_id || "";
            } catch (err) {
                console.warn("[Codex Auth Helper] 解析 account_id 失败：", err);
            }

            // Construct the exact structure expected by OpenAI Codex CLI/Desktop
            // Crucial Trick: We use the access_token as the id_token to satisfy Codex's JWT parsing.
            const authJson = {
                "auth_mode": "chatgpt",
                "OPENAI_API_KEY": null,
                "tokens": {
                    "id_token": token,
                    "access_token": token,
                    "refresh_token": "",
                    "account_id": accountId
                },
                "last_refresh": new Date().toISOString()
            };

            const formattedJson = JSON.stringify(authJson, null, 2);

            // Copy to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(formattedJson)
                    .then(() => {
                        showSuccess(formattedJson);
                    })
                    .catch((err) => {
                        console.error("[Codex Auth Helper] 剪贴板写入失败，改为打印输出。", err);
                        fallbackCopy(formattedJson);
                    });
            } else {
                fallbackCopy(formattedJson);
            }
        })
        .catch((err) => {
            console.error("[Codex Auth Helper] 获取失败：", err);
            alert(`获取失败！\n原因: ${err.message}\n请确保您已在网页成功登录 ChatGPT 并且网络正常。`);
        });

    function fallbackCopy(text) {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.width = "2em";
            textArea.style.height = "2em";
            textArea.style.padding = "0";
            textArea.style.border = "none";
            textArea.style.outline = "none";
            textArea.style.boxShadow = "none";
            textArea.style.background = "transparent";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                showSuccess(text);
            } else {
                throw new Error("execCommand returned false");
            }
        } catch (err) {
            console.log("[Codex Auth Helper] Fallback copy failed:", err);
            promptForCopy(text);
        }
    }

    function promptForCopy(text) {
        console.log("=== COPY THE JSON BELOW ===");
        console.log(text);
        console.log("===========================");
        alert("无法自动复制到剪贴板。请打开控制台(F12)，复制打印出的 JSON，保存为 ~/.codex/auth.json。");
    }

    function showSuccess(text) {
        console.log("%c[Codex Auth Helper]%c 已生成配置并复制到剪贴板。", "color: #10a37f; font-weight: bold;", "color: #a6e3a1;");
        console.log("=== Config Payload ===");
        console.log(text);
        console.log("======================");
        alert("已生成 Codex 配置并复制到剪贴板。\n把它保存为 ~/.codex/auth.json 即可。");
    }
})();
