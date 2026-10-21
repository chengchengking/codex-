const assert = require("assert/strict");
const crypto = require("crypto");

process.env.CODEX_DAILY_SECRET = "test-secret-for-daily-code-generation-2026";
process.env.CODEX_ADMIN_CODE = "test-admin-code-2026";
process.env.CODEX_CODE_PREFIX = "CXA";
process.env.CODEX_CODE_TZ_OFFSET_MINUTES = "480";

const worker = require("../worker.js");

function expectedDailyCode(dateStamp) {
  const digest = crypto
    .createHmac("sha256", process.env.CODEX_DAILY_SECRET)
    .update(`codex-auth-helper:v2:CXA:${dateStamp}`)
    .digest("hex")
    .toUpperCase();
  return `CXA-${dateStamp}-${digest.slice(0, 5)}-${digest.slice(5, 10)}`;
}

(async () => {
  const baseDate = new Date("2026-06-25T08:00:00+08:00");
  const todayCode = await worker.generateDailyVerifyCode(baseDate);

  assert.equal(worker.getDateStamp(baseDate), "20260625");
  assert.equal(todayCode, expectedDailyCode("20260625"));
  assert.equal(await worker.isValidVerifyCode(todayCode, baseDate), true);
  assert.equal(await worker.isValidVerifyCode(todayCode.toLowerCase(), baseDate), true);
  assert.equal(await worker.isValidVerifyCode("CXA-20260625-00000-00000", baseDate), false);
  assert.equal(worker.getHtmlPage("https://example.test").includes("function bookmarkletRuntime"), false);

  const originalDailySecret = process.env.CODEX_DAILY_SECRET;
  delete process.env.CODEX_DAILY_SECRET;
  try {
    await assert.rejects(() => worker.generateDailyVerifyCode(baseDate), /CODEX_DAILY_SECRET/);
    assert.equal(await worker.isValidVerifyCode(todayCode, baseDate), false);

    const configResponse = await worker.handleRequest(new Request("https://example.test/api/public-config"));
    assert.equal(configResponse.status, 200);
    const configPayload = await configResponse.json();
    assert.equal(configPayload.verifyCodeConfigured, false);
  } finally {
    process.env.CODEX_DAILY_SECRET = originalDailySecret;
  }

  const verifyResponse = await worker.handleRequest(new Request("https://example.test/api/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verify_code: todayCode }),
  }), { currentDate: baseDate });
  assert.equal(verifyResponse.status, 200);
  const verifyPayload = await verifyResponse.json();
  assert.equal(verifyPayload.success, true);
  assert.match(verifyPayload.bookmarklet, /^javascript:/);
  const bookmarkletSource = decodeURIComponent(verifyPayload.bookmarklet.slice("javascript:".length));
  assert.match(bookmarkletSource, /expiresAt/);
  assert.match(bookmarkletSource, /codex-public-helper-bookmarklet-used/);

  const originalAdminCode = process.env.CODEX_ADMIN_CODE;
  delete process.env.CODEX_ADMIN_CODE;
  try {
    const missingAdminResponse = await worker.handleRequest(new Request("https://example.test/api/admin/group-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "cf-connecting-ip": "203.0.113.19",
      },
      body: JSON.stringify({ admin_code: "anything", group_code: "team-code", ttl_hours: 1 }),
    }));
    assert.equal(missingAdminResponse.status, 503);
  } finally {
    process.env.CODEX_ADMIN_CODE = originalAdminCode;
  }

  const adminResponse = await worker.handleRequest(new Request("https://example.test/api/admin/group-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cf-connecting-ip": "203.0.113.20",
    },
    body: JSON.stringify({ admin_code: "test-admin-code-2026", group_code: "team-code", ttl_hours: 1 }),
  }));
  assert.equal(adminResponse.status, 200);
  const adminPayload = await adminResponse.json();
  assert.equal(adminPayload.success, true);
  assert.equal(await worker.isValidVerifyCode("team-code", baseDate), true);

  for (const expectedStatus of [403, 403, 429]) {
    const response = await worker.handleRequest(new Request("https://example.test/api/admin/group-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "cf-connecting-ip": "203.0.113.21",
      },
      body: JSON.stringify({ admin_code: "wrong", group_code: "team-code-2", ttl_hours: 1 }),
    }));
    assert.equal(response.status, expectedStatus);
    if (expectedStatus === 429) {
      const payload = await response.json();
      assert.equal(payload.retryAfterSeconds, 60);
    }
  }

  const authConfig = worker.generateCodexAuthJson({
    accessToken: "access-token-for-test",
    expires: "2026-06-26T00:00:00Z",
    user: { id: "user-1", email: "test@example.com" },
    account: { id: "account-1", planType: "plus" },
  });

  assert.equal(authConfig.auth_mode, "chatgpt");
  assert.equal(authConfig.tokens.access_token, "access-token-for-test");
  assert.equal(authConfig.tokens.account_id, "account-1");
  assert.match(authConfig.tokens.id_token, /\.synthetic$/);

  // open access mode: no verify code required
  process.env.OPEN_ACCESS = "true";
  try {
    const openConfig = await (await worker.handleRequest(new Request("https://example.test/api/public-config"))).json();
    assert.equal(openConfig.openAccess, true);

    const openVerify = await worker.handleRequest(new Request("https://example.test/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verify_code: "" }),
    }), { currentDate: baseDate });
    assert.equal(openVerify.status, 200);
    const openVerifyPayload = await openVerify.json();
    assert.equal(openVerifyPayload.success, true);
    assert.match(openVerifyPayload.bookmarklet, /^javascript:/);

    const openPage = worker.getHtmlPage("https://example.test");
    assert.equal(openPage.includes('id="verify-code"'), false);
    assert.equal(openPage.includes("open-notice"), true);
    assert.equal(openPage.includes("开放使用"), true);
    assert.match(openPage, /href="javascript:/);
  } finally {
    delete process.env.OPEN_ACCESS;
  }

  console.log("daily-code tests passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
