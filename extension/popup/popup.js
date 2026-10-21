// popup.js — Codex Auth Helper 扩展的交互与校验逻辑
// 遵循纯本地处理原则，新增复制配置及离线 auth.json 解析校验模块

// 缓存全局 Session 数据
let globalSession = null;
let countdownInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化选项卡切换
  initTabs();
  
  // 2. 初始化 Session 获取
  initSessionFetch();
  
  // 3. 绑定基础事件监听 (下载、复制、校验)
  bindEvents();
});

/**
 * 初始化选项卡导航
 */
function initTabs() {
  const navBtns = document.querySelectorAll('.tab-btn');
  const tabViews = document.querySelectorAll('.tab-view');
  const indicator = document.querySelector('.tab-indicator');

  function updateIndicator(activeBtn) {
    if (indicator && activeBtn) {
      indicator.style.left = `${activeBtn.offsetLeft}px`;
      indicator.style.width = `${activeBtn.offsetWidth}px`;
    }
  }

  // 初始定位指示器
  const initialActive = document.querySelector('.tab-btn.active');
  setTimeout(() => updateIndicator(initialActive), 100);

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      
      // 切换按钮状态
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 切换视图状态
      tabViews.forEach(v => v.classList.remove('active'));
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');
      
      // 更新下划线指示器
      updateIndicator(btn);
    });
  });

  // 窗口调整时自适应指示器
  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.tab-btn.active');
    updateIndicator(currentActive);
  });
}

/**
 * 初始化 Session 获取
 */
function initSessionFetch() {
  showState('loading');
  
  chrome.runtime.sendMessage({ action: 'fetch_session' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('通信错误:', chrome.runtime.lastError);
      showState('unauthorized');
      return;
    }

    if (response && response.success) {
      globalSession = response.data;
      renderAuthorizedState(response.data);
      showState('authorized');
    } else {
      // 细化未登录提示信息
      const descEl = document.getElementById('unauthorized-desc');
      if (response && response.error) {
        if (response.error === 'NETWORK_ERROR') {
          descEl.textContent = '检测到网络连接异常。无法访问 ChatGPT 认证服务，请检查代理网络设置后重试。';
        } else {
          descEl.textContent = '未检测到 ChatGPT 会话。请点击下方按钮跳转，并保持账号登录状态。';
        }
      }
      showState('unauthorized');
    }
  });
}

/**
 * 切换界面显示状态
 */
function showState(state) {
  const loadingEl = document.getElementById('state-loading');
  const unauthorizedEl = document.getElementById('state-unauthorized');
  const authorizedEl = document.getElementById('state-authorized');

  loadingEl.classList.remove('active');
  unauthorizedEl.classList.remove('active');
  authorizedEl.classList.remove('active');

  if (state === 'loading') {
    loadingEl.classList.add('active');
  } else if (state === 'unauthorized') {
    unauthorizedEl.classList.add('active');
  } else if (state === 'authorized') {
    authorizedEl.classList.add('active');
  }
}

/**
 * 渲染已登录状态 of UI 数据
 */
function renderAuthorizedState(session) {
  const avatarEl = document.getElementById('user-avatar');
  const nameEl = document.getElementById('user-name');
  const emailEl = document.getElementById('user-email');
  const planEl = document.getElementById('badge-plan');
  const expiresEl = document.getElementById('token-expires');

  // 用户个人信息
  const user = session.user || {};
  avatarEl.src = user.image || 'https://lh3.googleusercontent.com/a/default-user=s96-c';
  nameEl.textContent = user.name || 'ChatGPT 用户';
  emailEl.textContent = user.email || '未绑定邮箱';

  // 账户套餐
  const account = session.account || {};
  const planType = (account.planType || 'free').toUpperCase();
  planEl.textContent = planType;
  
  if (planType === 'PLUS' || planType === 'PRO') {
    planEl.className = 'plan-badge plus';
  } else {
    planEl.className = 'plan-badge free';
  }

  // 有效期至
  const expiresTime = session.expires ? new Date(session.expires) : null;
  if (expiresTime) {
    expiresEl.textContent = formatLocalDate(expiresTime);
    startCountdown(expiresTime);
  } else {
    expiresEl.textContent = '长期有效';
    document.getElementById('token-countdown').textContent = '无限';
  }
}

/**
 * 绑定按钮交互事件
 */
function bindEvents() {
  // 1. 未登录跳转
  document.getElementById('btn-login').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://chatgpt.com/' });
    window.close();
  });

  // 2. 复制配置到剪切板
  document.getElementById('btn-copy').addEventListener('click', () => {
    if (!globalSession) {
      showToast('❌ 未检测到登录数据，无法复制');
      return;
    }
    const authJsonString = generateCodexAuthJson(globalSession);
    navigator.clipboard.writeText(authJsonString)
      .then(() => showToast('📋 配置已复制到剪贴板'))
      .catch(err => {
        console.error('复制配置失败:', err);
        showToast('❌ 复制失败，请尝试导出 JSON');
      });
  });

  // 3. 下载 auth.json 配置文件
  document.getElementById('btn-download').addEventListener('click', () => {
    if (!globalSession) return;
    const authJsonString = generateCodexAuthJson(globalSession);
    const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(authJsonString);
    
    chrome.downloads.download({
      url: dataUrl,
      filename: 'auth.json',
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('下载遇到异常:', chrome.runtime.lastError);
        showToast('❌ 下载失败，请重试');
      } else {
        showToast('🎉 auth.json 导出成功！已加入下载');
      }
    });
  });

  // 4. 运行本地配置文件校验解析
  document.getElementById('btn-validate-run').addEventListener('click', runConfigValidation);
}

/**
 * 2.0.0 新功能：本地反向解析和时效性校验
 */
function runConfigValidation() {
  const inputArea = document.getElementById('val-input');
  const resultBox = document.getElementById('val-result-box');
  const valEmail = document.getElementById('val-email');
  const valPlan = document.getElementById('val-plan');
  const valExpires = document.getElementById('val-expires');
  const valTimeLeft = document.getElementById('val-time-left');
  const valBadge = document.getElementById('val-status-badge');

  const rawText = inputArea.value.trim();
  if (!rawText) {
    showToast('⚠️ 请先粘贴 auth.json 的内容');
    return;
  }

  try {
    const config = JSON.parse(rawText);
    
    // 基本结构判断
    if (!config.tokens || !config.tokens.id_token) {
      throw new Error('缺少 tokens.id_token 鉴权段');
    }

    const idToken = config.tokens.id_token;
    const parts = idToken.split('.');
    
    // 判断是否是合法的 JWT (包含三段，或者以 .synthetic 结尾的伪造 token)
    if (parts.length < 2) {
      throw new Error('id_token 格式非合法 JWT');
    }

    // 解析 Payload 段 (第二部分)
    const payloadBase64 = parts[1];
    // Base64Url 解码
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    
    // 提取字段并渲染
    const email = payload.email || '未绑定邮箱';
    const authData = payload["https://api.openai.com/auth"] || {};
    const planType = (authData.chatgpt_plan_type || 'free').toUpperCase();
    const exp = payload.exp; // 秒级时间戳

    // 填充显示
    valEmail.textContent = email;
    valPlan.textContent = planType;
    
    if (planType === 'PLUS' || planType === 'PRO') {
      valPlan.className = 'detail-value text-glow-green';
    } else {
      valPlan.className = 'detail-value';
    }

    if (exp) {
      const expDate = new Date(exp * 1000);
      valExpires.textContent = formatLocalDate(expDate);

      // 计算时效
      const nowSec = Math.floor(Date.now() / 1000);
      const diff = exp - nowSec;

      if (diff <= 0) {
        valTimeLeft.textContent = '已过期';
        valTimeLeft.className = 'detail-value text-danger';
        valBadge.textContent = '已失效';
        valBadge.className = 'plan-badge free-dark'; // 红/灰
      } else {
        const days = Math.floor(diff / (3600 * 24));
        const hours = Math.floor((diff % (3600 * 24)) / 3600);
        valTimeLeft.textContent = days > 0 ? `${days}天 ${hours}小时` : `${hours}小时`;
        valTimeLeft.className = 'detail-value text-glow-green';
        valBadge.textContent = '健康';
        valBadge.className = 'plan-badge plus'; // 绿/金
      }
    } else {
      valExpires.textContent = '长期有效';
      valTimeLeft.textContent = '无限';
      valTimeLeft.className = 'detail-value text-glow-green';
      valBadge.textContent = '健康';
      valBadge.className = 'plan-badge plus';
    }

    // 展开面板
    resultBox.classList.add('show');
    showToast('🎉 校验完成！解析成功');

  } catch (err) {
    console.error('配置校验失败:', err);
    resultBox.classList.remove('show');
    showToast(`❌ 校验失败: ${err.message}`);
  }
}

/**
 * 实时计算并更新剩余过期时间倒计时
 */
function startCountdown(expiresTime) {
  if (countdownInterval) clearInterval(countdownInterval);

  const countdownEl = document.getElementById('token-countdown');

  function update() {
    const now = new Date();
    const diff = expiresTime - now;

    if (diff <= 0) {
      countdownEl.textContent = '已过期';
      countdownEl.className = 'detail-value text-danger';
      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let displayStr = '';
    if (days > 0) displayStr += `${days}天`;
    if (hours > 0 || days > 0) displayStr += `${hours}时`;
    displayStr += `${minutes}分${seconds}秒`;

    countdownEl.textContent = displayStr;
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

/**
 * 格式化输出本地化的年月日 时分秒
 */
function formatLocalDate(date) {
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * 核心转换逻辑：将获取到的 ChatGPT Session 数据转化为符合 Codex 要求的格式
 */
function generateCodexAuthJson(session) {
  const accountId = session.account?.id || '';
  const email = session.user?.email || '';
  const planType = session.account?.planType || 'free';
  const iat = Math.floor(Date.now() / 1000);
  const exp = session.expires ? Math.floor(new Date(session.expires).getTime() / 1000) : iat + (30 * 24 * 3600);

  // 1. 构建与原始 JWT 结构对齐的 Synthetic id_token
  const jwtHeader = {
    alg: 'none',
    typ: 'JWT',
    cpa_synthetic: true
  };

  const jwtPayload = {
    iat: iat,
    exp: exp,
    "https://api.openai.com/auth": {
      chatgpt_account_id: accountId,
      chatgpt_plan_type: planType,
      chatgpt_user_id: session.user?.id || '',
      user_id: session.user?.id || ''
    },
    email: email
  };

  // Base64Url 编码
  const base64UrlEncode = (obj) => {
    const str = JSON.stringify(obj);
    const base64 = btoa(unescape(encodeURIComponent(str)));
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };

  const syntheticIdToken = `${base64UrlEncode(jwtHeader)}.${base64UrlEncode(jwtPayload)}.synthetic`;

  // 2. 构造目标输出格式
  const authConfig = {
    auth_mode: "chatgpt",
    OPENAI_API_KEY: null,
    tokens: {
      id_token: syntheticIdToken,
      access_token: session.accessToken,
      refresh_token: "",
      account_id: accountId
    },
    last_refresh: new Date().toISOString()
  };

  return JSON.stringify(authConfig, null, 2);
}

/**
 * 弹出 Toast 反馈
 */
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  
  toastMsg.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}
