const DAILY_CODE_SECRET_PLACEHOLDER = "CHANGE_ME_WITH_WRANGLER_SECRET";
const DEFAULT_CODE_PREFIX = "CXA";
const DEFAULT_TIMEZONE_OFFSET_MINUTES = "480";
const DEFAULT_QQ_GROUP_LABEL = "QQ群：请替换为你的群号";
const DEFAULT_QQ_GROUP_URL = "https://qm.qq.com/q/REPLACE_WITH_YOUR_QQ_GROUP_LINK";
const DAILY_CODE_DAY_WINDOW = [-1, 0, 1];
const GROUP_CODE_KEY = "group-code:current";
const DYNAMIC_CONFIG_KEY = "config:qq-group";
const ADMIN_RATE_PREFIX = "admin-rate:";
const ADMIN_COOLDOWN_AFTER_FAILURES = 3;
const ADMIN_COOLDOWN_BASE_SECONDS = 60;
const ADMIN_COOLDOWN_MAX_SECONDS = 3600;
const BOOKMARKLET_TTL_MS = 30 * 60 * 1000;

function getCodexIconDataUrl() {
  return CODEX_ICON_DATA_URL.replace("MVVVqqRWb", "MVVVqqqRWb");
}
const CODEX_ICON_DATA_URL = "data:image/png;base64,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";

if (typeof addEventListener === "function") {
  addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
  });
}

function getRuntimeValue(name, fallback) {
  const globalValue = globalThis && globalThis[name];
  if (globalValue) return String(globalValue);

  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return String(process.env[name]);
  }

  return fallback;
}

function getDailyCodeSecret() {
  const value = getRuntimeValue("CODEX_DAILY_SECRET", "").trim();
  return value === DAILY_CODE_SECRET_PLACEHOLDER ? "" : value;
}

function isDailyCodeSecretConfigured() {
  return getDailyCodeSecret().length >= 24;
}

function getAdminAccessCode() {
  return getRuntimeValue("CODEX_ADMIN_CODE", "").trim();
}

function getCodePrefix() {
  return getRuntimeValue("CODEX_CODE_PREFIX", DEFAULT_CODE_PREFIX).trim().toUpperCase();
}

function getTimeZoneOffsetMinutes() {
  const rawValue = getRuntimeValue("CODEX_CODE_TZ_OFFSET_MINUTES", DEFAULT_TIMEZONE_OFFSET_MINUTES);
  const offset = Number.parseInt(rawValue, 10);
  return Number.isFinite(offset) ? offset : Number.parseInt(DEFAULT_TIMEZONE_OFFSET_MINUTES, 10);
}

function isOpenAccessEnabled() {
  const raw = getRuntimeValue("OPEN_ACCESS", "false").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

function getPublicConfig() {
  const configuredStaticCode = getRuntimeValue("CODEX_VERIFY_CODE", "").trim();
  return {
    openAccess: isOpenAccessEnabled(),
    verifyCodeMode: "daily-hmac",
    verifyCodeConfigured: Boolean(configuredStaticCode || isDailyCodeSecretConfigured()),
    timezone: "Asia/Shanghai",
    qqGroupLabel: getRuntimeValue("QQ_GROUP_LABEL", DEFAULT_QQ_GROUP_LABEL),
    qqGroupUrl: getRuntimeValue("QQ_GROUP_URL", DEFAULT_QQ_GROUP_URL),
  };
}

async function getDynamicConfig() {
  try {
    const raw = await getAuthStore().get(DYNAMIC_CONFIG_KEY);
    if (raw) {
      const parsed = safeJsonParse(raw);
      if (parsed) {
        let urlValue = String(parsed.qqGroupUrl || "").trim();
        if (urlValue) {
          const urlMatch = urlValue.match(/(https?:\/\/[^\s]+)/i);
          if (urlMatch) {
            parsed.qqGroupUrl = urlMatch[1];
          }
        }
        let labelValue = String(parsed.qqGroupLabel || "").trim();
        if (labelValue) {
          const urlMatchInLabel = labelValue.match(/(https?:\/\/[^\s]+)/i);
          if (urlMatchInLabel) {
            if (!parsed.qqGroupUrl || parsed.qqGroupUrl === urlValue) {
              parsed.qqGroupUrl = urlMatchInLabel[1];
            }
            labelValue = labelValue.replace(urlMatchInLabel[0], "").replace(/[:：\s]+/g, "").trim();
            parsed.qqGroupLabel = labelValue;
          }
        }
        if (parsed.qqGroupLabel && parsed.qqGroupUrl) {
          return parsed;
        }
      }
    }
  } catch (error) {
    console.error("读取动态群配置失败:", error);
  }
  return null;
}

async function getDynamicPublicConfig() {
  const base = getPublicConfig();
  const dynamic = await getDynamicConfig();
  if (dynamic) {
    base.qqGroupLabel = dynamic.qqGroupLabel;
    base.qqGroupUrl = dynamic.qqGroupUrl;
  }
  return base;
}

function normalizeVerifyCode(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function normalizeGroupCode(value) {
  return normalizeVerifyCode(value);
}

function getAuthStore() {
  if (typeof CODEX_AUTH_STORE !== "undefined" && CODEX_AUTH_STORE) {
    return CODEX_AUTH_STORE;
  }

  if (globalThis && globalThis.CODEX_AUTH_STORE) {
    return globalThis.CODEX_AUTH_STORE;
  }

  if (!globalThis.__codexAuthLocalStore) {
    globalThis.__codexAuthLocalStore = new Map();
  }

  return {
    async get(key) {
      const item = globalThis.__codexAuthLocalStore.get(key);
      if (!item) return null;
      if (item.expiresAt && item.expiresAt <= Date.now()) {
        globalThis.__codexAuthLocalStore.delete(key);
        return null;
      }
      return item.value;
    },
    async put(key, value, options = {}) {
      const ttlSeconds = Number(options.expirationTtl || 0);
      globalThis.__codexAuthLocalStore.set(key, {
        value,
        expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0,
      });
    },
    async delete(key) {
      globalThis.__codexAuthLocalStore.delete(key);
    },
  };
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function getDateStamp(date = new Date(), dayOffset = 0) {
  const offsetMs = getTimeZoneOffsetMinutes() * 60 * 1000;
  const shifted = new Date(date.getTime() + offsetMs + dayOffset * 24 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

async function hmacSha256Hex(secret, message) {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || !cryptoApi.subtle) {
    throw new Error("当前运行环境不支持 HMAC-SHA256");
  }

  const encoder = new TextEncoder();
  const key = await cryptoApi.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await cryptoApi.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

async function hashGroupCode(value) {
  if (!isDailyCodeSecretConfigured()) {
    throw new Error("CODEX_DAILY_SECRET 未配置，无法保存群暗号。");
  }
  return hmacSha256Hex(getDailyCodeSecret(), `codex-auth-helper:group-code:v1:${normalizeGroupCode(value)}`);
}

function getClientAddress(request) {
  return (
    request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || String(request.headers.get("x-forwarded-for") || "").split(",")[0].trim()
    || "local"
  );
}

async function getAdminRateKey(request) {
  const address = getClientAddress(request);
  const digest = await hmacSha256Hex(getDailyCodeSecret() || getAdminAccessCode(), `codex-auth-helper:admin-rate:v1:${address}`);
  return `${ADMIN_RATE_PREFIX}${digest.slice(0, 32)}`;
}

async function getAdminRateState(key) {
  const rawValue = await getAuthStore().get(key);
  const parsed = rawValue ? safeJsonParse(rawValue) : null;
  return {
    failures: Number(parsed?.failures || 0),
    lockUntil: Number(parsed?.lockUntil || 0),
  };
}

async function putAdminRateState(key, state, ttlSeconds) {
  await getAuthStore().put(key, JSON.stringify(state), {
    expirationTtl: Math.max(60, Math.ceil(ttlSeconds)),
  });
}

async function verifyAdminCode(request, adminCode) {
  const configuredAdminCode = getAdminAccessCode();
  if (!configuredAdminCode) {
    return {
      ok: false,
      status: 503,
      retryAfterSeconds: 0,
      message: "开发者暗号未配置，请先设置 CODEX_ADMIN_CODE。",
    };
  }

  const rateKey = await getAdminRateKey(request);
  const rateState = await getAdminRateState(rateKey);
  const now = Date.now();

  if (rateState.lockUntil > now) {
    const retryAfterSeconds = Math.ceil((rateState.lockUntil - now) / 1000);
    return {
      ok: false,
      status: 429,
      retryAfterSeconds,
      message: `操作过快，请 ${retryAfterSeconds} 秒后再试。`,
    };
  }

  if (normalizeGroupCode(adminCode) === normalizeGroupCode(configuredAdminCode)) {
    await getAuthStore().delete(rateKey);
    return { ok: true };
  }

  const failures = rateState.failures + 1;
  let retryAfterSeconds = 0;
  let lockUntil = 0;
  if (failures >= ADMIN_COOLDOWN_AFTER_FAILURES) {
    retryAfterSeconds = Math.min(
      ADMIN_COOLDOWN_MAX_SECONDS,
      ADMIN_COOLDOWN_BASE_SECONDS * (2 ** (failures - ADMIN_COOLDOWN_AFTER_FAILURES)),
    );
    lockUntil = now + retryAfterSeconds * 1000;
  }

  await putAdminRateState(rateKey, { failures, lockUntil }, retryAfterSeconds + 3600);
  return {
    ok: false,
    status: retryAfterSeconds ? 429 : 403,
    retryAfterSeconds,
    message: retryAfterSeconds ? `暗号不正确，请 ${retryAfterSeconds} 秒后再试。` : "暗号不正确。",
  };
}

async function getStoredGroupCodeRecord(now = Date.now()) {
  const rawValue = await getAuthStore().get(GROUP_CODE_KEY);
  const record = rawValue ? safeJsonParse(rawValue) : null;
  if (!record || !record.codeHash || !record.expiresAt) return null;

  if (Number(record.expiresAt) <= now) {
    await getAuthStore().delete(GROUP_CODE_KEY);
    return null;
  }

  return record;
}

async function saveGroupCode(value, ttlHours) {
  const normalized = normalizeGroupCode(value);
  if (normalized.length < 4 || normalized.length > 64) {
    throw new Error("群暗号长度需要在 4 到 64 个字符之间。");
  }

  const hours = Number(ttlHours);
  if (!Number.isFinite(hours) || hours < 1 || hours > 168) {
    throw new Error("有效时间需要在 1 到 168 小时之间。");
  }

  const now = Date.now();
  const ttlSeconds = Math.ceil(hours * 3600);
  const record = {
    codeHash: await hashGroupCode(normalized),
    expiresAt: now + ttlSeconds * 1000,
    updatedAt: now,
  };

  await getAuthStore().put(GROUP_CODE_KEY, JSON.stringify(record), {
    expirationTtl: Math.max(60, ttlSeconds),
  });

  return record;
}

async function isValidStoredGroupCode(value, now = Date.now()) {
  const normalized = normalizeGroupCode(value);
  if (!normalized) return false;

  const record = await getStoredGroupCodeRecord(now);
  if (!record) return false;

  const candidateHash = await hashGroupCode(normalized);
  return candidateHash === record.codeHash;
}

async function generateDailyVerifyCode(date = new Date(), dayOffset = 0) {
  if (!isDailyCodeSecretConfigured()) {
    throw new Error("CODEX_DAILY_SECRET 未配置，无法生成每日验证码。");
  }
  const secret = getDailyCodeSecret();
  const dateStamp = getDateStamp(date, dayOffset);
  const prefix = getCodePrefix();
  const digest = await hmacSha256Hex(secret, `codex-auth-helper:v2:${prefix}:${dateStamp}`);
  return `${prefix}-${dateStamp}-${digest.slice(0, 5)}-${digest.slice(5, 10)}`;
}

async function getAcceptedVerifyCodes(date = new Date()) {
  const configuredStaticCode = getRuntimeValue("CODEX_VERIFY_CODE", "").trim();
  const codes = configuredStaticCode ? [normalizeVerifyCode(configuredStaticCode)] : [];
  if (isDailyCodeSecretConfigured()) {
    for (const dayOffset of DAILY_CODE_DAY_WINDOW) {
      codes.push(normalizeVerifyCode(await generateDailyVerifyCode(date, dayOffset)));
    }
  }
  return codes;
}

async function isValidVerifyCode(value, date = new Date()) {
  const candidate = normalizeVerifyCode(value);
  if (!candidate) return false;
  if (await isValidStoredGroupCode(candidate, date.getTime())) return true;
  const acceptedCodes = await getAcceptedVerifyCodes(date);
  return acceptedCodes.includes(candidate);
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

async function readJsonBody(request, maxBytes = 4096) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBytes) {
    throw new Error("请求内容过大");
  }
  return request.json();
}

async function handleRequest(request, options = {}) {
  const url = new URL(request.url);
  const currentDate = options.currentDate instanceof Date ? options.currentDate : new Date();
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method === "GET" && url.pathname === "/") {
    return new Response(getHtmlPage(url.origin), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  }

  if (request.method === "GET" && url.pathname === "/api/public-config") {
    return jsonResponse(await getDynamicPublicConfig(), 200, corsHeaders);
  }

  if (request.method === "POST" && url.pathname === "/api/verify-code") {
    if (isOpenAccessEnabled()) {
      return jsonResponse({
        success: true,
        message: "已开放使用",
        openAccess: true,
        bookmarklet: getBookmarkletHref(),
      }, 200, corsHeaders);
    }

    try {
      const payload = await readJsonBody(request);
      const valid = await isValidVerifyCode(payload.verify_code, currentDate);
      return jsonResponse({
        success: valid,
        message: valid ? "验证通过" : "验证码不正确，请到 QQ 群公告获取最新验证码。",
        bookmarklet: valid ? getBookmarkletHref() : null,
      }, valid ? 200 : 403, corsHeaders);
    } catch (error) {
      return jsonResponse({ success: false, message: "请求格式不正确" }, 400, corsHeaders);
    }
  }

  if (request.method === "POST" && url.pathname === "/api/admin/group-code") {
    try {
      const payload = await readJsonBody(request, 2048);
      const adminResult = await verifyAdminCode(request, payload.admin_code);
      if (!adminResult.ok) {
        return jsonResponse({
          success: false,
          message: adminResult.message,
          retryAfterSeconds: adminResult.retryAfterSeconds || 0,
        }, adminResult.status, corsHeaders);
      }

      let expiresAt = null;
      if (payload.group_code) {
        const record = await saveGroupCode(payload.group_code, payload.ttl_hours || 24);
        expiresAt = record.expiresAt;
      } else {
        const currentRecord = await getStoredGroupCodeRecord();
        if (currentRecord) expiresAt = currentRecord.expiresAt;
      }

      if (payload.qq_group_label || payload.qq_group_url) {
        let label = (payload.qq_group_label || "").trim();
        let urlValue = (payload.qq_group_url || "").trim();

        if (urlValue) {
          const urlMatch = urlValue.match(/(https?:\/\/[^\s]+)/i);
          if (urlMatch) {
            urlValue = urlMatch[1];
          }
        }

        if (label) {
          const urlMatchInLabel = label.match(/(https?:\/\/[^\s]+)/i);
          if (urlMatchInLabel) {
            if (!urlValue) {
              urlValue = urlMatchInLabel[1];
            }
            label = label.replace(urlMatchInLabel[0], "").replace(/[:：\s]+/g, "").trim();
          }
        }

        const dynamicConfig = {
          qqGroupLabel: label || getRuntimeValue("QQ_GROUP_LABEL", DEFAULT_QQ_GROUP_LABEL),
          qqGroupUrl: urlValue || getRuntimeValue("QQ_GROUP_URL", DEFAULT_QQ_GROUP_URL)
        };
        await getAuthStore().put(DYNAMIC_CONFIG_KEY, JSON.stringify(dynamicConfig));
      }

      return jsonResponse({
        success: true,
        message: "群配置已更新。",
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      }, 200, corsHeaders);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: error.message || "保存失败",
      }, 400, corsHeaders);
    }
  }

  if (request.method === "POST" && url.pathname === "/api/generate-auth") {
    return jsonResponse({
      success: false,
      message: "公开公益版默认禁用服务器端凭证处理。请使用网页生成的本地书签，所有配置会在浏览器内完成。",
    }, 410, corsHeaders);
  }

  return new Response("Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function base64UrlEncode(value) {
  const json = JSON.stringify(value);
  const base64 = typeof btoa === "function"
    ? btoa(unescape(encodeURIComponent(json)))
    : Buffer.from(json, "utf8").toString("base64");
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function generateCodexAuthJson(session) {
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
      id_token: `${base64UrlEncode(jwtHeader)}.${base64UrlEncode(jwtPayload)}.synthetic`,
      access_token: session.accessToken,
      refresh_token: "",
      account_id: accountId,
    },
    last_refresh: new Date().toISOString(),
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createBookmarkletTicket(now = Date.now()) {
  return {
    id: createBookmarkletId(),
    issuedAt: now,
    expiresAt: now + BOOKMARKLET_TTL_MS,
  };
}

function createBookmarkletId() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
    const bytes = new Uint8Array(12);
    cryptoApi.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

function getBookmarkletHref(ticket = createBookmarkletTicket()) {
  return `javascript:${encodeURIComponent(`(${getBookmarkletRuntimeSource()})(${JSON.stringify(ticket)});`)}`;
}

function getBookmarkletRuntimeSource() {
  return function bookmarkletRuntime(ticket) {
    if (window.location.hostname !== "chatgpt.com") {
      alert("请先打开并登录 https://chatgpt.com，然后再点击这个书签。");
      return;
    }

    const metadata = ticket || {};
    const ticketId = String(metadata.id || "");
    const expiresAt = Number(metadata.expiresAt || 0);
    const storageKey = ticketId ? "codex-public-helper-bookmarklet-used:" + ticketId : "";

    if (!expiresAt || Date.now() > expiresAt) {
      alert("这个书签已经过期，请回到公益网页刷新页面并重新生成书签。");
      return;
    }

    try {
      if (storageKey && window.localStorage.getItem(storageKey) === "1") {
        alert("这个书签已经成功使用过，请回到公益网页刷新页面并重新生成书签。");
        return;
      }
    } catch (error) {}

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
        markBookmarkletUsed();
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

    function markBookmarkletUsed() {
      try {
        if (storageKey) window.localStorage.setItem(storageKey, "1");
      } catch (error) {}
    }

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
  }.toString();
}

function getLegacyHtmlPage(origin) {
  const publicConfig = getPublicConfig();
  const openAccess = isOpenAccessEnabled();
  let safeGroupLabel = escapeHtml(publicConfig.qqGroupLabel);
  if (safeGroupLabel && !/^(QQ|QQ群|群)/i.test(safeGroupLabel)) {
    safeGroupLabel = "QQ群：" + safeGroupLabel;
  }
  const safeGroupUrl = escapeHtml(publicConfig.qqGroupUrl);
  const safeOrigin = escapeHtml(origin);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codex Auth Helper 公益版</title>
  <style>
    :root {
      color-scheme: light;
      --page: #f6f7f4;
      --surface: #ffffff;
      --surface-soft: #f0f3ee;
      --ink: #151713;
      --muted: #69706a;
      --line: #d9ded6;
      --gold: #b08a3c;
      --gold-deep: #7a5b20;
      --green: #226b53;
      --red: #a33b3b;
      --shadow: 0 24px 70px rgba(21, 23, 19, 0.12);
      --radius: 8px;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      background:
        linear-gradient(135deg, rgba(255,255,255,0.78), rgba(240,243,238,0.76)),
        radial-gradient(circle at top left, rgba(176,138,60,0.18), transparent 34%),
        radial-gradient(circle at bottom right, rgba(34,107,83,0.14), transparent 30%);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
    }

    a { color: inherit; }

    .shell {
      width: min(1120px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 24px 0 40px;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 0 22px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .brand-mark {
      width: 38px;
      height: 38px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: linear-gradient(145deg, #fff, #e9ede7);
      display: grid;
      place-items: center;
      box-shadow: 0 10px 26px rgba(21, 23, 19, 0.08);
    }

    .brand h1 {
      margin: 0;
      font-size: 18px;
      letter-spacing: 0;
    }

    .brand p {
      margin: 2px 0 0;
      color: var(--muted);
      font-size: 13px;
    }

    .github-link {
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.68);
      border-radius: var(--radius);
      padding: 9px 12px;
      color: var(--muted);
      font-size: 13px;
      text-decoration: none;
    }

    .workspace {
      display: grid;
      grid-template-columns: minmax(0, 0.88fr) minmax(360px, 1.12fr);
      gap: 20px;
      align-items: stretch;
    }

    .intro,
    .tool-panel,
    .info-band {
      background: rgba(255,255,255,0.76);
      border: 1px solid rgba(217,222,214,0.9);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .intro {
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 560px;
      overflow: hidden;
      position: relative;
    }

    .intro::after {
      content: "";
      position: absolute;
      inset: auto -80px -110px auto;
      width: 260px;
      height: 260px;
      border: 1px solid rgba(176,138,60,0.32);
      transform: rotate(18deg);
    }

    .eyebrow {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      gap: 8px;
      color: var(--gold-deep);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .eyebrow::before {
      content: "";
      width: 28px;
      height: 1px;
      background: var(--gold);
    }

    .intro h2 {
      margin: 22px 0 14px;
      font-size: clamp(34px, 5vw, 58px);
      line-height: 1.02;
      letter-spacing: 0;
    }

    .intro-copy {
      margin: 0;
      max-width: 560px;
      color: var(--muted);
      font-size: 16px;
      line-height: 1.75;
    }

    .promise-grid {
      display: grid;
      gap: 10px;
      margin-top: 30px;
    }

    .promise {
      display: grid;
      grid-template-columns: 28px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      padding: 12px 0;
      border-top: 1px solid var(--line);
    }

    .promise strong {
      display: block;
      font-size: 14px;
    }

    .promise span {
      display: block;
      margin-top: 3px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.55;
    }

    .tool-panel {
      padding: 22px;
      min-height: 560px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .panel-head {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: flex-start;
      padding: 4px 4px 10px;
      border-bottom: 1px solid var(--line);
    }

    .panel-head h2 {
      margin: 0;
      font-size: 20px;
      letter-spacing: 0;
    }

    .panel-head p {
      margin: 5px 0 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .status-pill {
      flex: none;
      border: 1px solid rgba(176,138,60,0.38);
      color: var(--gold-deep);
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 700;
      background: rgba(176,138,60,0.08);
    }

    .verify-box {
      display: grid;
      gap: 12px;
      padding: 18px;
      background: var(--surface-soft);
      border: 1px solid var(--line);
      border-radius: var(--radius);
    }

    .field label {
      display: block;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 700;
    }

    .input-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
    }

    input {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: #fff;
      color: var(--ink);
      padding: 0 12px;
      font-size: 14px;
      outline: none;
    }

    input:focus {
      border-color: var(--gold);
      box-shadow: 0 0 0 3px rgba(176,138,60,0.14);
    }

    .btn,
    .bookmarklet {
      min-height: 42px;
      border: 1px solid var(--ink);
      border-radius: var(--radius);
      background: var(--ink);
      color: #fff;
      padding: 0 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    }

    .btn:hover,
    .bookmarklet:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 22px rgba(21, 23, 19, 0.14);
    }

    .btn.secondary {
      background: #fff;
      color: var(--ink);
      border-color: var(--line);
    }

    .btn:disabled,
    .bookmarklet.disabled {
      background: #e5e8e2;
      color: #8c928c;
      border-color: #d5dad2;
      box-shadow: none;
      cursor: not-allowed;
      pointer-events: none;
      transform: none;
    }

    .qq-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      color: var(--muted);
      font-size: 13px;
    }

    .qq-row[hidden] {
      display: none;
    }

    .qq-row a {
      color: var(--green);
      font-weight: 700;
      text-decoration: none;
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .guide {
      display: grid;
      gap: 10px;
      margin-top: auto;
    }

    .guide-step {
      display: grid;
      grid-template-columns: 28px minmax(0, 1fr);
      gap: 12px;
      align-items: start;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: rgba(255,255,255,0.72);
    }

    .num {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--ink);
      color: #fff;
      font-size: 12px;
      font-weight: 800;
    }

    .guide-step strong {
      display: block;
      font-size: 14px;
    }

    .open-notice {
      display: grid;
      gap: 4px;
      padding: 12px 14px;
      border: 1px solid var(--line-strong);
      border-radius: 8px;
      background: rgba(127, 211, 156, 0.08);
    }

    .open-notice strong {
      font-size: 14px;
      color: var(--ok);
    }

    .open-notice span {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.5;
    }

    .guide-step span {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.55;
    }

    .message {
      min-height: 20px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .message.ok { color: var(--green); font-weight: 700; }
    .message.error { color: var(--red); font-weight: 700; }

    .info-band {
      margin-top: 20px;
      padding: 18px 20px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      box-shadow: none;
    }

    .info-band strong {
      display: block;
      font-size: 13px;
    }

    .info-band span {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }

    @media (max-width: 860px) {
      .topbar { align-items: flex-start; }
      .workspace { grid-template-columns: 1fr; }
      .intro, .tool-panel { min-height: auto; }
      .intro h2 { font-size: 40px; }
      .info-band { grid-template-columns: 1fr; }
    }

    @media (max-width: 520px) {
      .shell { width: min(100vw - 20px, 1120px); padding-top: 14px; }
      .topbar { flex-direction: column; }
      .github-link { width: 100%; text-align: center; }
      .intro, .tool-panel { padding: 18px; }
      .intro h2 { font-size: 34px; }
      .input-row, .actions { grid-template-columns: 1fr; }
      .qq-row { align-items: flex-start; flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#151713" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3 4 7l8 4 8-4-8-4Z"></path>
            <path d="M4 12l8 4 8-4"></path>
            <path d="M4 17l8 4 8-4"></path>
          </svg>
        </div>
        <div>
          <h1>Codex Auth Helper 公益版</h1>
          <p>${openAccess ? "开源、本地生成、开放使用" : "开源、本地生成、社区验证码解锁"}</p>
        </div>
      </div>
      <a class="github-link" href="#open-source">开源准备就绪</a>
    </header>

    <section class="workspace" aria-label="Codex Auth Helper 公益工具">
      <aside class="intro">
        <div>
          <span class="eyebrow">Public Benefit</span>
          <h2>只把必要的步骤留下。</h2>
          <p class="intro-copy">${openAccess ? "本站已开放，无需验证码或暗号，打开即可使用书签。书签在 ChatGPT 页面内读取你自己的会话，并在浏览器本地生成 Codex 配置，不把登录凭证上传到本站服务器。" : "加入 QQ 群领取公益验证码，解锁书签生成。书签在 ChatGPT 页面内读取你自己的会话，并在浏览器本地生成 Codex 配置，不把登录凭证上传到本站服务器。"}</p>
        </div>
        <div class="promise-grid">
          <div class="promise">
            <span aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#226b53" stroke-width="2"><path d="m20 6-11 11-5-5"/></svg>
            </span>
            <div><strong>公益可用</strong><span>${openAccess ? "已开放免费使用，无需加入群组或输入验证码。" : "每日验证码由 QQ 群维护，当前版本免费使用。"}</span></div>
          </div>
          <div class="promise">
            <span aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#226b53" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V8a5 5 0 0 1 10 0v3"/></svg>
            </span>
            <div><strong>本地处理</strong><span>公开版默认关闭服务器端凭证处理，减少误传和托管风险。</span></div>
          </div>
          <div class="promise">
            <span aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#226b53" stroke-width="2"><path d="M12 3v18"/><path d="M5 8h14"/><path d="M7 16h10"/></svg>
            </span>
            <div><strong>适合公益分发</strong><span>页面和工具链保持清爽，核心密钥仍由你私下保管。</span></div>
          </div>
        </div>
      </aside>

      <main class="tool-panel">
        <div class="panel-head">
          <div>
            <h2>生成本地书签</h2>
            <p>${openAccess ? "无需验证码或暗号，直接拖动或复制书签到浏览器书签栏即可。" : "先验证公益码，再复制或拖动书签到浏览器书签栏。"}</p>
          </div>
          <span class="status-pill" id="verify-state">${openAccess ? "开放使用" : "待验证"}</span>
        </div>

        <section class="verify-box" aria-label="公益验证码">
${openAccess ? `          <div class="open-notice">
            <strong>本站已开放使用</strong>
            <span>无需验证码或暗号，下方书签可直接拖动或复制使用。</span>
          </div>` : `          <div class="field">
            <label for="verify-code">公益验证码</label>
            <div class="input-row">
              <input id="verify-code" type="text" autocomplete="off" spellcheck="false" placeholder="从 QQ 群公告复制验证码">
              <button class="btn" id="verify-button" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m20 6-11 11-5-5"/></svg>
                验证
              </button>
            </div>
          </div>`}
          <div class="qq-row">
            <span>${safeGroupLabel}</span>
            <a href="${safeGroupUrl}" target="_blank" rel="noopener noreferrer">${openAccess ? "加入 QQ群 获取帮助" : "加入 QQ群 获取暗号"}</a>
          </div>
          <div class="message" id="message">${openAccess ? "本站已开放，无需暗号；请不要把生成的 auth.json 发给别人。" : "验证码只用于社区门槛，不是安全边界；请不要把生成的 auth.json 发给别人。"}</div>
        </section>

        <div class="actions">
          <a class="bookmarklet${openAccess ? "" : " disabled"}" id="bookmarklet-button" href="${openAccess ? escapeHtml(openAccessBookmarklet) : "#"}"${openAccess ? "" : ` aria-disabled="true"`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 21 12 17 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"/></svg>
            拖到书签栏
          </a>
          <button class="btn secondary" id="copy-button" type="button"${openAccess ? "" : " disabled"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            复制书签代码
          </button>
        </div>

        <section class="guide" aria-label="使用步骤">
          <div class="guide-step">
            <span class="num">1</span>
            <div><strong>${openAccess ? "打开本站获取书签" : "加入群并复制验证码"}</strong><span>${openAccess ? "无需加入群组，打开页面即可直接拖动或复制书签；过期后刷新页面重新获取。" : "验证码按北京时间每日变化；生产部署请用 Worker 环境变量 <code>CODEX_DAILY_SECRET</code> 配置私密种子。"}</span></div>
          </div>
          <div class="guide-step">
            <span class="num">2</span>
            <div><strong>保存书签</strong><span>验证通过后，把按钮拖到书签栏，或复制代码后手动新增书签；过期后需要重新验证生成。</span></div>
          </div>
          <div class="guide-step">
            <span class="num">3</span>
            <div><strong>在 ChatGPT 页面运行</strong><span>打开并登录 <code>https://chatgpt.com</code>，点击书签，在弹出的面板复制或下载配置。</span></div>
          </div>
        </section>
      </main>
    </section>

    <section class="info-band" id="open-source">
      <div><strong>私密种子不公开</strong><span>${openAccess ? "源码可以给人审阅；开放模式下不再需要每日验证码。" : "源码可以给人审阅，真正的每日码由你掌握的 secret 决定。"}</span></div>
      <div><strong>无收费流程</strong><span>${openAccess ? "公益站只负责分发书签，不设门槛，也不触碰用户隐私凭证。" : "公益站只校验验证码和分发书签，不触碰用户隐私凭证。"}</span></div>
      <div><strong>本地优先</strong><span>${openAccess ? "书签在你的浏览器内运行，公益站不默认接收用户凭证。" : "公益站只校验验证码和分发书签，不默认接收用户凭证。"}</span></div>
    </section>
  </div>

  <script>
    const PAGE_ORIGIN = "${safeOrigin}";
    const OPEN_ACCESS = ${openAccess ? "true" : "false"};
    const verifyInput = document.getElementById("verify-code");
    const verifyButton = document.getElementById("verify-button");
    const copyButton = document.getElementById("copy-button");
    const bookmarkletButton = document.getElementById("bookmarklet-button");
    const verifyState = document.getElementById("verify-state");
    const message = document.getElementById("message");
    let compiledBookmarklet = ${JSON.stringify(openAccessBookmarklet)};

    if (OPEN_ACCESS) {
      unlockBookmarklet(compiledBookmarklet);
    }

    if (verifyButton) {
      verifyButton.addEventListener("click", verifyCode);
    }
    if (verifyInput) {
      verifyInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") verifyCode();
      });
    }

    copyButton.addEventListener("click", async () => {
      if (!compiledBookmarklet) return;
      try {
        await navigator.clipboard.writeText(compiledBookmarklet);
        setMessage("书签代码已复制。请手动新增书签，并把代码粘贴到 URL。", "ok");
      } catch (error) {
        setMessage("复制失败，请改用拖动书签按钮。", "error");
      }
    });

    async function verifyCode() {
      const verifyCode = verifyInput.value.trim();
      if (!verifyCode) {
        setMessage("请先填写 QQ 群获取的验证码。", "error");
        return;
      }

      verifyButton.disabled = true;
      setMessage("正在验证...", "");

      try {
        const response = await fetch("/api/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verify_code: verifyCode })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "验证码不正确");
        }
        if (!data.bookmarklet) {
          throw new Error("书签生成失败，请刷新后重试。");
        }
        unlockBookmarklet(data.bookmarklet);
      } catch (error) {
        setMessage(error.message || "验证失败，请稍后再试。", "error");
      } finally {
        verifyButton.disabled = false;
      }
    }

    function unlockBookmarklet(bookmarklet) {
      compiledBookmarklet = bookmarklet;
      bookmarkletButton.href = compiledBookmarklet;
      bookmarkletButton.classList.remove("disabled");
      bookmarkletButton.removeAttribute("aria-disabled");
      copyButton.disabled = false;
      verifyState.textContent = "已解锁";
      setMessage(OPEN_ACCESS ? "本站已开放，可直接拖动书签或复制书签代码。" : "验证通过。现在可以拖动书签或复制书签代码。", "ok");
    }

    function setMessage(text, type) {
      message.textContent = text;
      message.className = type ? "message " + type : "message";
    }
  </script>
</body>
</html>`;
}

function getHtmlPage(origin) {
  const publicConfig = getPublicConfig();
  let safeGroupLabel = escapeHtml(publicConfig.qqGroupLabel);
  if (safeGroupLabel && !/^(QQ|QQ群|群)/i.test(safeGroupLabel)) {
    safeGroupLabel = "QQ群：" + safeGroupLabel;
  }
  const safeGroupUrl = escapeHtml(publicConfig.qqGroupUrl);
  const safeOrigin = escapeHtml(origin);
  const openAccess = isOpenAccessEnabled();
  const openAccessBookmarklet = openAccess ? getBookmarkletHref() : "";
  const groupUrlIsPlaceholder =
    !safeGroupUrl || /REPLACE_WITH_YOUR/i.test(safeGroupUrl);
  const showQqRow = !openAccess || !groupUrlIsPlaceholder;

  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codex Auth Helper</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b0d12;
      --bg-soft: #11151d;
      --surface: rgba(17, 21, 29, 0.92);
      --surface-strong: #151a24;
      --surface-muted: #1b2230;
      --text: #f4f7fb;
      --muted: #9ca8b7;
      --quiet: #748093;
      --line: rgba(255, 255, 255, 0.12);
      --line-strong: rgba(255, 255, 255, 0.18);
      --accent: #8ea1ff;
      --accent-strong: #5f75ff;
      --ok: #55d39c;
      --danger: #ff7d7d;
      --button-text: #ffffff;
      --shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
      --radius: 8px;
    }

    html[data-theme="light"] {
      color-scheme: light;
      --bg: #f5f6f8;
      --bg-soft: #ffffff;
      --surface: rgba(255, 255, 255, 0.92);
      --surface-strong: #ffffff;
      --surface-muted: #eef1f6;
      --text: #151923;
      --muted: #5f6877;
      --quiet: #7a8390;
      --line: rgba(21, 25, 35, 0.12);
      --line-strong: rgba(21, 25, 35, 0.2);
      --accent: #5168f4;
      --accent-strong: #3047d8;
      --ok: #227a58;
      --danger: #b33a3a;
      --button-text: #ffffff;
      --shadow: 0 24px 70px rgba(16, 24, 40, 0.12);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--bg-soft) 34%, transparent), transparent 42%),
        linear-gradient(135deg, var(--bg), color-mix(in srgb, var(--bg) 86%, var(--accent) 14%));
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
    }

    a { color: inherit; }

    .shell {
      width: min(1240px, calc(100vw - 28px));
      margin: 0 auto;
      padding: 22px 0 34px;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .brand-mark {
      width: 44px;
      height: 44px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
      overflow: hidden;
      padding: 0;
      margin: 0;
      cursor: default;
      outline: none;
      -webkit-appearance: none;
      appearance: none;
      box-sizing: border-box;
    }

    .brand-mark svg {
      width: 22px;
      height: 22px;
      color: var(--accent);
      display: block;
      flex-shrink: 0;
    }

    .brand-title {
      min-width: 0;
    }

    .brand h1 {
      margin: 0;
      font-size: 18px;
      line-height: 1.2;
      letter-spacing: 0;
    }

    .brand p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.35;
    }

    .theme-button {
      min-height: 40px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface);
      color: var(--text);
      padding: 0 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
    }

    .theme-button svg { flex: none; }
    .theme-sun { display: none; }
    html[data-theme="dark"] .theme-sun { display: block; }
    html[data-theme="dark"] .theme-moon { display: none; }

    .layout {
      display: grid;
      grid-template-columns: minmax(300px, 0.82fr) minmax(560px, 1.18fr);
      gap: 18px;
      align-items: start;
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface);
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }

    .intro {
      padding: 22px;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 28px;
    }

    .eyebrow {
      margin: 0 0 14px;
      color: var(--accent);
      font-size: 12px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .intro h2 {
      margin: 0;
      max-width: 13em;
      font-size: clamp(24px, 2.4vw, 32px);
      line-height: 1.12;
      letter-spacing: 0;
    }

    .intro-copy {
      margin: 18px 0 0;
      color: var(--muted);
      font-size: 15px;
      line-height: 1.75;
    }

    .signal-list {
      display: grid;
      gap: 1px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      overflow: hidden;
      background: var(--line);
    }

    .signal {
      display: grid;
      grid-template-columns: 24px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      padding: 14px;
      background: var(--surface-strong);
    }

    .signal svg {
      margin-top: 1px;
      color: var(--accent);
    }

    .signal strong {
      display: block;
      font-size: 14px;
      line-height: 1.35;
    }

    .signal span {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.55;
    }

    .workbench {
      padding: 22px;
      min-height: 0;
      display: grid;
      gap: 20px;
    }

    .panel-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--line);
    }

    .panel-head h2 {
      margin: 0;
      font-size: 22px;
      line-height: 1.25;
      letter-spacing: 0;
    }

    .panel-head p {
      margin: 7px 0 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .status-pill {
      flex: none;
      min-height: 32px;
      border: 1px solid var(--line-strong);
      border-radius: 999px;
      padding: 6px 11px;
      color: var(--muted);
      background: var(--surface-muted);
      font-size: 12px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
    }

    .field label {
      display: block;
      margin-bottom: 8px;
      color: var(--text);
      font-size: 13px;
      font-weight: 800;
    }

    .input-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
    }

    input {
      width: 100%;
      min-height: 44px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface-strong);
      color: var(--text);
      padding: 0 13px;
      font-size: 14px;
      outline: none;
    }

    input::placeholder { color: var(--quiet); }

    input:focus {
      border-color: color-mix(in srgb, var(--accent) 76%, var(--line));
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
    }

    .btn,
    .bookmarklet {
      min-height: 44px;
      border: 1px solid var(--accent-strong);
      border-radius: var(--radius);
      background: var(--accent-strong);
      color: var(--button-text);
      padding: 0 15px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
      white-space: nowrap;
    }

    .btn:hover,
    .bookmarklet:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 28px color-mix(in srgb, var(--accent-strong) 26%, transparent);
    }

    .btn.secondary {
      background: transparent;
      color: var(--text);
      border-color: var(--line-strong);
    }

    .btn:disabled,
    .bookmarklet.disabled {
      background: var(--surface-muted);
      color: var(--quiet);
      border-color: var(--line);
      box-shadow: none;
      cursor: not-allowed;
      pointer-events: none;
      transform: none;
    }

    .qq-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 12px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.45;
    }

    .qq-row[hidden] {
      display: none;
    }

    .qq-row a {
      color: var(--accent);
      font-weight: 800;
      text-decoration: none;
    }

    .message {
      min-height: 22px;
      margin-top: 12px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.55;
    }

    .message.ok { color: var(--ok); font-weight: 800; }
    .message.error { color: var(--danger); font-weight: 800; }

    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .steps {
      display: grid;
      gap: 0;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      overflow: hidden;
    }

    .step {
      display: grid;
      grid-template-columns: 32px minmax(0, 1fr);
      gap: 12px;
      padding: 15px;
      background: var(--surface-strong);
      border-bottom: 1px solid var(--line);
    }

    .step:last-child { border-bottom: 0; }

    .num {
      display: inline-block;
      width: 28px;
      height: 28px;
      line-height: 26px;
      text-align: center;
      border-radius: 50%;
      background: var(--surface-muted);
      color: var(--accent);
      border: 1px solid var(--line);
      font-size: 12px;
      font-weight: 900;
      box-sizing: border-box;
    }

    .step strong {
      display: block;
      font-size: 14px;
      line-height: 1.35;
    }

    .open-notice {
      display: grid;
      gap: 4px;
      padding: 12px 14px;
      border: 1px solid var(--line-strong);
      border-radius: 8px;
      background: rgba(127, 211, 156, 0.08);
    }

    .open-notice strong {
      font-size: 14px;
      color: var(--ok);
    }

    .open-notice span {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.5;
    }

    .step span {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.55;
    }

    code {
      color: var(--text);
      background: var(--surface-muted);
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 1px 5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.92em;
    }

    .footer-note {
      margin-top: 16px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--surface) 72%, transparent);
      padding: 14px 16px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.6;
    }

    .dev-dialog {
      width: min(420px, calc(100vw - 32px));
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface-strong);
      color: var(--text);
      padding: 0;
      box-shadow: var(--shadow);
    }

    .dev-dialog::backdrop {
      background: rgba(0, 0, 0, 0.58);
      backdrop-filter: blur(6px);
    }

    .dev-card {
      padding: 18px;
      display: grid;
      gap: 14px;
    }

    .dev-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--line);
    }

    .dev-head strong { font-size: 15px; }

    .icon-button {
      width: 32px;
      height: 32px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--surface-muted);
      color: var(--text);
      cursor: pointer;
    }

    .dev-field {
      display: grid;
      gap: 7px;
    }

    .dev-field span {
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
    }

    .dev-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 110px;
      gap: 10px;
    }

    .dev-message {
      min-height: 20px;
      margin: 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }

    .dev-message.ok { color: var(--ok); font-weight: 800; }
    .dev-message.error { color: var(--danger); font-weight: 800; }

    @media (max-width: 880px) {
      .layout { grid-template-columns: 1fr; }
      .intro { min-height: auto; }
      .workbench { min-height: auto; }
      .intro h2 { max-width: 13em; font-size: 32px; }
    }

    @media (max-width: 560px) {
      .shell { width: min(100vw - 18px, 1240px); padding-top: 14px; }
      .topbar { align-items: flex-start; }
      .brand { align-items: flex-start; }
      .theme-button { min-width: 78px; }
      .intro, .workbench { padding: 18px; }
      .intro h2 { font-size: 34px; }
      .panel-head { flex-direction: column; }
      .input-row, .actions { grid-template-columns: 1fr; }
      .dev-grid { grid-template-columns: 1fr; }
      .qq-row { align-items: flex-start; flex-direction: column; }
      .btn, .bookmarklet { width: 100%; white-space: normal; text-align: center; }
    }
  </style>
</head>
<body data-origin="${safeOrigin}">
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <button class="brand-mark" id="dev-trigger" type="button" aria-label="Codex Auth Helper">
          <svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg">
            <path clip-rule="evenodd" d="M8.086.457a6.105 6.105 0 013.046-.415c1.333.153 2.521.72 3.564 1.7a.117.117 0 00.107.029c1.408-.346 2.762-.224 4.061.366l.063.03.154.076c1.357.703 2.33 1.77 2.918 3.198.278.679.418 1.388.421 2.126a5.655 5.655 0 01-.18 1.631.167.167 0 00.04.155 5.982 5.982 0 011.578 2.891c.385 1.901-.01 3.615-1.183 5.14l-.182.22a6.063 6.063 0 01-2.934 1.851.162.162 0 00-.108.102c-.255.736-.511 1.364-.987 1.992-1.199 1.582-2.962 2.462-4.948 2.451-1.583-.008-2.986-.587-4.21-1.736a.145.145 0 00-.14-.032c-.518.167-1.04.191-1.604.185a5.924 5.924 0 01-2.595-.622 6.058 6.058 0 01-2.146-1.781c-.203-.269-.404-.522-.551-.821a7.74 7.74 0 01-.495-1.283 6.11 6.11 0 01-.017-3.064.166.166 0 00.008-.074.115.115 0 00-.037-.064 5.958 5.958 0 01-1.38-2.202 5.196 5.196 0 01-.333-1.589 6.915 6.915 0 01.188-2.132c.45-1.484 1.309-2.648 2.577-3.493.282-.188.55-.334.802-.438.286-.12.573-.22.861-.304a.129.129 0 00.087-.087A6.016 6.016 0 015.635 2.31C6.315 1.464 7.132.846 8.086.457zm-.804 7.85a.848.848 0 00-1.473.842l1.694 2.965-1.688 2.848a.849.849 0 001.46.864l1.94-3.272a.849.849 0 00.007-.854l-1.94-3.393zm5.446 6.24a.849.849 0 000 1.695h4.848a.849.849 0 000-1.696h-4.848z"></path>
          </svg>
        </button>
        <div class="brand-title">
          <h1>Codex Auth Helper</h1>
          <p>${openAccess ? "开放使用 · 本地书签 · Codex 配置" : "群暗号 · 本地书签 · Codex 配置"}</p>
        </div>
      </div>
      <button class="theme-button" id="theme-button" type="button" aria-label="切换明暗模式">
        <svg class="theme-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        <svg class="theme-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.99 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 20.99 12.79Z"/></svg>
        <span id="theme-label">浅色</span>
      </button>
    </header>

    <section class="layout" aria-label="Codex Auth Helper">
      <aside class="panel intro">
        <div>
          <p class="eyebrow">Bookmark Access</p>
          <h2>验证、保存、运行</h2>
          <p class="intro-copy">${openAccess ? "本站已开放，无需暗号，打开即可生成浏览器书签。到已登录的 ChatGPT 页面点击书签，即可生成 Codex 可用配置。" : "输入群里的当天暗号，通过后生成浏览器书签。到已登录的 ChatGPT 页面点击书签，即可生成 Codex 可用配置。"}</p>
        </div>
        <div class="signal-list" aria-label="处理方式">
          <div class="signal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m20 6-11 11-5-5"/></svg>
            <div><strong>${openAccess ? "开放使用" : "群暗号"}</strong><span>${openAccess ? "无需暗号，打开页面即可直接生成书签。" : "由你在隐藏面板里设置，可按小时自动过期。"}</span></div>
          </div>
          <div class="signal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V8a5 5 0 0 1 10 0v3"/></svg>
            <div><strong>本地处理</strong><span>书签在 ChatGPT 页面内运行，配置文件在浏览器里生成。</span></div>
          </div>
          <div class="signal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"/><path d="M5 8h14"/><path d="M7 16h10"/></svg>
            <div><strong>错误冷却</strong><span>管理暗号输错多次会自动延长等待时间。</span></div>
          </div>
        </div>
      </aside>

      <main class="panel workbench">
        <div class="panel-head">
          <div>
            <h2>生成本地书签</h2>
            <p>${openAccess ? "无需暗号，直接把书签拖到书签栏，或复制代码手动新增。" : "先验证当天码，再把书签拖到书签栏，或复制代码手动新增。"}</p>
          </div>
          <span class="status-pill" id="verify-state">${openAccess ? "开放使用" : "未解锁"}</span>
        </div>

        <section aria-label="群暗号">
${openAccess ? "          <div class=\"open-notice\">\n            <strong>本站已开放使用</strong>\n            <span>无需暗号，下方书签可直接拖动或复制使用。</span>\n          </div>" : "          <div class=\"field\">\n            <label for=\"verify-code\">群暗号</label>\n            <div class=\"input-row\">\n              <input id=\"verify-code\" type=\"text\" autocomplete=\"off\" spellcheck=\"false\" placeholder=\"从 QQ 群公告复制\">\n              <button class=\"btn\" id=\"verify-button\" type=\"button\">\n                <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"><path d=\"m20 6-11 11-5-5\"/></svg>\n                验证\n              </button>\n            </div>\n          </div>"}
          <div class="qq-row" id="qq-row"${showQqRow ? "" : " hidden"}>
            <span id="qq-group-label-text">${safeGroupLabel}</span>
            <a id="qq-group-link" href="${safeGroupUrl}" target="_blank" rel="noopener noreferrer">${openAccess ? "加入 QQ群 获取帮助" : "加入 QQ群 获取暗号"}</a>
          </div>
          <div class="message" id="message">${openAccess ? "本站已开放，无需暗号；请勿把生成的 auth.json 发给他人。" : "通过后才会生成书签。请勿把生成的 auth.json 发给他人。"}</div>
        </section>

        <div class="actions">
          <a class="bookmarklet${openAccess ? "" : " disabled"}" id="bookmarklet-button" href="${openAccess ? escapeHtml(openAccessBookmarklet) : "#"}"${openAccess ? "" : " aria-disabled=\"true\""}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 21 12 17 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"/></svg>
            拖到书签栏
          </a>
          <button class="btn secondary" id="copy-button" type="button"${openAccess ? "" : " disabled"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            复制书签代码
          </button>
        </div>

        <section class="steps" aria-label="操作步骤">
          <div class="step">
            <span class="num">1</span>
            <div><strong>${openAccess ? "打开本站获取书签" : "复制群暗号"}</strong><span>${openAccess ? "无需加入群组，打开页面即可直接拖动或复制书签；过期后刷新页面重新获取。" : "打开群公告，复制当前发布的暗号。"}</span></div>
          </div>
          <div class="step">
            <span class="num">2</span>
            <div><strong>保存书签</strong><span>验证通过后拖动按钮到书签栏，或复制代码手动新增书签；过期后需要重新验证生成。</span></div>
          </div>
          <div class="step">
            <span class="num">3</span>
            <div><strong>在 ChatGPT 页面运行</strong><span>登录 <code>https://chatgpt.com</code> 后点击书签，在弹窗内复制或下载配置。</span></div>
          </div>
        </section>
      </main>
    </section>

    <div class="footer-note">${openAccess ? "这个页面已开放，只负责分发书签；实际配置由书签在你的浏览器里生成。" : "这个页面只负责校验暗号和分发书签；实际配置由书签在你的浏览器里生成。"}</div>

    <dialog class="dev-dialog" id="dev-dialog">
      <form class="dev-card" method="dialog">
        <div class="dev-head">
          <strong>暗号设置</strong>
          <button class="icon-button" value="cancel" aria-label="关闭" type="submit">×</button>
        </div>
        <label class="dev-field">
          <span>开发者暗号</span>
          <input id="admin-code" type="password" autocomplete="current-password" inputmode="numeric" placeholder="输入暗号">
        </label>
        <div class="dev-grid">
          <label class="dev-field">
            <span style="display: flex; justify-content: space-between; align-items: center;">
              <span>QQ 群暗号</span>
              <button type="button" id="generate-random-code" style="border: 0; background: transparent; color: var(--accent); cursor: pointer; font-size: 11px; padding: 0; font-weight: 800; outline: none;">随机生成</button>
            </span>
            <input id="group-code" type="text" autocomplete="off" spellcheck="false" placeholder="例如 CXA-0625 (选填)">
          </label>
          <label class="dev-field">
            <span>有效小时</span>
            <input id="ttl-hours" type="number" min="1" max="168" step="1" value="24">
          </label>
        </div>
        <label class="dev-field">
          <span>QQ群号</span>
          <input id="group-label-input" type="text" autocomplete="off" spellcheck="false" placeholder="例如 QQ群：123456">
        </label>
        <label class="dev-field">
          <span>QQ群链接</span>
          <input id="group-url-input" type="text" autocomplete="off" spellcheck="false" placeholder="https://qm.qq.com/...">
        </label>
        <button class="btn" id="save-group-code" type="button">保存</button>
        <p class="dev-message" id="dev-message"></p>
      </form>
    </dialog>
  </div>

  <script>
    const verifyInput = document.getElementById("verify-code");
    const verifyButton = document.getElementById("verify-button");
    const copyButton = document.getElementById("copy-button");
    const bookmarkletButton = document.getElementById("bookmarklet-button");
    const verifyState = document.getElementById("verify-state");
    const message = document.getElementById("message");
    const themeButton = document.getElementById("theme-button");
    const themeLabel = document.getElementById("theme-label");
    const devTrigger = document.getElementById("dev-trigger");
    const devDialog = document.getElementById("dev-dialog");
    const adminCodeInput = document.getElementById("admin-code");
    const groupCodeInput = document.getElementById("group-code");
    const ttlHoursInput = document.getElementById("ttl-hours");
    const groupLabelInput = document.getElementById("group-label-input");
    const groupUrlInput = document.getElementById("group-url-input");
    const saveGroupCodeButton = document.getElementById("save-group-code");
    const devMessage = document.getElementById("dev-message");
    let compiledBookmarklet = ${JSON.stringify(openAccessBookmarklet)};
    const OPEN_ACCESS = ${openAccess ? "true" : "false"};
    let devClicks = [];
    let devCooldownTimer = null;

    applyInitialTheme();
    themeButton.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      applyTheme(current === "dark" ? "light" : "dark", true);
    });

    if (OPEN_ACCESS) {
      unlockBookmarklet(compiledBookmarklet);
    }

    if (verifyButton) {
      verifyButton.addEventListener("click", verifyCode);
    }
    if (verifyInput) {
      verifyInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") verifyCode();
      });
    }

    devTrigger.addEventListener("click", () => {
      const now = Date.now();
      devClicks = devClicks.filter((time) => now - time < 1800);
      devClicks.push(now);
      if (devClicks.length >= 5) {
        devClicks = [];
        openDevDialog();
      }
    });

    saveGroupCodeButton.addEventListener("click", saveGroupCode);
    
    const generateRandomCodeButton = document.getElementById("generate-random-code");
    if (generateRandomCodeButton) {
      generateRandomCodeButton.addEventListener("click", () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "CXA-";
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        groupCodeInput.value = result;
      });
    }

    adminCodeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") saveGroupCode();
    });
    groupCodeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") saveGroupCode();
    });

    copyButton.addEventListener("click", async () => {
      if (!compiledBookmarklet) return;
      try {
        await navigator.clipboard.writeText(compiledBookmarklet);
        setMessage("书签代码已复制。新增书签时把它粘贴到 URL。", "ok");
      } catch (error) {
        setMessage("复制失败，可以改用拖动书签按钮。", "error");
      }
    });

    function applyInitialTheme() {
      let savedTheme = "";
      try {
        savedTheme = localStorage.getItem("codex-auth-theme") || "";
      } catch (error) {}
      applyTheme(savedTheme === "light" ? "light" : "dark", false);
    }

    function applyTheme(theme, persist) {
      document.documentElement.dataset.theme = theme;
      themeLabel.textContent = theme === "dark" ? "浅色" : "深色";
      if (persist) {
        try {
          localStorage.setItem("codex-auth-theme", theme);
        } catch (error) {}
      }
    }

    async function verifyCode() {
      const verifyCodeValue = verifyInput.value.trim();
      if (!verifyCodeValue) {
        setMessage("请先填写 QQ 群获取的暗号。", "error");
        return;
      }

      verifyButton.disabled = true;
      setMessage("正在验证...", "");

      try {
        const response = await fetch("/api/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verify_code: verifyCodeValue })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "验证码不正确");
        }
        if (!data.bookmarklet) {
          throw new Error("书签生成失败，请刷新后重试。");
        }
        unlockBookmarklet(data.bookmarklet);
      } catch (error) {
        setMessage(error.message || "验证失败，请稍后再试。", "error");
      } finally {
        verifyButton.disabled = false;
      }
    }

    function unlockBookmarklet(bookmarklet) {
      compiledBookmarklet = bookmarklet;
      bookmarkletButton.href = compiledBookmarklet;
      bookmarkletButton.classList.remove("disabled");
      bookmarkletButton.removeAttribute("aria-disabled");
      copyButton.disabled = false;
      verifyState.textContent = "已解锁";
      verifyState.style.color = "var(--ok)";
      setMessage(OPEN_ACCESS ? "本站已开放，可直接拖动书签或复制书签代码。" : "验证通过。现在可以保存书签。", "ok");
    }

    function setMessage(text, type) {
      message.textContent = text;
      message.className = type ? "message " + type : "message";
    }

    let currentConfig = { qqGroupLabel: "", qqGroupUrl: "" };

    function fetchConfig() {
      fetch("/api/public-config")
        .then((res) => res.json())
        .then((data) => {
          currentConfig = data;
          const qqRowSpan = document.getElementById("qq-group-label-text");
          if (qqRowSpan && data.qqGroupLabel) {
            let label = data.qqGroupLabel;
            if (!/^(QQ|QQ群|群)/i.test(label)) {
              label = "QQ群：" + label;
            }
            qqRowSpan.textContent = label;
          }
          const qqRowLink = document.getElementById("qq-group-link");
          if (qqRowLink && data.qqGroupUrl) qqRowLink.href = data.qqGroupUrl;

          const qqRow = document.getElementById("qq-row");
          if (qqRow && OPEN_ACCESS) {
            const urlIsReal = !!data.qqGroupUrl && !/REPLACE_WITH_YOUR/i.test(data.qqGroupUrl);
            if (urlIsReal && qqRow.hasAttribute("hidden")) qqRow.removeAttribute("hidden");
            if (!urlIsReal && !qqRow.hasAttribute("hidden")) qqRow.setAttribute("hidden", "");
          }
          
          if (groupLabelInput && data.qqGroupLabel) groupLabelInput.value = data.qqGroupLabel;
          if (groupUrlInput && data.qqGroupUrl) groupUrlInput.value = data.qqGroupUrl;
        })
        .catch((err) => console.error("获取动态配置失败:", err));
    }
    
    // 初始化读取
    fetchConfig();

    function openDevDialog() {
      setDevMessage("", "");
      if (groupLabelInput) groupLabelInput.value = currentConfig.qqGroupLabel || "";
      if (groupUrlInput) groupUrlInput.value = currentConfig.qqGroupUrl || "";

      if (devDialog.showModal) {
        devDialog.showModal();
      } else {
        devDialog.setAttribute("open", "open");
      }
      setTimeout(() => adminCodeInput.focus(), 30);
    }

    async function saveGroupCode() {
      const adminCode = adminCodeInput.value.trim();
      const groupCode = groupCodeInput.value.trim();
      const ttlHours = Number(ttlHoursInput.value || 24);
      const groupLabel = groupLabelInput.value.trim();
      const groupUrl = groupUrlInput.value.trim();

      if (!adminCode) {
        setDevMessage("请填写开发者暗号。", "error");
        return;
      }

      saveGroupCodeButton.disabled = true;
      setDevMessage("正在保存...", "");

      try {
        const response = await fetch("/api/admin/group-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admin_code: adminCode,
            group_code: groupCode,
            ttl_hours: ttlHours,
            qq_group_label: groupLabel,
            qq_group_url: groupUrl,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          const retryAfter = Number(data.retryAfterSeconds || 0);
          if (retryAfter > 0) startDevCooldown(retryAfter);
          throw new Error(data.message || "保存失败");
        }
        setDevMessage("已保存，群配置已同步更新。", "ok");
        fetchConfig();
      } catch (error) {
        setDevMessage(error.message || "保存失败", "error");
      } finally {
        if (!devCooldownTimer) saveGroupCodeButton.disabled = false;
      }
    }

    function startDevCooldown(seconds) {
      let remaining = Math.max(1, Math.ceil(seconds));
      clearInterval(devCooldownTimer);
      saveGroupCodeButton.disabled = true;
      setDevMessage("请等待 " + remaining + " 秒后再试。", "error");
      devCooldownTimer = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(devCooldownTimer);
          devCooldownTimer = null;
          saveGroupCodeButton.disabled = false;
          setDevMessage("可以重新尝试。", "");
          return;
        }
        setDevMessage("请等待 " + remaining + " 秒后再试。", "error");
      }, 1000);
    }

    function setDevMessage(text, type) {
      devMessage.textContent = text;
      devMessage.className = type ? "dev-message " + type : "dev-message";
    }

    function formatDateTime(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value || "";
      return date.toLocaleString("zh-CN", { hour12: false });
    }
  </script>
</body>
</html>`;
}

if (typeof module !== "undefined") {
  module.exports = {
    DAILY_CODE_SECRET_PLACEHOLDER,
    escapeHtml,
    generateDailyVerifyCode,
    generateCodexAuthJson,
    getAcceptedVerifyCodes,
    getBookmarkletHref,
    getDateStamp,
    getHtmlPage,
    handleRequest,
    isValidVerifyCode,
    normalizeVerifyCode,
  };
}
