# deploy_to_cloudflare.ps1 — Codex 认证助手一键部署到 Cloudflare Workers 脚本
# 纯本地自动化调用，安全拉起浏览器完成 OAuth 授权，并同步上传本地私密密钥

$ErrorActionPreference = "Stop"

function Get-DotEnvValue {
    param(
        [string[]]$Lines,
        [string]$Name
    )

    $prefix = "$Name="
    foreach ($line in $Lines) {
        if ($line -like "$prefix*") {
            $separator = $line.IndexOf("=")
            if ($separator -ge 0) {
                return $line.Substring($separator + 1).Trim().Trim('"').Trim("'")
            }
        }
    }

    return ""
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Codex 认证助手 v2.0.0 — Cloudflare Workers 一键部署工具" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "提示：本脚本将为您自动打包发布 worker.js，并安全同步本地 .env 密钥。" -ForegroundColor Yellow
Write-Host "这将在您的浏览器中弹出登录页面，无需在命令行中输入任何账号密码。" -ForegroundColor Yellow
Write-Host ""

try {
    # 1. 检查 Node.js 环境
    Write-Host "[1/5] 正在检测 Node.js 运行环境..." -ForegroundColor White
    if (!(Get-Command "npm" -ErrorAction SilentlyContinue)) {
        throw "未检测到 Node.js 或 npm 环境，请先安装 Node.js (https://nodejs.org/) 后再运行此脚本。"
    }
    Write-Host "✓ Node.js/npm 环境就绪。" -ForegroundColor Green

    # 2. 检查并准备配置文件
    Write-Host "[2/5] 正在校验部署配置文件..." -ForegroundColor White
    if (!(Test-Path "wrangler.toml")) {
        Write-Host "正在从模板生成 wrangler.toml 配置文件..." -ForegroundColor Yellow
        Copy-Item "wrangler.toml.example" "wrangler.toml"
        Write-Host "⚠️ 已生成 wrangler.toml，请在部署后根据需要手动修改其中的 QQ_GROUP_URL 变量。" -ForegroundColor Yellow
    } else {
        Write-Host "✓ wrangler.toml 已存在。" -ForegroundColor Green
    }

    # 3. 检查并准备 Wrangler 命令行工具
    Write-Host "[3/5] 正在检测 Cloudflare Wrangler 部署工具..." -ForegroundColor White
    $wranglerReady = $false
    try {
        npx wrangler --version > $null 2>&1
        $wranglerReady = $true
    } catch {}

    if (-not $wranglerReady) {
        Write-Host "正在为您本地安装 Cloudflare Wrangler CLI..." -ForegroundColor Yellow
        npm install wrangler --save-dev
    }
    Write-Host "✓ Wrangler 部署工具已就绪。" -ForegroundColor Green

    # 4. 引导用户进行安全登录认证
    Write-Host ""
    Write-Host "[4/5] 正在拉起 Cloudflare 安全授权鉴权通道..." -ForegroundColor White
    Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host ">>> 注意：接下来您的浏览器将自动打开 Cloudflare 授权页面。" -ForegroundColor Yellow
    Write-Host ">>> 请在网页中点击 'Allow' (允许授权) 完成登录。" -ForegroundColor Yellow
    Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
    
    npx wrangler login

    # 5. 执行 Worker 服务发布
    Write-Host ""
    Write-Host "[5/5] 正在将 worker.js 部署至 Cloudflare Workers..." -ForegroundColor White
    npx wrangler deploy

    # 6. 自动同步本地安全密钥
    Write-Host ""
    Write-Host "正在同步本地安全密钥至 Cloudflare Worker 密钥库..." -ForegroundColor White
    if (Test-Path ".env") {
        $envContent = Get-Content ".env" -Encoding UTF8
        $dailySecret = Get-DotEnvValue -Lines $envContent -Name "CODEX_DAILY_SECRET"
        if ($dailySecret -and $dailySecret -ne "replace-with-a-long-random-secret-at-least-24-characters") {
            Write-Host "正在自动向 Cloudflare 配置 CODEX_DAILY_SECRET 密钥..." -ForegroundColor Yellow
            # 管道直接写入密钥
            $dailySecret | npx wrangler secret put CODEX_DAILY_SECRET
            Write-Host "✓ CODEX_DAILY_SECRET 密钥已同步写入云端配置。" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 检测到本地 .env 中的 CODEX_DAILY_SECRET 为默认模板值或为空，跳过自动配置。" -ForegroundColor Red
            Write-Host "提示：请在 .env 中设置真实种子，并在控制台执行: npx wrangler secret put CODEX_DAILY_SECRET 写入。" -ForegroundColor Yellow
        }

        $adminCode = Get-DotEnvValue -Lines $envContent -Name "CODEX_ADMIN_CODE"
        if ($adminCode -and $adminCode -ne "replace-with-private-admin-code") {
            Write-Host "正在自动向 Cloudflare 配置 CODEX_ADMIN_CODE 开发者暗号..." -ForegroundColor Yellow
            $adminCode | npx wrangler secret put CODEX_ADMIN_CODE
            Write-Host "✓ CODEX_ADMIN_CODE 开发者暗号已同步写入云端配置。" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 未检测到有效的 CODEX_ADMIN_CODE，网页隐藏管理面板将不可用。" -ForegroundColor Red
            Write-Host "提示：请在 .env 中设置 CODEX_ADMIN_CODE，并在控制台执行: npx wrangler secret put CODEX_ADMIN_CODE 写入。" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ 未检测到本地 .env 密钥配置文件，跳过密钥上传。" -ForegroundColor Red
        Write-Host "提示：请复制 .env.example 为 .env 并生成您的种子后再运行脚本。" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "🎉 恭喜！Codex 辅助公益站部署成功！" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "请在上方输出中找到 Cloudflare 提供的访问 URL (例如: https://codex-auth-helper-public.xxxx.workers.dev)" -ForegroundColor Yellow
    Write-Host "您的用户已可以通过此公网地址安全地使用每日验证码服务。" -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "❌ 部署遇到异常终止：" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "请排查网络环境（如代理配置）或账号权限后重试。" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "按任意键退出脚本..."

