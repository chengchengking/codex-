// 把 bookmarklet.js 打包成一个 javascript: 链接，并生成可直接双击打开的 bookmarklet.html。
// 用法：node tools/build-bookmarklet.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "bookmarklet.js"), "utf8");

// 去掉整行注释，缩短链接长度
const minified = source
  .split("\n")
  .filter((line) => !/^\s*\/\//.test(line))
  .join("\n")
  .trim();

const href = "javascript:" + encodeURIComponent(minified);

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codex Auth Helper - 获取书签</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
           background: #0f1115; color: #e8eaed; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    .card { max-width: 640px; padding: 32px; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    p { color: #9aa0a6; line-height: 1.7; font-size: 14px; }
    .drag { display: inline-block; margin: 20px 0; padding: 14px 22px; border-radius: 8px;
            background: #10a37f; color: #fff; font-weight: 700; text-decoration: none; cursor: grab; }
    .drag:hover { background: #0e8f6f; }
    textarea { width: 100%; height: 140px; margin-top: 8px; background: #171a20; color: #cfd3d8;
               border: 1px solid #2a2f38; border-radius: 6px; padding: 10px; font-size: 12px;
               font-family: ui-monospace, Consolas, monospace; }
    ol { color: #9aa0a6; line-height: 1.9; font-size: 14px; padding-left: 20px; }
    code { background: #171a20; padding: 2px 6px; border-radius: 4px; color: #cfd3d8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Codex Auth Helper</h1>
    <p>把这个按钮拖进浏览器书签栏，之后在已登录的 ChatGPT 页面点它一下，就会生成 <code>auth.json</code>。</p>
    <a class="drag" href="${href}">拖我到书签栏</a>
    <p>拖不动的话，复制下面这段代码，手动新建一个书签，把它粘到「网址」里：</p>
    <textarea readonly>${href}</textarea>
    <ol>
      <li>打开并登录 <code>https://chatgpt.com</code></li>
      <li>点击刚才保存的书签</li>
      <li>页面右下角会出现面板，复制或下载 <code>auth.json</code></li>
      <li>把它放进 Codex 的配置目录</li>
    </ol>
    <p>整段脚本只在你自己的浏览器里运行，只读取同源的 <code>chatgpt.com/api/auth/session</code>，不会把凭证发给任何服务器。</p>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "bookmarklet.html"), html);
console.log("bookmarklet.html 已生成，链接长度：" + href.length + " 字符");
