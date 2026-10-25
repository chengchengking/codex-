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
import socket
import urllib.request
import urllib.error
import urllib.parse
import shutil
from datetime import datetime, timezone
from pathlib import Path

# Try importing pyperclip for automatic clipboard extraction, automatically install it if missing
try:
    import pyperclip
    HAS_PYPERCLIP = True
except ImportError:
    try:
        import subprocess
        subprocess.run([sys.executable, "-m", "pip", "install", "pyperclip"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        import pyperclip
        HAS_PYPERCLIP = True
    except Exception:
        HAS_PYPERCLIP = False

# Permanent grafted id_token has been removed from client code for secure Cloud authentication.
GRAFT_ID_TOKEN = None


def scan_installed_browsers():
    """Scans the system for installed browsers (Chrome and Edge) and returns their paths."""
    browsers = []

    # macOS: browsers live inside .app bundles, no registry involved
    if sys.platform == "darwin":
        mac_candidates = [
            ("Google Chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
            ("Google Chrome", os.path.expanduser("~/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")),
            ("Microsoft Edge", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
            ("Microsoft Edge", os.path.expanduser("~/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge")),
        ]
        found_names = []
        for name, path in mac_candidates:
            if name in found_names:
                continue
            if os.path.exists(path):
                browsers.append((name, path))
                found_names.append(name)
        return browsers

    # Check registry on Windows
    if sys.platform == "win32":
        import winreg
        registry_paths = [
            ("Google Chrome", r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe"),
            ("Microsoft Edge", r"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe")
        ]
        for name, reg_path in registry_paths:
            for key in [winreg.HKEY_LOCAL_MACHINE, winreg.HKEY_CURRENT_USER]:
                try:
                    with winreg.OpenKey(key, reg_path) as k:
                        val, _ = winreg.QueryValueEx(k, "")
                        if val and os.path.exists(val):
                            browsers.append((name, val))
                            break # Found for this browser type, skip other registry hive
                except Exception:
                    pass

    # Hardcoded check fallbacks
    fallbacks = [
        ("Google Chrome", r"D:\Program Files\Google\Chrome\Application\chrome.exe"),
        ("Google Chrome", r"D:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
        ("Google Chrome", r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
        ("Google Chrome", r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
        ("Google Chrome", os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe")),
        ("Microsoft Edge", r"D:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
        ("Microsoft Edge", r"D:\Program Files\Microsoft\Edge\Application\msedge.exe"),
        ("Microsoft Edge", r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
        ("Microsoft Edge", r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
        ("Microsoft Edge", os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe")),
    ]
    
    # Add if not already found in registry
    found_names = [b[0] for b in browsers]
    for name, path in fallbacks:
        if name not in found_names and os.path.exists(path):
            browsers.append((name, path))
            found_names.append(name)
            
    return browsers


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


def check_existing_session(browser_path, user_dir, port):
    cmd = [
        browser_path,
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "https://chatgpt.com/",
    ]
    try:
        proc = subprocess.Popen(cmd)
    except Exception:
        return None

    targets = []
    for _ in range(8):
        try:
            req = urllib.request.urlopen(f"http://127.0.0.1:{port}/json")
            targets = json.loads(req.read().decode('utf-8'))
            break
        except Exception:
            time.sleep(0.5)

    auth_data = None
    if targets:
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
        chatgpt_target = None
        for t in targets:
            if t.get("type") == "page" and "chatgpt.com" in t.get("url", "").lower():
                chatgpt_target = t
                break
        if chatgpt_target:
            ws_url = chatgpt_target.get("webSocketDebuggerUrl")
            if ws_url:
                try:
                    eval_res = evaluate_js(ws_url, js_expr)
                    res_val = eval_res.get("result", {}).get("value", {})
                    if isinstance(res_val, dict) and res_val.get("success"):
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
                            "last_refresh": int(time.time())
                        }
                except Exception:
                    pass

    try:
        proc.terminate()
        proc.wait(timeout=2)
    except:
        pass

    return auth_data


def run_auto_retrieve():
    browsers = scan_installed_browsers()
    if not browsers:
        print("\033[91m[自动获取] 错误：未在您的电脑中检测到安装的 Chrome 或 Edge 浏览器。\033[0m")
        return None
        
    print("\n\033[96m[系统扫描] 检测到您电脑中安装了以下浏览器：\033[0m")
    for idx, (name, path) in enumerate(browsers):
        print(f"  [{idx + 1}] {name} (安装路径: {path})")
        
    choice = 0
    if len(browsers) > 1:
        while True:
            try:
                ans = input(f"\n请选择您已登录 ChatGPT 的浏览器序号 (1-{len(browsers)}) [默认 1]: ").strip()
                if not ans:
                    choice = 0
                    break
                choice_idx = int(ans) - 1
                if 0 <= choice_idx < len(browsers):
                    choice = choice_idx
                    break
                else:
                    print(f"输入错误：请输入 1 到 {len(browsers)} 之间的数字。")
            except ValueError:
                print("输入错误：请输入有效的数字。")
    else:
        print(f"\n系统仅检测到单个支持的浏览器，将自动使用: {browsers[0][0]}")
        
    browser_name, browser_path = browsers[choice]
    print(f"\033[92m已选择并绑定浏览器: {browser_name}\033[0m")
        
    port = 9333
    user_dir = Path.home() / ".codex" / "browser_session"
    user_dir.mkdir(parents=True, exist_ok=True)

    print("\033[94m[自动获取] 正在检查当前浏览器会话登录状态...\033[0m")
    auth_data = check_existing_session(browser_path, user_dir, port)
    if auth_data:
        print("\033[92m[自动获取] ✓ 检测到当前已有活跃的登录会话！无需重复登录，已自动提取 Token。\033[0m")
        return auth_data

    print("\n\033[96m[自动获取] 🚀 正在为您拉起 ChatGPT 登录浏览器窗口...\033[0m")
    print("\033[94m============================================================\033[0m")
    print("\033[92m 【第一步】请在弹出的浏览器窗口中登录您的 ChatGPT 账号。 (支持 Plus 套餐)\033[0m")
    print("\033[92m 【第二步】登录成功并进入聊天界面（确保页面能正常聊天）后，\033[0m")
    print("\033[91m          请直接【手动关闭该浏览器窗口】！本工具将自动提取 Token！\033[0m")
    print("\033[94m============================================================\033[0m")
    
    cmd_normal = [
        browser_path,
        f"--user-data-dir={user_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "https://chatgpt.com/",
    ]
    try:
        proc = subprocess.Popen(cmd_normal)
    except Exception as e:
        print(f"\033[91m[自动获取] 启动浏览器失败: {e}\033[0m")
        return None

    try:
        proc.wait()
    except KeyboardInterrupt:
        print("\n\033[93m[自动获取] 用户手动取消了登录。\033[0m")
        try:
            proc.terminate()
        except:
            pass
        return None

    print("\n\033[96m[自动获取] 检测到浏览器已关闭。正在重新启动后台服务以提取 Token...\033[0m")

    cmd_debug = [
        browser_path,
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "https://chatgpt.com/",
    ]
    try:
        proc_debug = subprocess.Popen(cmd_debug)
    except Exception as e:
        print(f"\033[91m[自动获取] 启动后台提取浏览器失败: {e}\033[0m")
        return None

    auth_data = None
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
    try:
        while time.time() - start_time < 30:
            targets = []
            try:
                req = urllib.request.urlopen(f"http://127.0.0.1:{port}/json")
                targets = json.loads(req.read().decode('utf-8'))
            except Exception:
                time.sleep(1)
                continue

            chatgpt_target = None
            for t in targets:
                if t.get("type") == "page" and "chatgpt.com" in t.get("url", "").lower():
                    chatgpt_target = t
                    break

            if not chatgpt_target:
                time.sleep(1)
                continue

            ws_url = chatgpt_target.get("webSocketDebuggerUrl")
            if not ws_url:
                time.sleep(1)
                continue

            try:
                eval_res = evaluate_js(ws_url, js_expr)
                res_val = eval_res.get("result", {}).get("value", {})
                if isinstance(res_val, dict) and res_val.get("success"):
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
                        "last_refresh": int(time.time())
                    }
                    print("\033[92m[自动获取] ✓ 成功获取 Token！\033[0m")
                    break
            except Exception:
                pass
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\033[93m[自动获取] 提取被用户取消。\033[0m")
    finally:
        try:
            proc_debug.terminate()
            proc_debug.wait(timeout=2)
        except:
            pass

    return auth_data


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
        # PATH first: npm -g / homebrew / pipx installs all end up here
        codex_in_path = shutil.which("codex")
        if codex_in_path:
            return Path(codex_in_path)
        # Common macOS install locations (Intel and Apple Silicon homebrew prefixes)
        paths = [
            Path("/usr/local/bin/codex"),
            Path("/opt/homebrew/bin/codex"),
            Path.home() / ".local" / "bin" / "codex",
        ]
        for p in paths:
            if p.exists():
                return p
        return None

    paths = [
        Path.home() / "AppData" / "Local" / "OpenAI" / "Codex" / "bin" / "codex.exe",
        Path("C:/Users") / os.getlogin() / "AppData" / "Local" / "OpenAI" / "Codex" / "bin" / "codex.exe",
    ]
    for p in paths:
        if p.exists():
            return p
    return None


def optimize_config_toml(plan_type):
    """Automatically optimizes config.toml model configurations based on the user's plan tier."""
    config_path = Path.home() / ".codex" / "config.toml"
    if not config_path.exists():
        return
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        modified = False
        new_lines = []
        for line in lines:
            stripped = line.strip()
            if stripped.startswith("model ="):
                # Downgrade to lightweight mini models for free accounts to ensure access
                if plan_type == "free":
                    new_lines.append('model = "gpt-5-codex-mini"\n')
                    modified = True
                else:
                    new_lines.append('model = "gpt-5.5"\n')
                    modified = True
            elif stripped.startswith("model_reasoning_effort ="):
                if plan_type == "free":
                    new_lines.append('model_reasoning_effort = "low"\n')
                    modified = True
                else:
                    new_lines.append('model_reasoning_effort = "xhigh"\n')
                    modified = True
            else:
                new_lines.append(line)
                
        if modified:
            # Backup config.toml
            bak_path = config_path.with_name("config.toml.bak")
            shutil.copyfile(config_path, bak_path)
            with open(config_path, "w", encoding="utf-8") as f:
                f.writelines(new_lines)
            print(f"[自适应优化] 检测到您的账户为 {plan_type} 订阅，已自动优化 config.toml 的模型参数！")
    except Exception as e:
        print(f"[自适应警告] 自动优化 config.toml 失败: {e}")


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
        
        # Trigger dynamic model optimization based on plan type
        tokens = auth_data.get("tokens", {})
        access_token = tokens.get("access_token")
        plan_type = "free"
        try:
            parts = access_token.split('.')
            if len(parts) == 3:
                payload_b64 = parts[1]
                padding = 4 - len(payload_b64) % 4
                if padding != 4:
                    payload_b64 += "=" * padding
                payload_bytes = base64.urlsafe_b64decode(payload_b64)
                payload = json.loads(payload_bytes.decode('utf-8'))
                plan_type = payload.get("https://api.openai.com/auth", {}).get("chatgpt_plan_type", "free")
        except Exception:
            pass
        optimize_config_toml(plan_type)
        
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
    codex_path = locate_codex_bin()

    # On macOS the desktop app is a bundle; it can exist with no CLI on PATH
    codex_app = None
    if sys.platform == "darwin":
        for candidate in ["/Applications/Codex.app", os.path.expanduser("~/Applications/Codex.app")]:
            if os.path.exists(candidate):
                codex_app = candidate
                break

    if not codex_path and not codex_app:
        return

    choice = input("\nWould you like to launch Codex Desktop now? (y/n): ").strip().lower()
    if choice in ['y', 'yes', '']:
        print("[Launch] Starting Codex Desktop...")
        try:
            if codex_app:
                subprocess.Popen(["open", codex_app])
            elif sys.platform == "win32":
                subprocess.Popen([str(codex_path), "app"], creationflags=subprocess.CREATE_NEW_CONSOLE)
            else:
                subprocess.Popen([str(codex_path), "app"])
            print("[Launch] Codex Desktop process spawned. Happy coding!")
        except Exception as e:
            print(f"[Error] Failed to start Codex: {e}")


def graft_with_cloudflare(auth_data, worker_url):
    import urllib.request
    import json
    
    graft_url = f"{worker_url}/graft"
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "access_token": auth_data["tokens"]["access_token"],
        "account_id": auth_data["tokens"]["account_id"]
    }
    
    req_data = json.dumps(payload).encode("utf-8")
    
    print("\033[94m[授权嫁接] 正在通过云端免验证服务嫁接凭证...\033[0m")
    try:
        req = urllib.request.Request(graft_url, data=req_data, headers=headers, method="POST")
        with urllib.request.urlopen(req) as response:
            final_auth_data = json.loads(response.read().decode("utf-8"))
            return final_auth_data
    except Exception as e:
        print(f"\033[91m[错误] 提交授权失败: {e}\033[0m")
        return None


def main():
    # Force output encoding to UTF-8 on Windows
    if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding='utf-8')
        
    print_banner()
    
    auth_data = None
    
    # Start auto-retrieve directly without menus
    print("\033[94m正在为您启动一键免手机验证登录获取流程...\033[0m")
    
    try:
        auth_data = run_auto_retrieve()
    except KeyboardInterrupt:
        print("\n\033[93m[提示] 自动获取已取消，正在切换至手动模式...\033[0m")
        auth_data = None
    except Exception as e:
        print(f"\n\033[91m[提示] 自动获取失败 ({e})，正在切换至手动模式...\033[0m")
        auth_data = None
        
    if not auth_data:
        # Fallback to manual clipboard or paste mode
        if HAS_PYPERCLIP:
            print("\n\033[96m[剪贴板] 正在检查剪贴板中是否存在有效的 Token JSON...\033[0m")
            clipboard_content = pyperclip.paste().strip()
            if clipboard_content.startswith("{") and "auth_mode" in clipboard_content and "access_token" in clipboard_content:
                try:
                    temp_data = json.loads(clipboard_content)
                    if temp_data.get("tokens", {}).get("access_token"):
                        print("\n\033[92m[剪贴板] 发现剪贴板中已存在有效的免接码 Token 配置！\033[0m")
                        confirm = input("是否直接应用该剪贴板配置？(Y/n): ").strip().lower()
                        if confirm in ['y', 'yes', '']:
                            auth_data = temp_data
                except Exception:
                    pass
                    
        if not auth_data:
            if HAS_PYPERCLIP:
                print("\033[93m[剪贴板] 剪贴板中未包含有效的配置 JSON，请使用以下手动提取方式：\033[0m")
            else:
                print("\033[93m[剪贴板] 未检测到 pyperclip 模块，请使用以下手动提取方式：\033[0m")
                
            print("\n\033[94m========================= 【手动提取步骤】 =========================\033[0m")
            print("1. 在您的默认浏览器中登录：https://chatgpt.com/")
            print("2. 按 F12 键打开“开发者工具”并切换到 Console（控制台）面板。")
            print("3. 复制 codex_session_extractor.js 脚本中的全部代码粘贴进控制台，并回车运行。")
            print("4. 控制台会自动提示复制成功。回到本窗口，直接在下方粘贴并回车即可！")
            print("\033[94m====================================================================\033[0m")
            print("\n请在下方粘贴浏览器控制台输出的完整 JSON 内容（完成后按一次回车或按 Ctrl+Z + 回车）：")
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
                print("\033[91m[Error] 未检测到任何输入，正在退出程序...\033[0m")
                sys.exit(1)
                
            try:
                auth_data = json.loads(full_input)
            except json.JSONDecodeError as e:
                print(f"\033[91m[Error] JSON 格式解析失败: {e}\033[0m")
                sys.exit(1)

    # Validate JSON keys first
    tokens = auth_data.get("tokens", {})
    access_token = tokens.get("access_token")
    
    if not access_token:
        print("\033[91m[Error] 无效的配置数据：缺少 'tokens.access_token'。请确保复制了完整的 JSON。\033[0m")
        sys.exit(1)
        
    # Check JWT Expiration
    ok, message = check_jwt_expiry(access_token)
    print(f"\n[JWT Status] {message}")
    if not ok:
        print("\033[91m[Error] Token 已过期。请登录 https://chatgpt.com/ 提取最新的 Token。\033[0m")
        sys.exit(1)

    # Graft via Cloudflare Worker statelessly (Zero-config & Zero-key)
    worker_url = "https://codex-sync-worker.epidemicsituation.workers.dev"
    final_auth_data = graft_with_cloudflare(auth_data, worker_url)
    if not final_auth_data:
        sys.exit(1)
        
    # Run the setup
    success = run_login_bypass(final_auth_data)
    if success:
        prompt_launch_codex()
    else:
        print("\n\033[91m[Error] 配置写入失败。请检查权限与输入后重试。\033[0m")
        sys.exit(1)



if __name__ == "__main__":
    main()
