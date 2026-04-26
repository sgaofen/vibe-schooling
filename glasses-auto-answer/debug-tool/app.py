#!/usr/bin/env python3
import base64
import io
import json
import mimetypes
import os
import re
import urllib.error
import urllib.request
import uuid
import zipfile
from html import escape as xml_escape
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


def _load_azure_credentials() -> tuple[str, str]:
    """Pull AZURE_SPEECH_KEY + AZURE_SPEECH_REGION from env or ~/.azure-tts.env.

    The fallback file matches the convention used by paper-extractor's TTS
    helpers — keeps a single source of truth on the dev machine.
    """
    key = os.environ.get("AZURE_SPEECH_KEY", "").strip()
    region = os.environ.get("AZURE_SPEECH_REGION", "").strip()
    if key and region:
        return key, region
    cfg = Path.home() / ".azure-tts.env"
    if cfg.exists():
        for line in cfg.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^\s*([A-Z_]+)\s*=\s*(.+?)\s*$", line)
            if not m:
                continue
            name, val = m.group(1), m.group(2).strip().strip("'").strip('"')
            if name == "AZURE_SPEECH_KEY" and not key:
                key = val
            elif name == "AZURE_SPEECH_REGION" and not region:
                region = val
    return key, region


AZURE_SPEECH_KEY, AZURE_SPEECH_REGION = _load_azure_credentials()
AZURE_TTS_VOICE = os.environ.get("AZURE_TTS_VOICE", "zh-CN-XiaoxiaoNeural")
AZURE_TTS_RATE = os.environ.get("AZURE_TTS_RATE", "-25%")
AZURE_TTS_OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3"


def azure_tts_endpoint() -> str:
    region = AZURE_SPEECH_REGION or "westus2"
    return f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"


# Optional Stage A page-extractor (paper-extractor FastAPI service).
# Leave blank to disable the "预处理" feature.
EXTRACTOR_URL = os.environ.get("EXTRACTOR_URL", "").rstrip("/")

DEFAULT_GEMINI_PROMPT = """你是我的学习听写助手。识别图片中的题目，解出每道题，输出能拿满分的完整答案。

输出将直接交给TTS语音朗读，我边听边写在试卷上。所以你的输出必须：简洁、直接、容易跟着写。

===== 第一步：判断每道题（和每个小问）的题型 =====

同一道大题的不同小问可能是不同题型，必须分别判断。

【选择题】有 A B C D E 选项
→ 只说选哪个和选项内容。绝不展开计算。
示例：第一题，选A，一点二，atm。

【计算题】需要写出公式和计算步骤
→ 用下方的TTS公式格式，精简完整，每步用句号加【下一行】隔开。

【改错题】划掉错误词汇并替换
→ 只说划掉什么、改成什么。
示例：a小问，划掉 convergent，改成 homologous。

【画图题】要求画图、sketch、draw（包括曲线、柱状图、分布图等）
→ 用中文描述怎么画，关键术语用英文。描述要具体到能直接照着画：位置、方向、形状、数值。
示例：大种群那条线从零点五开始，在零点五附近小幅波动，基本水平。小种群那条线从零点五开始，大幅随机波动，最终到达一点零或者零点零。
示例：第二个柱子，invasive species，画在零线下面。第三个柱子，elephant reintroduction，画在零线上面。
示例：Species A 的曲线向左移动，peak 在 50 cm 左右。Species B 的曲线向右移动，peak 在 200 cm 左右。

【填空题】
→ 按顺序念答案。
示例：第一个空，二七三，K。第二个空，零点零八二一，L atm per mol K。

【简答题】需要写完整句子回答
→ 用自然英文念答案。数字用英文念。不用"字母"前缀，不用中文数字。
示例：The large population maintains allele frequency near 0.5 because genetic drift has minimal effect. The small population experiences strong drift, causing frequency to fluctuate randomly and eventually fix or be lost.

===== TTS公式格式（仅用于计算题的公式推导）=====

简答题、改错题、画图题不要用这些规则。

1. 单字母变量加【字母】前缀：字母w，字母q，字母n，字母R，字母T，字母P，字母V，字母E，字母S，字母G，字母H，字母C，字母m，字母v
2. 连续变量用【乘以】隔开：nRT → 字母n，乘以，字母R，乘以，字母T
3. 数字和单位之间加逗号：二九八，K。不能写成 二九八K
4. 句号结尾创造停顿，句号后说【下一行】换行
示例（复杂公式）：字母w，等于，负的，字母n，乘以，字母R，乘以，字母T，乘以，ln，左括号，字母V下标二，除以，字母V下标一，右括号。
5. 标准态 ° 念 degree，下标 rxn 念 下标rxn：delta，字母H，degree，下标rxn
6. 题目中的下标都要念：rxn、f、fus、p、ext等
7. 同一题中同字母大小写都出现时，第一次标注大写或小写
8. 数字逐位连写，内部不加任何标点：二九八点三七、一零二四、零点一二九、负三点五。错误示范：二，九，八，点，三，七（绝对禁止）
9. 小数点用【点】，绝不用【占】
10. 运算符用中文：加、减、乘以、除以、等于、负。绝不用 negative、plus、minus、equals
11. 连接词用中文：所以、得到、代入
12. 容易混淆的单位用中文：kJ念千焦，kg念千克，kPa念千帕
13. 括号：左括号、右括号
14. 次方：的平方、的立方
15. 分数：二分之一、四分之三
16. 科学计数法：三点零乘以一零的八次方
17. 数学函数直接念英文不翻译：ln、log、sin、cos、tan、delta
18. 单位念缩写不翻译全称：j不说joules，mol不说moles，L、Pa、atm、g、cm、K、degrees C
19. 有单位的数值必须带单位
20. 温度转换用273.15：二五，degrees C，加，二七三点一五，等于，二九八点一五，K

===== 计算题核心原则 =====

精简、完整、满分。每个字都是写在答题纸上的，没有废话。

如果要求计算多个量，每个都给完整过程，不能只给最终结果。

示例（熵变计算）：
第一题。下一行。
delta，字母S，等于，字母q下标rev，除以，字母T，等于，字母n，乘以，delta，字母H下标fus，除以，字母T。下一行。
字母T，等于，负八九点五，加，二七三点一五，等于，一八三点六五，K。下一行。
delta，字母S，等于，一点零零，mol，乘以，五三七零，j per mol，除以，一八三点六五，K，等于，二九点二四，j per K。

示例（自由能计算）：
delta，字母G，degree，等于，delta，字母H，degree，减，字母T，乘以，delta，字母S，degree。下一行。
delta，字母G，degree，等于，负二二一七，千焦，减，二九八，K，乘以，零点一零一一，千焦 per K，等于，负二二四七点一，千焦。

===== 格式规则 =====

题号：第一题、第二题
子问题：题目用 a b c 的说 a小问、b小问；用 i ii iii 的说 第一小问、第二小问；用 A B C 的说 大A、大B

计算题中绝不能切换成英文句式。运算符永远中文。
简答题中用自然英文，不插入中文数字或字母前缀。
画图题中用中文指导，关键英文术语保持英文。

===== 绝对禁止 =====
不输出题目本身
不输出数学符号（+−×÷=等）
不输出 markdown 格式
不在选择题中展开计算步骤
不在简答题中使用TTS公式格式
不用中文描述代替公式（如"反应物键能总和"）
不连写多个变量字母
不在数字内部加逗号或任何标点（二九八点三七，不是二，九，八，点，三，七）
不输出解释性废话
每个字都是要写在答题纸上的
"""


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
    "maxOutputTokens": 65536,
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


def build_tts_script() -> str:
    """Generate the on-device Azure Speech REST call.

    The script reads the Gemini text from the {{lv=ai_speak}} MacroDroid
    variable, XML-escapes it, and POSTs SSML to Azure. Output goes straight to
    the mp3 file MacroDroid plays.
    """
    return f"""#!/system/bin/sh
TTS_KEY="{AZURE_SPEECH_KEY or 'REPLACE_WITH_YOUR_AZURE_KEY'}"
TTS_REGION="{AZURE_SPEECH_REGION or 'westus2'}"
TTS_VOICE="{AZURE_TTS_VOICE}"
TTS_RATE="{AZURE_TTS_RATE}"
TTS_URL="https://${{TTS_REGION}}.tts.speech.microsoft.com/cognitiveservices/v1"

ai_speak="{{{{lv=ai_speak}}}}"
temp_tts="/sdcard/tts_request.xml"
OUTPUT="/storage/emulated/0/MacroDroid/tts_output.mp3"
rm -f "$OUTPUT"

if [ -z "$ai_speak" ]; then
  echo "Error: Input text is empty"
  exit 1
fi

# XML-escape the Gemini text. Order matters: & first, then < > "
CLEAN_TEXT=$(printf '%s' "$ai_speak" \\
  | tr '\\n' ' ' \\
  | sed 's/[\\\\]n/ /g' \\
  | sed 's/[\\\\]t/ /g' \\
  | sed 's/[\\\\]r//g' \\
  | sed 's/&/\\&amp;/g' \\
  | sed 's/</\\&lt;/g' \\
  | sed 's/>/\\&gt;/g' \\
  | sed 's/"/\\&quot;/g')

printf '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN"><voice name="%s"><prosody rate="%s">%s</prosody></voice></speak>' \\
  "$TTS_VOICE" "$TTS_RATE" "$CLEAN_TEXT" > "$temp_tts"

curl -s --max-time 60 "$TTS_URL" \\
  -H "Ocp-Apim-Subscription-Key: $TTS_KEY" \\
  -H "Content-Type: application/ssml+xml" \\
  -H "X-Microsoft-OutputFormat: {AZURE_TTS_OUTPUT_FORMAT}" \\
  -H "User-Agent: macrodroid" \\
  --data-binary @"$temp_tts" \\
  --output "$OUTPUT"

if [ -s "$OUTPUT" ]; then
  FIRST_CHAR=$(head -c 1 "$OUTPUT")
  if [ "$FIRST_CHAR" = "{{" ] || [ "$FIRST_CHAR" = "<" ]; then
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
                    "geminiModel": GEMINI_MODEL,
                    "ttsModel": "Azure Speech",
                    "ttsVoice": AZURE_TTS_VOICE,
                    "ttsRate": AZURE_TTS_RATE,
                    "ttsRegion": AZURE_SPEECH_REGION or "(unset)",
                    "ttsConfigured": bool(AZURE_SPEECH_KEY and AZURE_SPEECH_REGION),
                    "extractorEnabled": bool(EXTRACTOR_URL),
                    "extractorUrl": EXTRACTOR_URL,
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
        if self.path == "/api/preprocess":
            self._handle_preprocess()
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

    def _handle_preprocess(self):
        """Forward an image to the Stage A page extractor and return the cropped result."""
        if not EXTRACTOR_URL:
            self._error(
                "EXTRACTOR_URL 未配置，预处理功能未启用。",
                status=503,
                detail="Set the EXTRACTOR_URL env var to your paper-extractor service "
                       "(e.g. http://127.0.0.1:8123) and restart this server.",
            )
            return
        try:
            payload = self._read_json()
            image_base64 = payload.get("imageBase64") or ""
            image_mime = payload.get("imageMimeType") or "image/jpeg"
            if not image_base64:
                self._error("请先选择一张图片。")
                return

            try:
                image_bytes = base64.b64decode(image_base64, validate=False)
            except Exception as exc:  # noqa: BLE001 — preserve user-facing detail
                self._error("图片解码失败。", status=400, detail=str(exc))
                return

            ext = mimetypes.guess_extension(image_mime) or ".jpg"
            if ext == ".jpe":
                ext = ".jpg"
            filename = f"upload{ext}"

            # Build a minimal multipart/form-data body without external deps.
            boundary = f"----paperExtractorBoundary{uuid.uuid4().hex}"
            crlf = b"\r\n"
            body = (
                f"--{boundary}{chr(13)}{chr(10)}"
                f'Content-Disposition: form-data; name="file"; filename="{filename}"{chr(13)}{chr(10)}'
                f"Content-Type: {image_mime}{chr(13)}{chr(10)}{chr(13)}{chr(10)}"
            ).encode("utf-8") + image_bytes + crlf + f"--{boundary}--{chr(13)}{chr(10)}".encode("utf-8")

            # privacy=true is the whole point of using the extractor in this
            # tool — surrounding scene gets masked to white so it doesn't leak
            # to the LLM. The frontend can override with privacy=false for debug.
            privacy = payload.get("privacy", True)
            privacy_q = "true" if privacy else "false"
            request = urllib.request.Request(
                f"{EXTRACTOR_URL}/extract?fmt=jpg&fallback=passthrough&privacy={privacy_q}",
                data=body,
                headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(request, timeout=30) as response:
                    cropped_bytes = response.read()
                    # response.headers is case-insensitive — read fields here.
                    method = response.headers.get("X-Method", "unknown")
                    quad_found = response.headers.get("X-Quad-Found") == "true"
                    original_size = response.headers.get("X-Original-Size")
                    output_size = response.headers.get("X-Output-Size")
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")
                self._error("Extractor 请求失败。", status=exc.code, detail=detail)
                return
            except urllib.error.URLError as exc:
                self._error(
                    "Extractor 网络请求失败。",
                    status=502,
                    detail=f"无法连接到 {EXTRACTOR_URL}: {exc.reason}",
                )
                return

            cropped_b64 = base64.b64encode(cropped_bytes).decode("ascii")
            self._send_json({
                "imageBase64": cropped_b64,
                "imageMimeType": "image/jpeg",
                "method": method,
                "quadFound": quad_found,
                "originalSize": original_size,
                "outputSize": output_size,
                "originalBytes": len(image_bytes),
                "outputBytes": len(cropped_bytes),
            })
        except Exception as exc:  # noqa: BLE001
            self._error("预处理失败。", status=500, detail=str(exc))

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
                    "maxOutputTokens": 65536,
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
        """Synthesize via Azure Speech REST API.

        The traditional FastSpeech2/HiFi-GAN pipeline behind Azure Neural TTS
        reads every character — that's the point. LLM-based TTS (OpenAI
        gpt-4o-mini-tts, Bark, etc.) sounds nicer but occasionally drops
        characters, which is unacceptable for dictation use.

        The legacy OpenAI TTS code below stays as a fallback you can revive by
        flipping the dispatch — both share the same I/O contract.
        """
        try:
            payload = self._read_json()
            text = (payload.get("text") or "").strip()
            if not text:
                self._error("没有可朗读的文本。")
                return
            if not AZURE_SPEECH_KEY or not AZURE_SPEECH_REGION:
                self._error(
                    "Azure Speech 未配置。",
                    status=503,
                    detail="Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION (env vars or "
                           "~/.azure-tts.env) and restart this server.",
                )
                return

            voice = (payload.get("voice") or AZURE_TTS_VOICE).strip()
            rate = (payload.get("rate") or AZURE_TTS_RATE).strip()

            safe_text = xml_escape(text, quote=True)
            ssml = (
                '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" '
                'xml:lang="zh-CN">'
                f'<voice name="{voice}"><prosody rate="{rate}">{safe_text}</prosody></voice>'
                '</speak>'
            )
            request = urllib.request.Request(
                azure_tts_endpoint(),
                data=ssml.encode("utf-8"),
                headers={
                    "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
                    "Content-Type": "application/ssml+xml",
                    "X-Microsoft-OutputFormat": AZURE_TTS_OUTPUT_FORMAT,
                    "User-Agent": "study-dictation-debug-tool",
                },
                method="POST",
            )
            with urllib.request.urlopen(request, timeout=60) as response:
                raw_audio = response.read()
                content_type = response.headers.get("Content-Type", "audio/mpeg")

            if raw_audio[:1] in (b"<", b"{"):
                detail = raw_audio.decode("utf-8", errors="replace")
                self._error("Azure TTS 返回了错误响应。", status=502, detail=detail)
                return

            self._send_bytes(
                raw_audio,
                content_type,
                extra_headers={"Content-Disposition": 'inline; filename="tts-output.mp3"'},
            )

            # ===== Legacy: OpenAI TTS (kept for emergency rollback) =====
            # Replace the Azure block above with the snippet below if you want
            # the gpt-4o-mini-tts voice back. Note: ~14s for 500 chars vs
            # Azure's ~1s, and stochastic — sometimes drops characters.
            #
            # OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
            # OPENAI_TTS_MODEL = "gpt-4o-mini-tts-2025-03-20"
            # OPENAI_TTS_VOICE = "coral"
            # request = urllib.request.Request(
            #     "https://api.openai.com/v1/audio/speech",
            #     data=json.dumps({
            #         "model": OPENAI_TTS_MODEL,
            #         "input": text,
            #         "voice": OPENAI_TTS_VOICE,
            #         "instructions": payload.get("instructions") or "",
            #     }, ensure_ascii=False).encode("utf-8"),
            #     headers={
            #         "Authorization": f"Bearer {OPENAI_API_KEY}",
            #         "Content-Type": "application/json",
            #     },
            #     method="POST",
            # )
            # with urllib.request.urlopen(request, timeout=180) as response:
            #     raw_audio = response.read()
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

            gemini_script = build_gemini_script(prompt)
            tts_script = build_tts_script()

            buffer = io.BytesIO()
            with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
                archive.writestr("gemini_ocr.sh", gemini_script)
                archive.writestr("tts_azure.sh", tts_script)
                archive.writestr(
                    "README.txt",
                    "Exported by Study Dictation Helper (Azure Speech edition).\n"
                    "\n"
                    "gemini_ocr.sh — Action 1 in MacroDroid. Reads {file_path} from\n"
                    "  the FileChangedTrigger, calls Gemini, returns the answer text.\n"
                    "  Save the stdout into a MacroDroid local variable named ai_speak.\n"
                    "\n"
                    "tts_azure.sh — Action 2 in MacroDroid. Reads {{lv=ai_speak}},\n"
                    "  XML-escapes it, POSTs SSML to Azure Speech, writes mp3 to\n"
                    "  /storage/emulated/0/MacroDroid/tts_output.mp3.\n"
                    "\n"
                    "Replace REPLACE_WITH_YOUR_AZURE_KEY with your Azure Speech key\n"
                    "(Free F0 tier covers 500K chars/month).\n"
                    "\n"
                    "Or use the canonical one-shot script at\n"
                    "android-scripts/study_dictation_full.sh which combines both\n"
                    "calls in a single MacroDroid action.\n",
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
    if not (AZURE_SPEECH_KEY and AZURE_SPEECH_REGION):
        print("  WARNING: Azure Speech not configured — TTS will return 503.")
        print("  Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION (env or ~/.azure-tts.env).")
    else:
        print(f"  Azure Speech: voice={AZURE_TTS_VOICE} rate={AZURE_TTS_RATE} region={AZURE_SPEECH_REGION}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
