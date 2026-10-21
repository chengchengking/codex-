// background.js — Service Worker 异步获取 Session 数据
// 符合 Manifest V3 最佳实践，支持对错误详细归类与生命周期保护

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fetch_session') {
    fetchChatGPTSession()
      .then(sessionData => {
        sendResponse({ success: true, data: sessionData });
      })
      .catch(error => {
        console.error('[Codex Helper 2.0] 获取 ChatGPT Session 失败:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持异步通信通道开启
  }
});

/**
 * 跨域请求 ChatGPT Session 接口
 */
async function fetchChatGPTSession() {
  try {
    const response = await fetch('https://chatgpt.com/api/auth/session', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      throw new Error(`HTTP_${response.status}`);
    }

    const data = await response.json();
    
    // 校验是否获取到了合法的 accessToken
    if (!data || !data.accessToken) {
      throw new Error('TOKEN_EMPTY');
    }

    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('NETWORK_ERROR');
    }
    throw error;
  }
}
