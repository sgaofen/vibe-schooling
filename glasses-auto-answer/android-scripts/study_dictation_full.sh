#!/system/bin/sh
# ===== 学习听写助手 — Azure Speech 直连版 =====
# Gemini 解题 -> 提取文本 -> Azure Speech REST -> mp3
# MacroDroid 只需：触发器 -> 此脚本 -> Play Audio
# 适配 Android /system/bin/sh（mksh/busybox），不依赖 bash。

# ===== 配置 =====
api_key="REPLACE_WITH_YOUR_GEMINI_API_KEY"

# Azure Speech (Cognitive Services). Free F0 tier covers 500K chars/month.
# Get key + region from https://portal.azure.com -> Speech resource.
TTS_KEY="REPLACE_WITH_YOUR_AZURE_KEY"
TTS_REGION="westus2"
TTS_VOICE="zh-CN-XiaoxiaoNeural"
TTS_RATE="-25%"
TTS_URL="https://${TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"

# 可选：paper-extractor 服务地址。留空跳过预处理。
# 部署方式三选一：
#   1) 手机本地（Termux）：EXTRACTOR_URL="http://127.0.0.1:8123"
#   2) 同 WiFi 笔记本：    EXTRACTOR_URL="http://192.168.x.x:8123"
#   3) 公网 VPS：           EXTRACTOR_URL="https://your-vps.com"
EXTRACTOR_URL=""

image_path="{file_path}"

# ===== Step 0 (可选): paper-extractor 预处理 =====
# privacy=true 把非纸像素涂白，阻止 LLM 看到周围环境。
# 失败时静默回退到原图（fallback=passthrough），不破坏主流程。
if [ -n "$EXTRACTOR_URL" ] && [ -f "$image_path" ]; then
  cropped_path="/sdcard/extractor_output.jpg"
  rm -f "$cropped_path"
  curl -k -sS --max-time 30 \
    -F "file=@$image_path" \
    "$EXTRACTOR_URL/extract?fmt=jpg&fallback=passthrough&privacy=true" \
    -o "$cropped_path"
  if [ $? -eq 0 ] && [ -s "$cropped_path" ]; then
    image_path="$cropped_path"
  fi
fi

temp_json="/sdcard/gemini_request.json"
temp_response="/sdcard/gemini_response.json"
temp_tts="/sdcard/tts_request.xml"
gemini_output="/sdcard/gemini_output.txt"
tts_error="/sdcard/tts_error.txt"
OUTPUT="/storage/emulated/0/MacroDroid/tts_output.mp3"

rm -f "$OUTPUT" "$tts_error"

# ===== Step 1: 构建 Gemini 请求 =====
# Prompt 拆解见 prompts/gemini-prompt.md
echo '{
  "contents": [
    {
      "parts": [
        {
          "text": "你是我的学习听写助手。识别图片中的题目，解出每道题，输出能拿满分的完整答案。\n\n输出将直接交给TTS语音朗读，我边听边写在试卷上。所以你的输出必须：简洁、直接、容易跟着写。\n\n===== 第一步：判断每道题（和每个小问）的题型 =====\n\n同一道大题的不同小问可能是不同题型，必须分别判断。\n\n【选择题】有 A B C D E 选项\n→ 只说选哪个和选项内容。绝不展开计算。\n示例：第一题，选A，一点二，atm。\n\n【计算题】需要写出公式和计算步骤\n→ 用下方的TTS公式格式，精简完整，每步用句号加【下一行】隔开。\n\n【改错题】划掉错误词汇并替换\n→ 只说划掉什么、改成什么。\n示例：a小问，划掉 convergent，改成 homologous。\n\n【画图题】要求画图、sketch、draw（包括曲线、柱状图、分布图等）\n→ 用中文描述怎么画，关键术语用英文。描述要具体到能直接照着画：位置、方向、形状、数值。\n示例：大种群那条线从零点五开始，在零点五附近小幅波动，基本水平。小种群那条线从零点五开始，大幅随机波动，最终到达一点零或者零点零。\n示例：第二个柱子，invasive species，画在零线下面。第三个柱子，elephant reintroduction，画在零线上面。\n示例：Species A 的曲线向左移动，peak 在 50 cm 左右。Species B 的曲线向右移动，peak 在 200 cm 左右。\n\n【填空题】\n→ 按顺序念答案。\n示例：第一个空，二七三，K。第二个空，零点零八二一，L atm per mol K。\n\n【简答题】需要写完整句子回答\n→ 用自然英文念答案。数字用英文念。不用\"字母\"前缀，不用中文数字。\n示例：The large population maintains allele frequency near 0.5 because genetic drift has minimal effect. The small population experiences strong drift, causing frequency to fluctuate randomly and eventually fix or be lost.\n\n===== TTS公式格式（仅用于计算题的公式推导）=====\n\n简答题、改错题、画图题不要用这些规则。\n\n1. 单字母变量加【字母】前缀：字母w，字母q，字母n，字母R，字母T，字母P，字母V，字母E，字母S，字母G，字母H，字母C，字母m，字母v\n2. 连续变量用【乘以】隔开：nRT → 字母n，乘以，字母R，乘以，字母T\n3. 数字和单位之间加逗号：二九八，K。不能写成 二九八K\n4. 句号结尾创造停顿，句号后说【下一行】换行\n示例（复杂公式）：字母w，等于，负的，字母n，乘以，字母R，乘以，字母T，乘以，ln，左括号，字母V下标二，除以，字母V下标一，右括号。\n5. 标准态 ° 念 degree，下标 rxn 念 下标rxn：delta，字母H，degree，下标rxn\n6. 题目中的下标都要念：rxn、f、fus、p、ext等\n7. 同一题中同字母大小写都出现时，第一次标注大写或小写\n8. 数字逐位连写，内部不加任何标点：二九八点三七、一零二四、零点一二九、负三点五。错误示范：二，九，八，点，三，七（绝对禁止）\n9. 小数点用【点】，绝不用【占】\n10. 运算符用中文：加、减、乘以、除以、等于、负。绝不用 negative、plus、minus、equals\n11. 连接词用中文：所以、得到、代入\n12. 容易混淆的单位用中文：kJ念千焦，kg念千克，kPa念千帕\n13. 括号：左括号、右括号\n14. 次方：的平方、的立方\n15. 分数：二分之一、四分之三\n16. 科学计数法：三点零乘以一零的八次方\n17. 数学函数直接念英文不翻译：ln、log、sin、cos、tan、delta\n18. 单位念缩写不翻译全称：j不说joules，mol不说moles，L、Pa、atm、g、cm、K、degrees C\n19. 有单位的数值必须带单位\n20. 温度转换用273.15：二五，degrees C，加，二七三点一五，等于，二九八点一五，K\n\n===== 计算题核心原则 =====\n\n精简、完整、满分。每个字都是写在答题纸上的，没有废话。\n\n如果要求计算多个量，每个都给完整过程，不能只给最终结果。\n\n示例（熵变计算）：\n第一题。下一行。\ndelta，字母S，等于，字母q下标rev，除以，字母T，等于，字母n，乘以，delta，字母H下标fus，除以，字母T。下一行。\n字母T，等于，负八九点五，加，二七三点一五，等于，一八三点六五，K。下一行。\ndelta，字母S，等于，一点零零，mol，乘以，五三七零，j per mol，除以，一八三点六五，K，等于，二九点二四，j per K。\n\n示例（自由能计算）：\ndelta，字母G，degree，等于，delta，字母H，degree，减，字母T，乘以，delta，字母S，degree。下一行。\ndelta，字母G，degree，等于，负二二一七，千焦，减，二九八，K，乘以，零点一零一一，千焦 per K，等于，负二二四七点一，千焦。\n\n===== 格式规则 =====\n\n题号：第一题、第二题\n子问题：题目用 a b c 的说 a小问、b小问；用 i ii iii 的说 第一小问、第二小问；用 A B C 的说 大A、大B\n\n计算题中绝不能切换成英文句式。运算符永远中文。\n简答题中用自然英文，不插入中文数字或字母前缀。\n画图题中用中文指导，关键英文术语保持英文。\n\n===== 绝对禁止 =====\n不输出题目本身\n不输出数学符号（+−×÷=等）\n不输出 markdown 格式\n不在选择题中展开计算步骤\n不在简答题中使用TTS公式格式\n不用中文描述代替公式（如\"反应物键能总和\"）\n不连写多个变量字母\n不在数字内部加逗号或任何标点（二九八点三七，不是二，九，八，点，三，七）\n不输出解释性废话\n每个字都是要写在答题纸上的"
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "' > "$temp_json"

base64 -w 0 "$image_path" >> "$temp_json"

echo '"
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 65536,
    "thinkingConfig": {
      "includeThoughts": false,
      "thinkingLevel": "high"
    },
    "temperature": 1.0
  }
}' >> "$temp_json"

# ===== Step 2: 调用 Gemini API =====
curl -k -s -X POST \
  -H "Content-Type: application/json" \
  -d @"$temp_json" \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=$api_key" \
  > "$temp_response"

# ===== Step 3: 提取文本 =====
# 把 \" 换成临时哨兵 DQUOTE，然后抓 "text": "..." 的内容，再换回。
# 这样可以正确处理 Gemini 输出里嵌入的转义双引号。
ai_speak=$(sed 's/\\"/DQUOTE/g' "$temp_response" \
  | sed -n 's/.*"text": *"\([^"]*\)".*/\1/p' \
  | head -1 \
  | sed 's/DQUOTE/"/g')

if [ -z "$ai_speak" ]; then
  echo "Error: Gemini 无输出" > "$tts_error"
  cat "$temp_response" >> "$tts_error"
  exit 1
fi

echo "$ai_speak" > "$gemini_output"

# ===== Step 4: 调用 Azure Speech REST API（直连） =====
# XML 转义顺序很重要：& 必须先做，否则会把后面已经转过的 &amp; 又转一次。
# 同时把 Gemini 输出里的字面量 \n \t \r 折叠成空格。
CLEAN_TEXT=$(printf '%s' "$ai_speak" \
  | tr '\n' ' ' \
  | sed 's/[\\]n/ /g' \
  | sed 's/[\\]t/ /g' \
  | sed 's/[\\]r//g' \
  | sed 's/&/\&amp;/g' \
  | sed 's/</\&lt;/g' \
  | sed 's/>/\&gt;/g' \
  | sed 's/"/\&quot;/g')

# 用 printf 写 SSML 到文件，--data-binary 发送（避免 -d 的换行处理）。
printf '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN"><voice name="%s"><prosody rate="%s">%s</prosody></voice></speak>' \
  "$TTS_VOICE" "$TTS_RATE" "$CLEAN_TEXT" > "$temp_tts"

curl -s --max-time 60 "$TTS_URL" \
  -H "Ocp-Apim-Subscription-Key: $TTS_KEY" \
  -H "Content-Type: application/ssml+xml" \
  -H "X-Microsoft-OutputFormat: audio-24khz-48kbitrate-mono-mp3" \
  -H "User-Agent: macrodroid" \
  --data-binary @"$temp_tts" \
  --output "$OUTPUT"

# ===== Step 5: 验证结果 =====
if [ -s "$OUTPUT" ]; then
  FIRST_CHAR=$(head -c 1 "$OUTPUT")
  # mp3 第一个字节通常是 0xFF（帧同步）或 'I'（ID3 tag）。Azure 错误响应是 XML/JSON。
  if [ "$FIRST_CHAR" = "{" ] || [ "$FIRST_CHAR" = "<" ]; then
    echo "TTS returned error:" > "$tts_error"
    cat "$OUTPUT" >> "$tts_error"
    rm -f "$OUTPUT"
    exit 1
  fi
  exit 0
else
  echo "TTS Failed: no output (网络? key 失效? region 写错?)" > "$tts_error"
  exit 1
fi
