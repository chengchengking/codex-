#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
OpenAI Codex Login Bypass Companion Tool
- Automatically reads the formatted JSON from clipboard (requires pyperclip) or manual input.
- Validates the token structure and expiration.
- Backs up existing ~/.codex/auth.json configurations.
- Writes the bypass session token.
- Verifies authentication status using Codex CLI.
- Automatically launches Codex Desktop if requested.
"""

import os
import sys
import json
import base64
import time
import subprocess
import shutil
import socket
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

# Try importing pyperclip for automatic clipboard extraction
try:
    import pyperclip
    HAS_PYPERCLIP = True
except ImportError:
    HAS_PYPERCLIP = False


def find_browser():
    """Finds Chrome or Edge executable on Windows or macOS."""
    if sys.platform == "darwin":
        paths = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            os.path.expanduser("~/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
            os.path.expanduser("~/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
        ]
    else:
        paths = [
            # Chrome paths
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
            # Edge paths
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        ]
    for p in paths:
        if os.path.exists(p):
            return p
    return None


def ws_handshake(sock, host, path):
    key = "dGhlIHNhbXBsZSBub25jZQ=="  # standard dummy key
    handshake = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        "Sec-WebSocket-Version: 13\r\n\r\n"
    )
    sock.sendall(handshake.encode())

    response = b""
    while b"\r\n\r\n" not in response:
        chunk = sock.recv(4096)
        if not chunk:
            break
        response += chunk

    headers, body = response.split(b"\r\n\r\n", 1)
    status_line = headers.split(b"\r\n")[0]
    if b"101" not in status_line:
        raise Exception("Handshake failed: " + headers.decode(errors='ignore'))
    return body


def ws_send(sock, text):
    data = text.encode('utf-8')
    length = len(data)
    frame = bytearray([0x81])

    if length <= 125:
        frame.append(0x80 | length)
    elif length <= 65535:
        frame.append(0x80 | 126)
        frame.extend(length.to_bytes(2, 'big'))
    else:
        frame.append(0x80 | 127)
        frame.extend(length.to_bytes(8, 'big'))

    mask = bytearray([0x01, 0x02, 0x03, 0x04])
    frame.extend(mask)

    masked_data = bytearray(length)
    for i in range(length):
        masked_data[i] = data[i] ^ mask[i % 4]
    frame.extend(masked_data)

    sock.sendall(frame)


def ws_recv(sock, buffered_data=b""):
    data = buffered_data

    def read_bytes(n):
        nonlocal data
        while len(data) < n:
            chunk = sock.recv(4096)
            if not chunk:
                raise Exception("Connection closed")
            data += chunk
        res = data[:n]
        data = data[n:]
        return res

    header = read_bytes(2)
    fin_opcode = header[0]
    mask_len = header[1]

    masked = bool(mask_len & 0x80)
    length = mask_len & 0x7f

    if length == 126:
        length_bytes = read_bytes(2)
        length = int.from_bytes(length_bytes, 'big')
    elif length == 127:
        length_bytes = read_bytes(8)
        length = int.from_bytes(length_bytes, 'big')

    if masked:
        mask = read_bytes(4)

    payload = read_bytes(length)
    if masked:
        unmasked = bytearray(length)
        for i in range(length):
            unmasked[i] = payload[i] ^ mask[i % 4]
        payload = bytes(unmasked)

    return payload.decode('utf-8'), data


def evaluate_js(ws_url, expression):
    parsed = urllib.parse.urlparse(ws_url)
    host = parsed.netloc
    path = parsed.path
    if parsed.query:
        path += "?" + parsed.query

    host_parts = host.split(":")
    ip = host_parts[0]
    port = int(host_parts[1]) if len(host_parts) > 1 else 80

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((ip, port))

    buffered = ws_handshake(sock, host, path)

    cmd = {
        "id": 1,
        "method": "Runtime.evaluate",
        "params": {
            "expression": expression,
            "awaitPromise": True,
            "returnByValue": True
        }
    }

    ws_send(sock, json.dumps(cmd))

    while True:
        msg, buffered = ws_recv(sock, buffered)
        res = json.loads(msg)
        if res.get("id") == 1:
            sock.close()
            return res.get("result", {})


def extract_account_id(token_str):
    try:
        parts = token_str.split('.')
        if len(parts) == 3:
            payload_b64 = parts[1]
            padding = 4 - len(payload_b64) % 4
            if padding != 4:
                payload_b64 += "=" * padding
            payload_bytes = base64.urlsafe_b64decode(payload_b64)
            payload = json.loads(payload_bytes.decode('utf-8'))
            auth_info = payload.get("https://api.openai.com/auth", {})
            return auth_info.get("chatgpt_account_id", "")
    except Exception:
        pass
    return ""


def run_auto_retrieve():
    browser_path = find_browser()
    if not browser_path:
        print("[自动获取] 提示：未在系统中找到安装的 Chrome 或 Edge 浏览器。")
        return None

    port = 9333
    user_dir = Path.home() / ".codex" / "browser_session"
    user_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        browser_path,
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_dir}",
        "https://chatgpt.com/",
    ]

    print("\n[自动获取] 正在启动独立浏览器窗口...")
    print("============================================================")
    print("【第一步】如果浏览器显示未登录，请在打开的窗口中登录您的 ChatGPT 账号。")
    print("【第二步】登录成功并进入聊天界面后，辅助工具会自动捕获 Token 并完成配置！")
    print("============================================================")
    print("正在连接浏览器并检测登录状态，最长等待 3 分钟 (按 Ctrl+C 可取消)...")

    try:
        if sys.platform == "win32":
            proc = subprocess.Popen(cmd, creationflags=subprocess.CREATE_NO_WINDOW)
        else:
            proc = subprocess.Popen(cmd)
    except Exception as e:
        print(f"[自动获取] 启动浏览器失败: {e}")
        return None

    targets = []
    for _ in range(15):
        try:
            req = urllib.request.urlopen(f"http://127.0.0.1:{port}/json")
            targets = json.loads(req.read().decode('utf-8'))
            break
        except Exception:
            time.sleep(1)

    if not targets:
        print("[自动获取] 错误：无法连接到浏览器调试接口。")
        try:
            proc.terminate()
        except:
            pass
        return None

    js_expr = """
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => {
         if (data && data.accessToken) {
           return { success: true, token: data.accessToken };
         } else {
           return { success: false, reason: 'not_logged_in' };
         }
      })
      .catch(err => {
         return { success: false, reason: err.message };
      })
    """

    start_time = time.time()
    auth_data = None

    try:
        while time.time() - start_time < 180:
            try:
                req = urllib.request.urlopen(f"http://127.0.0.1:{port}/json")
                targets = json.loads(req.read().decode('utf-8'))
            except Exception:
                print("\n[自动获取] 提示：与浏览器连接断开，请确保浏览器窗口未被关闭。")
                time.sleep(2)
                continue

            chatgpt_target = None
            for t in targets:
                if t.get("type") == "page" and "chatgpt.com" in t.get("url", "").lower():
                    chatgpt_target = t
                    break

            if not chatgpt_target:
                time.sleep(2)
                continue

            ws_url = chatgpt_target.get("webSocketDebuggerUrl")
            if not ws_url:
                time.sleep(2)
                continue

            try:
                eval_res = evaluate_js(ws_url, js_expr)
                res_val = eval_res.get("result", {}).get("value", {})
                if isinstance(res_val, dict):
                    if res_val.get("success"):
                        token = res_val.get("token")
                        account_id = extract_account_id(token)
                        auth_data = {
                            "auth_mode": "chatgpt",
                            "OPENAI_API_KEY": None,
                            "tokens": {
                                "id_token": token,
                                "access_token": token,
                                "refresh_token": "",
                                "account_id": account_id
                            },
                            "last_refresh": datetime.now(timezone.utc).isoformat()
                        }
                        print("\n[自动获取] 成功捕获到活跃的 ChatGPT 会话！")
                        break
                    else:
                        elapsed = int(time.time() - start_time)
                        sys.stdout.write(f"\r[自动获取] 正在等待网页登录中... (已等待 {elapsed} 秒 / 最长 180 秒)")
                        sys.stdout.flush()
            except Exception:
                pass

            time.sleep(2)
    except KeyboardInterrupt:
        print("\n[自动获取] 用户手动取消了自动获取。")
    finally:
        try:
            proc.terminate()
        except:
            pass

    if auth_data:
        return auth_data
    else:
        print("\n[自动获取] 自动获取超时或失败。")
        return None


def print_banner():
    banner = """
============================================================
       OpenAI Codex Login Bypass Companion Tool
============================================================
    Bypassing phone/SMS verification using web session token
============================================================
"""
    print(banner)


def check_jwt_expiry(token_str):
    """Parses JWT payload and checks if the token is expired."""
    try:
        parts = token_str.split('.')
        if len(parts) != 3:
            return False, "Invalid JWT format"

        # Add padding to base64 string
        payload_b64 = parts[1]
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding

        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))

        exp = payload.get('exp')
        if not exp:
            return True, "No exp claim found in JWT, proceeding anyway."

        exp_time = datetime.fromtimestamp(exp, tz=timezone.utc)
        now = datetime.now(timezone.utc)

        remaining_days = (exp_time - now).days
        remaining_hours = (exp_time - now).seconds // 3600

        if now > exp_time:
            return False, f"Token expired on {exp_time.strftime('%Y-%m-%d %H:%M:%S')} UTC"
        else:
            return True, f"Token is valid for another {remaining_days} days and {remaining_hours} hours."
    except Exception as e:
        return True, f"Could not determine token expiry ({e}), proceeding anyway."


def locate_codex_bin():
    """Attempts to find the codex binary path on Windows or macOS."""
    if sys.platform == "darwin":
        # Check PATH first
        codex_in_path = shutil.which("codex")
        if codex_in_path:
            return Path(codex_in_path)
        # Common macOS install locations
        paths = [
            Path("/usr/local/bin/codex"),
            Path.home() / ".local" / "bin" / "codex",
        ]
        for p in paths:
            if p.exists():
                return p
        return None
    else:
        paths = [
            Path.home() / "AppData" / "Local" / "OpenAI" / "Codex" / "bin" / "codex.exe",
            Path("C:/Users") / os.getlogin() / "AppData" / "Local" / "OpenAI" / "Codex" / "bin" / "codex.exe",
        ]
        for p in paths:
            if p.exists():
                return p
        return None


def run_login_bypass(auth_data):
    """Backs up old configuration, writes the new one, and runs validation."""
    codex_dir = Path.home() / ".codex"
    codex_dir.mkdir(exist_ok=True)
    auth_file = codex_dir / "auth.json"

    # 1. Backup existing auth.json
    if auth_file.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = codex_dir / f"auth.json.bak_{timestamp}"
        try:
            auth_file.rename(backup_file)
            print(f"[Backup] Successfully backed up old configuration to: {backup_file.name}")
        except Exception as e:
            print(f"[Warning] Failed to back up existing auth.json: {e}")

    # 2. Write new auth.json
    try:
        with open(auth_file, "w", encoding="utf-8") as f:
            json.dump(auth_data, f, indent=2, ensure_ascii=False)
        print(f"[OK] New config successfully written to: {auth_file}")
    except Exception as e:
        print(f"[Error] Failed to write config file: {e}")
        return False

    # 3. Verify status with codex.exe
    codex_path = locate_codex_bin()
    if not codex_path:
        print("[Info] Codex binary not found in standard user paths. Skipping CLI status verification.")
        print("[Info] If you installed Codex in a custom location, please run 'codex login status' manually.")
        return True

    print(f"[Verify] Found Codex executable: {codex_path}")
    print("[Verify] Checking authentication status...")

    try:
        result = subprocess.run(
            [str(codex_path), "login", "status"],
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='ignore'
        )
        if result.returncode == 0:
            print(f"[Success] Codex CLI Output: {result.stdout.strip()}")
            return True
        else:
            print(f"[Warning] Codex CLI login check failed (Code {result.returncode})")
            print(f"Error output: {result.stderr.strip() or result.stdout.strip()}")
            return False
    except Exception as e:
        print(f"[Warning] Failed to run codex.exe status check: {e}")
        return True


def prompt_launch_codex():
    """Prompts the user to launch the Codex desktop application."""
    if sys.platform == "darwin":
        # On macOS, try to open the Codex.app bundle
        codex_apps = [
            "/Applications/Codex.app",
            os.path.expanduser("~/Applications/Codex.app"),
        ]
        app_path = None
        for p in codex_apps:
            if os.path.exists(p):
                app_path = p
                break
        if not app_path:
            # Fall back to CLI
            codex_bin = locate_codex_bin()
            if not codex_bin:
                return
            choice = input("\nWould you like to launch Codex now? (y/n): ").strip().lower()
            if choice in ['y', 'yes', '']:
                print("[Launch] Starting Codex...")
                try:
                    subprocess.Popen([str(codex_bin)])
                    print("[Launch] Codex process spawned. Happy coding!")
                except Exception as e:
                    print(f"[Error] Failed to start Codex: {e}")
            return

        choice = input("\nWould you like to launch Codex Desktop now? (y/n): ").strip().lower()
        if choice in ['y', 'yes', '']:
            print("[Launch] Starting Codex Desktop...")
            try:
                subprocess.Popen(["open", app_path])
                print("[Launch] Codex Desktop launched. Happy coding!")
            except Exception as e:
                print(f"[Error] Failed to start Codex: {e}")
        return

    # Windows
    codex_path = locate_codex_bin()
    if not codex_path:
        return

    choice = input("\nWould you like to launch Codex Desktop now? (y/n): ").strip().lower()
    if choice in ['y', 'yes', '']:
        print("[Launch] Starting Codex Desktop...")
        try:
            subprocess.Popen([str(codex_path), "app"], creationflags=subprocess.CREATE_NEW_CONSOLE)
            print("[Launch] Codex Desktop process spawned. Happy coding!")
        except Exception as e:
            print(f"[Error] Failed to start Codex: {e}")


def main():
    # Force output encoding to UTF-8 on Windows
    if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding='utf-8')

    print_banner()

    auth_data = None

    # Prompt the user for selection
    print("请选择获取 ChatGPT 登录 Token 的方式：")
    print("1. [推荐] 自动获取 (自动打开浏览器窗口登录并提取，免去手动复制粘贴)")
    print("2. 手动粘帖 (使用网页控制台 JS 脚本生成的配置 JSON)")

    try:
        choice = input("\n请输入选项 (1 或 2，默认 1): ").strip()
    except (KeyboardInterrupt, EOFError):
        choice = "2"

    if not choice:
        choice = "1"

    if choice == "1":
        auth_data = run_auto_retrieve()
        if not auth_data:
            print("\n[提示] 自动获取未成功，已自动切回手动粘帖模式...")

    if not auth_data:
        # Method A: Clipboard auto-detection
        if HAS_PYPERCLIP:
            print("[Clipboard] Checking clipboard for configuration JSON...")
            clipboard_content = pyperclip.paste().strip()
            if clipboard_content.startswith("{") and "auth_mode" in clipboard_content and "access_token" in clipboard_content:
                try:
                    temp_data = json.loads(clipboard_content)
                    if temp_data.get("tokens", {}).get("access_token"):
                        print("[Clipboard] Found valid Codex Bypass JSON configuration in clipboard!")
                        confirm = input("Apply clipboard configuration? (Y/n): ").strip().lower()
                        if confirm in ['y', 'yes', '']:
                            auth_data = temp_data
                except Exception:
                    pass

        if not auth_data:
            if HAS_PYPERCLIP:
                print("[Clipboard] Clipboard did not contain valid config JSON.")
            else:
                print("[Clipboard] Python package 'pyperclip' not installed. Auto clipboard detection disabled.")

            print("\nPlease paste the JSON payload retrieved from your browser console below.")
            print("Press ENTER on an empty line or Ctrl+D (Ctrl+Z + Enter on Windows) when done:")
            print("-" * 60)

            lines = []
            try:
                while True:
                    line = input()
                    if not line.strip() and lines:  # break on empty line after some text has been entered
                        break
                    lines.append(line)
            except (KeyboardInterrupt, EOFError):
                print()

            full_input = "\n".join(lines).strip()
            if not full_input:
                print("[Error] No input detected. Exiting.")
                sys.exit(1)

            try:
                auth_data = json.loads(full_input)
            except json.JSONDecodeError as e:
                print(f"[Error] Invalid JSON format: {e}")
                sys.exit(1)

    # Validate JSON keys
    tokens = auth_data.get("tokens", {})
    access_token = tokens.get("access_token")

    if not access_token:
        print("[Error] Invalid payload: Missing 'tokens.access_token'. Please ensure you copied the entire JSON.")
        sys.exit(1)

    # Check JWT Expiration
    ok, message = check_jwt_expiry(access_token)
    print(f"\n[JWT Status] {message}")
    if not ok:
        print("[Error] Expired token. Please log into https://chatgpt.com/ and extract a fresh token.")
        sys.exit(1)

    # Run the setup
    success = run_login_bypass(auth_data)
    if success:
        prompt_launch_codex()
    else:
        print("\n[Error] Login configuration failed. Please check your inputs and try again.")
        sys.exit(1)


if __name__ == "__main__":
    main()
