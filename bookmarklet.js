// Codex Auth Helper - bookmarklet runtime
//
// 用法：把 tools/build-bookmarklet.js 生成的 `javascript:` 链接存成浏览器书签，
// 在已登录的 https://chatgpt.com 页面点一下，就会读取你自己的会话并生成 auth.json。
//
// 全部逻辑都在你的浏览器里跑：只请求同源的 chatgpt.com/api/auth/session，
// 不向任何第三方发送凭证。

(function () {
  if (window.location.hostname !== "chatgpt.com") {
    alert("请先打开并登录 https://chatgpt.com，然后再点击这个书签。");
    return;
  }



  if (document.getElementById("codex-public-helper-panel")) {
    return;
  }

  fetch("https://chatgpt.com/api/auth/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    },
  })
    .then((response) => {
      if (response.status === 401 || response.status === 403) throw new Error("UNAUTHORIZED");
      if (!response.ok) throw new Error("HTTP_" + response.status);
      return response.json();
    })
    .then((session) => {
      if (!session || !session.accessToken) throw new Error("TOKEN_EMPTY");
      renderPanel(createAuthConfig(session));
          })
    .catch((error) => {
      let text = "读取失败：";
      if (error.message === "UNAUTHORIZED") {
        text += "当前 ChatGPT 页面未登录。";
      } else if (error.message === "TOKEN_EMPTY") {
        text += "未检测到 accessToken。";
      } else {
        text += error.message;
      }
      alert(text);
    });

  function base64UrlEncode(value) {
    const json = JSON.stringify(value);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  }

  function createAuthConfig(session) {
    const accountId = session.account?.id || "";
    const userId = session.user?.id || "";
    const email = session.user?.email || "";
    const planType = session.account?.planType || "free";
    const iat = Math.floor(Date.now() / 1000);
    const exp = session.expires
      ? Math.floor(new Date(session.expires).getTime() / 1000)
      : iat + 30 * 24 * 3600;
    const jwtHeader = { alg: "none", typ: "JWT", cpa_synthetic: true };
    const jwtPayload = {
      iat,
      exp,
      "https://api.openai.com/auth": {
        chatgpt_account_id: accountId,
        chatgpt_plan_type: planType,
        chatgpt_user_id: userId,
        user_id: userId,
      },
      email,
    };
    return {
      auth_mode: "chatgpt",
      OPENAI_API_KEY: null,
      tokens: {
        id_token: base64UrlEncode(jwtHeader) + "." + base64UrlEncode(jwtPayload) + ".synthetic",
        access_token: session.accessToken,
        refresh_token: "",
        account_id: accountId,
      },
      last_refresh: new Date().toISOString(),
    };
  }

  function renderPanel(config) {
    const authJsonString = JSON.stringify(config, null, 2);
    const style = document.createElement("style");
    style.id = "codex-public-helper-style";
    style.textContent = [
      "#codex-public-helper-panel{position:fixed;right:24px;bottom:24px;width:330px;background:#fff;color:#151713;border:1px solid #d9ded6;border-radius:8px;box-shadow:0 24px 70px rgba(21,23,19,.24);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;z-index:2147483647;padding:16px}",
      "#codex-public-helper-panel *{box-sizing:border-box}",
      ".cph-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #d9ded6;padding-bottom:10px;margin-bottom:12px}",
      ".cph-title{font-size:14px;font-weight:800}",
      ".cph-close{border:0;background:#f0f3ee;border-radius:6px;width:28px;height:28px;cursor:pointer}",
      ".cph-row{display:flex;justify-content:space-between;gap:12px;font-size:12px;padding:7px 0;border-bottom:1px solid #edf0ea}",
      ".cph-row span:first-child{color:#69706a}",
      ".cph-row span:last-child{font-weight:700;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".cph-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}",
      ".cph-btn{border:1px solid #151713;background:#151713;color:#fff;border-radius:8px;min-height:38px;font-size:12px;font-weight:800;cursor:pointer}",
      ".cph-btn.secondary{background:#fff;color:#151713;border-color:#d9ded6}",
      ".cph-note{margin-top:10px;color:#69706a;font-size:11px;line-height:1.45}",
    ].join("");
    document.head.appendChild(style);

    const panel = document.createElement("div");
    panel.id = "codex-public-helper-panel";
    panel.innerHTML = [
      '<div class="cph-head"><div class="cph-title">Codex Auth Helper</div><button class="cph-close" type="button" aria-label="关闭">×</button></div>',
      '<div class="cph-row"><span>状态</span><span>本地生成完成</span></div>',
      '<div class="cph-row"><span>账户</span><span id="cph-email"></span></div>',
      '<div class="cph-row"><span>计划</span><span id="cph-plan"></span></div>',
      '<div class="cph-row"><span>到期</span><span id="cph-exp"></span></div>',
      '<div class="cph-actions"><button class="cph-btn" id="cph-save">保存 auth.json</button><button class="cph-btn secondary" id="cph-copy">复制配置</button></div>',
      '<div class="cph-note">保存时选择自己的 Codex 配置目录；不支持系统保存窗口时会自动下载。</div>',
    ].join("");
    document.body.appendChild(panel);

    let email = "未知账户";
    let plan = "FREE";
    let expires = "长期有效";
    try {
      const payloadPart = config.tokens.id_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(decodeURIComponent(atob(payloadPart).split("").map((char) => {
        return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
      }).join("")));
      const authData = payload["https://api.openai.com/auth"] || {};
      email = payload.email || email;
      plan = String(authData.chatgpt_plan_type || "free").toUpperCase();
      if (payload.exp) {
        const date = new Date(payload.exp * 1000);
        expires = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
      }
    } catch (error) {}

    panel.querySelector("#cph-email").textContent = email;
    panel.querySelector("#cph-plan").textContent = plan;
    panel.querySelector("#cph-exp").textContent = expires;
    panel.querySelector(".cph-close").addEventListener("click", () => {
      panel.remove();
      style.remove();
    });
    panel.querySelector("#cph-copy").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(authJsonString);
        alert("配置已复制到剪贴板。");
      } catch (error) {
        alert("复制失败，请改用下载 JSON。");
      }
    });
    panel.querySelector("#cph-save").addEventListener("click", async () => {
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: "auth.json",
            types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
          });
          const writable = await handle.createWritable();
          await writable.write(authJsonString);
          await writable.close();
          alert("auth.json 已保存。");
          return;
        } catch (error) {
          if (error && error.name === "AbortError") return;
        }
      }

      const blob = new Blob([authJsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "auth.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }
})();
