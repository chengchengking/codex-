#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_PREFIX = "CXA";
const DEFAULT_TZ_OFFSET_MINUTES = 480;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(PROJECT_ROOT, ".env"));
loadEnvFile(path.join(PROJECT_ROOT, ".env.local"));

function ensureDailySecret() {
  if (process.env.CODEX_DAILY_SECRET && process.env.CODEX_DAILY_SECRET.length >= 24) {
    return process.env.CODEX_DAILY_SECRET;
  }

  const envPath = path.join(PROJECT_ROOT, ".env");
  if (fs.existsSync(envPath)) {
    throw new Error("请在 .env 中设置 CODEX_DAILY_SECRET，建议至少 24 个字符。");
  }

  const generatedSecret = crypto.randomBytes(32).toString("hex");
  const generatedAdminCode = process.env.CODEX_ADMIN_CODE || crypto.randomBytes(4).toString("hex").toUpperCase();
  const envContent = [
    "# Private local settings. Do not commit this file.",
    "# Use the same CODEX_DAILY_SECRET in Cloudflare Workers.",
    `CODEX_DAILY_SECRET=${generatedSecret}`,
    `CODEX_ADMIN_CODE=${generatedAdminCode}`,
    `CODEX_CODE_PREFIX=${process.env.CODEX_CODE_PREFIX || DEFAULT_PREFIX}`,
    `CODEX_CODE_TZ_OFFSET_MINUTES=${process.env.CODEX_CODE_TZ_OFFSET_MINUTES || DEFAULT_TZ_OFFSET_MINUTES}`,
    "QQ_GROUP_LABEL=QQ群：请替换为你的群号",
    "QQ_GROUP_URL=https://qm.qq.com/q/REPLACE_WITH_YOUR_QQ_GROUP_LINK",
    "",
  ].join("\n");

  fs.writeFileSync(envPath, envContent, { encoding: "utf8", flag: "wx" });
  process.env.CODEX_DAILY_SECRET = generatedSecret;
  process.env.CODEX_ADMIN_CODE = generatedAdminCode;
  console.log("已自动创建本地私密配置 .env。部署 Worker 时请使用同一个 CODEX_DAILY_SECRET 和 CODEX_ADMIN_CODE。");
  console.log("");
  return generatedSecret;
}

function getDateStamp(date, dayOffset = 0) {
  const offset = Number.parseInt(process.env.CODEX_CODE_TZ_OFFSET_MINUTES || DEFAULT_TZ_OFFSET_MINUTES, 10);
  const offsetMinutes = Number.isFinite(offset) ? offset : DEFAULT_TZ_OFFSET_MINUTES;
  const shifted = new Date(date.getTime() + offsetMinutes * 60 * 1000 + dayOffset * 24 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function generateCode(date, dayOffset = 0) {
  const secret = ensureDailySecret();

  const prefix = String(process.env.CODEX_CODE_PREFIX || DEFAULT_PREFIX).trim().toUpperCase();
  const dateStamp = getDateStamp(date, dayOffset);
  const digest = crypto
    .createHmac("sha256", secret)
    .update(`codex-auth-helper:v2:${prefix}:${dateStamp}`)
    .digest("hex")
    .toUpperCase();

  return `${prefix}-${dateStamp}-${digest.slice(0, 5)}-${digest.slice(5, 10)}`;
}

function parseBaseDate(argv) {
  const dateArg = argv.find((arg) => arg.startsWith("--date="));
  if (!dateArg) return new Date();

  const rawDate = dateArg.slice("--date=".length);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    throw new Error("日期格式应为 --date=YYYY-MM-DD");
  }

  return new Date(`${rawDate}T00:00:00+08:00`);
}

function main() {
  const argv = process.argv.slice(2);
  const baseDate = parseBaseDate(argv);

  const today = generateCode(baseDate, 0);
  const yesterday = generateCode(baseDate, -1);
  const tomorrow = generateCode(baseDate, 1);
  const todayStamp = getDateStamp(baseDate, 0);

  console.log("");
  console.log("Codex Auth Helper 每日公益验证码");
  console.log("-----------------------------------");
  console.log(`北京时间日期: ${todayStamp}`);
  console.log(`今日验证码: ${today}`);
  console.log("");
  console.log(`群公告可直接发送: 今日 Codex Auth Helper 公益验证码：${today}`);
  console.log("");
  console.log("容错验证码（Worker 默认也接受相邻日期，防止跨午夜卡住）:");
  console.log(`昨天: ${yesterday}`);
  console.log(`明天: ${tomorrow}`);
  console.log("");
}

try {
  main();
} catch (error) {
  console.error("");
  console.error("生成失败：" + error.message);
  console.error("");
  console.error("请复制 .env.example 为 .env，并把 CODEX_DAILY_SECRET 改成你自己的长随机密钥。");
  console.error("Cloudflare Worker 里也要设置同一个 CODEX_DAILY_SECRET。");
  process.exit(1);
}
