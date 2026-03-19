#!/usr/bin/env python3
import io
import json
import os
import re
import urllib.error
import urllib.request
import zipfile
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "8765"))

GEMINI_MODEL = "gemini-3-flash-preview"
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
)

OPENAI_TTS_MODEL = "gpt-4o-mini-tts-2025-03-20"
OPENAI_TTS_VOICE = "coral"
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "YOUR_OPENAI_API_KEY_HERE")
OPENAI_TTS_ENDPOINT = "https://api.openai.com/v1/audio/speech"

DEFAULT_GEMINI_PROMPT = """你是我的学习听写助手。识别图片中的题目，解出每道题，输出能拿满分的完整答案。

重要：输出将直接交给TTS语音合成朗读，我边听边写在试卷上。TTS对单个字母容易漏读，所以你必须用特殊格式确保每个字母都被读出来。

===== TTS防漏读规则（最重要）=====

1. 单字母变量必须加前缀。所有单字母变量前面加上【字母】二字，让TTS不会跳过：
字母w，字母q，字母n，字母R，字母T，字母P，字母V，字母E，字母S，字母G，字母H，字母C，字母m，字母v

2. 连续变量之间用【乘以】隔开，绝不连写：
nRT 要说成：字母n，乘以，字母R，乘以，字母T
PV 要说成：字母P，乘以，字母V
绝不能写成 nRT 或 PV 让TTS自己读

3. 数字和单位之间必须加逗号停顿：
八十六点三，j
零点二九零，j per K
零点五零，L atm
二百九十八，K
绝不能写成 八十六点三j（没有逗号TTS会吞掉单位）

4. 每个公式步骤用句号结尾，创造停顿：
字母w，等于，负的，字母n，乘以，字母R，乘以，字母T，乘以，ln，左括号，字母V下标二，除以，字母V下标一，右括号。

5. 下标用【下标】加中文数字：
V1 说成 字母V下标一
V2 说成 字母V下标二
Cp 说成 字母C下标p
Pext 说成 字母P下标ext

===== 语言规则 =====

中文念的部分：
题号：第一题、第二题
子问题：第一小问、第二小问（不要用 i ii iii）
数字：九点九零、一百八十四、零点一二九、负三点五
科学计数法：三点零乘以十的八次方
运算符：加、减、乘以、除以、等于
括号：左括号、右括号
次方：的平方、的立方
分数：二分之一、四分之三
连接词：所以、得到、代入

单位念缩写，不翻译成全称：
j 不说 joules，kg 不说 kilograms，mol 不说 moles
m per s 不说 meters per second
L，Pa，N，W，Hz，atm，mL，g，kJ，cm，nm，K，degrees C

数学函数直接念英文缩写不翻译：
ln，log，sin，cos，tan，delta

念英文的部分：
变量名（带字母前缀）
选择题填空题简答题的答案内容
化学式和化学名词
希腊字母念英文：delta，alpha，beta，gamma

===== 题型输出规则 =====

计算题：直接写解题步骤，精简但完整，能拿满分。不要说根据某某公式、由题意知这类解释。
示例：第二题，第一小问。字母w，等于，负的，字母n，乘以，字母R，乘以，字母T，乘以，ln，左括号，字母V下标二，除以，字母V下标一，右括号。字母w，等于，负的，零点一零零，乘以，八点三一四，乘以，二百九十八，乘以，ln，左括号，一点七零，除以，一点二零，右括号。等于，负八十六点三，j。

选择题：说选哪个，念该选项内容。
示例：第五题，选B，the reaction is exothermic because delta H is negative。

填空题：按顺序念答案。
示例：第二题，第一个空，二百七十三，K。第二个空，零点零八二一，L atm per mol per K。

简答题：念完整英文答案。
示例：第一题。The equilibrium shifts to the right because increasing temperature favors the endothermic direction according to Le Chatelier principle.

判断题：说 true 或 false，加理由。
示例：第四题，false, because the boiling point increases with stronger intermolecular forces.

===== 绝对禁止 =====
不输出题目本身，只输出答案
不输出任何数学符号
不输出解释性废话
不输出 markdown 格式
不连写多个变量字母
每个字都是要写在答题纸上的
"""

DEFAULT_TTS_INSTRUCTIONS = """你是听写助手，逐字朗读文本让学生抄写。最重要的规则：绝不跳过任何文字，每一个字、每一个字母、每一个单位都必须读出来。遇到【字母】加单个英文字母时，清晰读出该字母。用清晰、缓慢、沉稳的语速朗读。每道题之间停顿两秒。逗号处短暂停顿，句号处停顿一秒。数字和单位之间的逗号也要停顿。遇到英文单词时自然切换为标准英文发音。整体节奏像老师在课堂上念题。"""


def read_static_file(name: str) -> bytes:
    return (STATIC_DIR / name).read_bytes()


def json_bytes(payload) -> bytes:
    return json.dumps(payload, ensure_ascii=False).encode("utf-8")


def http_json_request(url: str, payload: dict, headers: dict) -> tuple[int, dict, bytes]:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.getcode(), dict(response.headers.items()), response.read()


def normalize_newlines(value: str) -> str:
    return value.replace("\r\n", "\n").replace("\r", "\n")


def extract_gemini_text(payload: dict) -> str:
    candidates = payload.get("candidates") or []
    if not candidates:
        return ""
    parts = candidates[0].get("content", {}).get("parts", [])
    texts = [part.get("text", "") for part in parts if isinstance(part, dict) and part.get("text")]
    return "\n".join(texts).strip()


def sanitize_prompt_for_android(prompt: str) -> str:
    sanitized = normalize_newlines(prompt)
    sanitized = sanitized.replace("\\", "\\\\")
    sanitized = sanitized.replace('"', "")
    sanitized = sanitized.replace("'", "")
    sanitized = sanitized.replace("\t", " ")
    return sanitized.replace("\n", "\\n")


def sanitize_tts_instructions_for_android(instructions: str) -> str:
    sanitized = normalize_newlines(instructions)
    sanitized = sanitized.replace("\t", " ")
    sanitized = sanitized.replace("\n", " ")
    sanitized = re.sub(r" {2,}", " ", sanitized)
    sanitized = sanitized.strip()

    # The instructions string lives inside shell double quotes and must still be
    # valid JSON after the shell removes one layer of escaping.
    json_escaped = json.dumps(sanitized, ensure_ascii=False)[1:-1]
    shell_safe = json_escaped.replace("\\", "\\\\")
    shell_safe = shell_safe.replace('"', '\\"')
    shell_safe = shell_safe.replace("$", "\\$")
    shell_safe = shell_safe.replace("`", "\\`")
    return shell_safe


def build_gemini_script(prompt: str) -> str:
    safe_prompt = sanitize_prompt_for_android(prompt)
    return f"""#!/system/bin/sh
api_key="{GEMINI_API_KEY}"
image_path="{{file_path}}"
temp_json="/sdcard/gemini_request.json"
echo '{{
  "contents": [
    {{
      "parts": [
        {{
          "text": "{safe_prompt}"
        }},
        {{
          "inline_data": {{
            "mime_type": "image/jpeg",
            "data": "' > "$temp_json"
base64 -w 0 "$image_path" >> "$temp_json"
echo '"
          }}
        }}
      ]
    }}
  ],
  "generationConfig": {{
    "maxOutputTokens": 8192,
    "thinkingConfig": {{
      "includeThoughts": false,
      "thinkingLevel": "high"
    }},
    "temperature": 1.0
  }}
}}' >> "$temp_json"
curl -k -s -X POST \\
  -H "Content-Type: application/json" \\
  -d @"$temp_json" \\
  "{GEMINI_ENDPOINT}"
"""


def build_tts_script(instructions: str) -> str:
    safe_instructions = sanitize_tts_instructions_for_android(instructions)
    return f"""#!/system/bin/sh
OPENAI_KEY="{OPENAI_API_KEY}"
TEXT="{{lv=ai_speak}}"
OUTPUT="/storage/emulated/0/MacroDroid/tts_output.mp3"
rm -f "$OUTPUT"
if [ -z "$TEXT" ]; then
  echo "Error: Input text is empty"
  exit 1
fi
CLEAN_TEXT=$(echo "$TEXT" | sed 's/\\\\/\\\\\\\\/g' | sed 's/"/\\\\"/g' | sed 's/\\t/ /g' | tr '\\n' ' ')
curl -s {OPENAI_TTS_ENDPOINT} \\
  -H "Authorization: Bearer $OPENAI_KEY" \\
  -H "Content-Type: application/json" \\
  -d "{{
    \\"model\\": \\"{OPENAI_TTS_MODEL}\\",
    \\"input\\": \\"$CLEAN_TEXT\\",
    \\"voice\\": \\"{OPENAI_TTS_VOICE}\\",
    \\"instructions\\": \\"{safe_instructions}\\"
  }}" \\
  --output "$OUTPUT"
if [ -s "$OUTPUT" ]; then
  FIRST_CHAR=$(head -c 1 "$OUTPUT")
  if [ "$FIRST_CHAR" = "{{" ]; then
    echo "TTS Error: $(cat "$OUTPUT")"
    rm -f "$OUTPUT"
    exit 1
  fi
  exit 0
else
  echo "TTS Failed"
  exit 1
fi
"""


class AppHandler(BaseHTTPRequestHandler):
    server_version = "StudyDictationHelper/1.0"

    def log_message(self, format, *args):
        return

    def do_GET(self):
        if self.path == "/":
            self._send_bytes(read_static_file("index.html"), "text/html; charset=utf-8")
            return
        if self.path == "/static/styles.css":
            self._send_bytes(read_static_file("styles.css"), "text/css; charset=utf-8")
            return
        if self.path == "/static/app.js":
            self._send_bytes(read_static_file("app.js"), "application/javascript; charset=utf-8")
            return
        if self.path == "/api/defaults":
            self._send_json(
                {
                    "geminiPrompt": DEFAULT_GEMINI_PROMPT,
                    "ttsInstructions": DEFAULT_TTS_INSTRUCTIONS,
                    "geminiModel": GEMINI_MODEL,
                    "ttsModel": OPENAI_TTS_MODEL,
                    "ttsVoice": OPENAI_TTS_VOICE,
                }
            )
            return
        if self.path == "/health":
            self._send_json({"ok": True})
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def do_POST(self):
        if self.path == "/api/gemini":
            self._handle_gemini()
            return
        if self.path == "/api/tts":
            self._handle_tts()
            return
        if self.path == "/api/export":
            self._handle_export()
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Not found")

    def _read_json(self) -> dict:
        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length)
        if not raw_body:
            return {}
        return json.loads(raw_body.decode("utf-8"))

    def _send_json(self, payload: dict, status: int = 200):
        self._send_bytes(json_bytes(payload), "application/json; charset=utf-8", status=status)

    def _send_bytes(self, payload: bytes, content_type: str, status: int = 200, extra_headers=None):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        if extra_headers:
            for key, value in extra_headers.items():
                self.send_header(key, value)
        self.end_headers()
        self.wfile.write(payload)

    def _error(self, message: str, status: int = 400, detail=None):
        payload = {"error": message}
        if detail is not None:
            payload["detail"] = detail
        self._send_json(payload, status=status)

    def _handle_gemini(self):
        try:
            payload = self._read_json()
            prompt = (payload.get("prompt") or "").strip()
            image_base64 = payload.get("imageBase64") or ""
            image_mime = payload.get("imageMimeType") or "image/jpeg"
            if not prompt:
                self._error("Prompt 不能为空。")
                return
            if not image_base64:
                self._error("请先选择一张图片。")
                return

            request_payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": image_mime,
                                    "data": image_base64,
                                }
                            },
                        ]
                    }
                ],
                "generationConfig": {
                    "maxOutputTokens": 8192,
                    "thinkingConfig": {
                        "includeThoughts": False,
                        "thinkingLevel": "high",
                    },
                    "temperature": 1.0,
                },
            }
            _, _, raw_response = http_json_request(
                GEMINI_ENDPOINT,
                request_payload,
                {"Content-Type": "application/json"},
            )
            response_payload = json.loads(raw_response.decode("utf-8"))
            text = extract_gemini_text(response_payload)
            self._send_json({"text": text, "raw": response_payload})
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            self._error("Gemini 请求失败。", status=exc.code, detail=detail)
        except urllib.error.URLError as exc:
            self._error("Gemini 网络请求失败。", status=502, detail=str(exc.reason))
        except Exception as exc:
            self._error("Gemini 请求处理失败。", status=500, detail=str(exc))

    def _handle_tts(self):
        try:
            payload = self._read_json()
            text = (payload.get("text") or "").strip()
            instructions = (payload.get("instructions") or "").strip()
            if not text:
                self._error("没有可朗读的文本。")
                return
            if not instructions:
                self._error("TTS instructions 不能为空。")
                return

            request_payload = {
                "model": OPENAI_TTS_MODEL,
                "input": text,
                "voice": OPENAI_TTS_VOICE,
                "instructions": instructions,
            }
            request = urllib.request.Request(
                OPENAI_TTS_ENDPOINT,
                data=json.dumps(request_payload, ensure_ascii=False).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )
            with urllib.request.urlopen(request, timeout=180) as response:
                raw_audio = response.read()
                content_type = response.headers.get("Content-Type", "audio/mpeg")

            if raw_audio.startswith(b"{"):
                detail = raw_audio.decode("utf-8", errors="replace")
                self._error("TTS API 返回了 JSON 错误。", status=502, detail=detail)
                return

            self._send_bytes(raw_audio, content_type, extra_headers={"Content-Disposition": 'inline; filename="tts-output.mp3"'})
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            self._error("TTS 请求失败。", status=exc.code, detail=detail)
        except urllib.error.URLError as exc:
            self._error("TTS 网络请求失败。", status=502, detail=str(exc.reason))
        except Exception as exc:
            self._error("TTS 请求处理失败。", status=500, detail=str(exc))

    def _handle_export(self):
        try:
            payload = self._read_json()
            prompt = payload.get("prompt") or DEFAULT_GEMINI_PROMPT
            instructions = payload.get("instructions") or DEFAULT_TTS_INSTRUCTIONS

            gemini_script = build_gemini_script(prompt)
            tts_script = build_tts_script(instructions)

            buffer = io.BytesIO()
            with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
                archive.writestr("gemini_ocr.sh", gemini_script)
                archive.writestr("tts_openai.sh", tts_script)
                archive.writestr(
                    "README.txt",
                    "Exported by Study Dictation Helper.\n"
                    "The Gemini prompt was flattened to a single JSON-safe line.\n"
                    "ASCII single and double quotes are stripped from the Gemini prompt for Android /system/bin/sh safety.\n"
                    "TTS instructions were escaped for the shell JSON payload.\n",
                )
            archive_bytes = buffer.getvalue()
            self._send_bytes(
                archive_bytes,
                "application/zip",
                extra_headers={"Content-Disposition": 'attachment; filename="study-dictation-scripts.zip"'},
            )
        except Exception as exc:
            self._error("导出脚本失败。", status=500, detail=str(exc))


def main():
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f"Study Dictation Helper running at http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
