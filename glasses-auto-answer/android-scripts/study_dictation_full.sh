#!/system/bin/sh
# 学习听写助手
# Gemini 解题 -> OpenAI TTS -> 生成音频
# 适配 Android /system/bin/sh（mksh/busybox），不依赖 bash。

api_key="YOUR_GEMINI_API_KEY_HERE"
OPENAI_KEY="YOUR_OPENAI_API_KEY_HERE"
image_path="{file_path}"

temp_json="/sdcard/gemini_request.json"
temp_response="/sdcard/gemini_response.json"
tts_request="/sdcard/tts_request.json"
gemini_output="/sdcard/gemini_output.txt"
clean_text_output="/sdcard/clean_text.txt"
tts_error="/sdcard/tts_error.txt"
tts_http_status="/sdcard/tts_http_status.txt"
tts_curl_exit="/sdcard/tts_curl_exit.txt"
tts_curl_stderr="/sdcard/tts_curl_stderr.txt"
tts_input_length="/sdcard/tts_input_length.txt"
OUTPUT="/storage/emulated/0/MacroDroid/tts_output.mp3"
OUTPUT_TMP="${OUTPUT}.tmp"

# 给 OpenAI TTS 留一点余量，避免卡在极限值附近。
MAX_TTS_CHARS=3900

json_escape_one_line() {
  printf '%s' "$1" | \
    sed 's/\\/\\\\/g' | \
    sed 's/"/\\"/g'
}

rm -f "$OUTPUT" "$OUTPUT_TMP" "$tts_error" "$tts_curl_stderr" "$tts_http_status" "$tts_curl_exit" "$tts_input_length"

# ===== Step 1: 构建 Gemini 请求 =====
echo '{
  "contents": [
    {
      "parts": [
        {
          "text": "你是我的学习听写助手。识别图片中的题目，解出每道题，输出能拿满分的完整答案。\n\n重要：输出将直接交给TTS语音合成朗读，我边听边写在试卷上。TTS对单个字母容易漏读，所以你必须用特殊格式确保每个字母都被读出来。\n\n===== TTS防漏读规则（最重要）=====\n\n1. 单字母变量必须加前缀。所有单字母变量前面加上【字母】二字，让TTS不会跳过：\n字母w，字母q，字母n，字母R，字母T，字母P，字母V，字母E，字母S，字母G，字母H，字母C，字母m，字母v\n\n2. 连续变量之间用【乘以】隔开，绝不连写：\nnRT 要说成：字母n，乘以，字母R，乘以，字母T\nPV 要说成：字母P，乘以，字母V\n绝不能写成 nRT 或 PV 让TTS自己读\n\n3. 数字和单位之间必须加逗号停顿：\n八六点三，j\n零点二九零，j per K\n零点五零，L atm\n二九八，K\n绝不能写成 八六点三j（没有逗号TTS会吞掉单位）\n有单位的数值必须带单位，用你的判断力决定哪些数值需要单位\n\n4. 每个公式步骤用句号结尾，创造停顿：\n字母w，等于，负的，字母n，乘以，字母R，乘以，字母T，乘以，ln，左括号，字母V下标二，除以，字母V下标一，右括号。\n\n5. 标准态符号 degree 的处理：\n题目中的 delta G degree，delta H degree，delta S degree 里的 degree 符号表示标准态。\n如果整道题都在标准态下，degree 符号直接省略不读，只说 delta G，delta H，delta S。\n如果需要区分标准态和非标准态，用 standard 这个词：delta G standard。\n绝不要把 degree 符号当作下标处理，绝不要说【下标std】或【下标standard】。\n\n6. 下标规则——只在必要时使用：\n只有当同一道题中同一个变量出现多个下标版本时才需要标注下标，例如：V1和V2同时出现时说字母V下标一、字母V下标二。\n如果没有歧义，不需要加下标。例如整道题只有一个H或一个S，不需要说下标。\n下标内容：数字用中文数字，英文字母或缩写保持英文不翻译。\n常见下标示例：字母C下标p，字母P下标ext，字母H下标f，字母H下标fus\n\n7. 换行提示：每当需要写下一行公式时，在句号后面说【下一行】。这样我知道要换行写。连续的公式推导每一步都要用句号加【下一行】隔开。\n\n===== 计算题核心原则 =====\n\n目标：输出精简的、完整的、能拿满分的答案。只要答案，多余的一个字不要。\n\n你有充分的自由决定怎么组织解题步骤，但必须满足三个条件：\n1. 完整性：包含所有拿满分需要的步骤（公式推导、单位换算、代入计算等），不能跳步。特别注意：如果题目要求计算多个量（比如同时求 delta H，delta S，delta G），每一个都必须给出完整计算过程，绝不能只给最终结果\n2. 精简性：每个字都是要写在答题纸上的，没有废话、没有解释、没有过渡语\n3. 长度限制：最终输出必须控制在三五零零个字符以内。如果题量很多，优先保留拿满分必需步骤，删除重复表达\n\n用你的判断力决定哪些步骤是拿满分必需的，哪些可以省略。不同的题需要不同的详略程度。\n\n示例（计算熵变，展示TTS格式）：\n第一题。下一行。\ndelta，字母S，等于，字母q下标rev，除以，字母T，等于，delta，字母H，除以，字母T，等于，字母n，乘以，delta，字母H下标fus，除以，字母T。下一行。\n字母T，等于，负八九点五，加，二七三点一五，等于，一八三点六五，K。下一行。\ndelta，字母H下标fus，等于，五点三七，kJ per mol，乘以，一零零零，等于，五三七零，j per mol。下一行。\ndelta，字母S，等于，一点零零，mol，乘以，五三七零，j per mol，除以，一八三点六五，K，等于，二九点二四，j per K。\n\n示例（自由能计算，展示degree符号处理）：\ndelta，字母G，等于，delta，字母H，减，字母T，乘以，delta，字母S。下一行。\ndelta，字母G，等于，负二二一七，kJ，减，二九八，K，乘以，零点一零一一，kJ per K，等于，负二二四七点一，kJ。\n注意：这里整道题都是标准态，所以delta G degree直接说delta字母G，不加任何后缀。\n\n===== 语言规则 =====\n\n中文念的部分：\n题号：第一题、第二题\n子问题：第一小问、第二小问（不要用 i ii iii）\n数字逐位念，不用百千万：二九八点三七、一八四、零点一二九、负三点五、一零二四\n小数点永远用【点】这个字，绝不能用【占】或其他任何替代字\n科学计数法：三点零乘以一零的八次方\n运算符：加、减、乘以、除以、等于\n括号：左括号、右括号\n次方：的平方、的立方\n分数：二分之一、四分之三\n连接词：所以、得到、代入\n\n单位念缩写，不翻译成全称：\nj 不说 joules，kg 不说 kilograms，mol 不说 moles\nm per s 不说 meters per second\nL，Pa，N，W，Hz，atm，mL，g，kJ，cm，nm，K，degrees C\n\n数学函数直接念英文缩写不翻译：\nln，log，sin，cos，tan，delta\n\n念英文的部分：\n变量名（带字母前缀）\n选择题填空题简答题的答案内容\n化学式和化学名词\n希腊字母念英文：delta，alpha，beta，gamma\n\n===== 题型输出规则 =====\n\n计算题：精简、完整、满分。你自由决定步骤详略，但每一步都必须是写在纸上的内容。每一行公式用句号加【下一行】隔开。\n\n选择题：说选哪个，念该选项内容。\n示例：第五题，选B，the reaction is exothermic because delta H is negative。\n\n填空题：按顺序念答案。\n示例：第二题，第一个空，二七三，K。第二个空，零点零八二一，L atm per mol per K。\n\n简答题：念完整英文答案。\n示例：第一题。The equilibrium shifts to the right because increasing temperature favors the endothermic direction according to Le Chatelier principle.\n\n判断题：说 true 或 false，加理由。\n示例：第四题，false, because the boiling point increases with stronger intermolecular forces.\n\n===== 格式一致性 =====\n计算过程必须始终用统一的TTS格式，绝不能切换成英文句式。\n错误示范：For Chlorine, delta G equals negative一四一点九\n正确示范：对于 chlorine，delta，字母G，等于，负一四一点九，kJ per mol\n运算符永远用中文：负、加、减、乘以、除以、等于。绝不用 negative、plus、minus、equals。\n温度转换用 273.15，不是 273：二五，degrees C，加，二七三点一五，等于，二九八点一五，K。\n\n===== 绝对禁止 =====\n不输出题目本身，只输出答案\n不输出任何数学符号\n不输出解释性废话\n不输出 markdown 格式\n不连写多个变量字母\n不混搭英文句式和中文数字\n每个字都是要写在答题纸上的"
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
curl -k -sS -X POST \
  -H "Content-Type: application/json" \
  -d @"$temp_json" \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=$api_key" \
  > "$temp_response"

# ===== Step 3: 提取文本 =====
ai_speak=$(sed -n 's/.*"text": *"\([^"]*\)".*/\1/p' "$temp_response" | head -1)

if [ -z "$ai_speak" ]; then
  echo "Error: Gemini 无输出" > "$tts_error"
  cat "$temp_response" >> "$tts_error"
  exit 1
fi

# 对 Gemini JSON 转义做最小反转义，避免把 \n、\" 原样送给 TTS。
ai_speak=$(printf '%s' "$ai_speak" | \
  sed 's/\\"/"/g' | \
  sed 's/\\n/ /g' | \
  sed 's/\\r/ /g' | \
  sed 's/\\t/ /g')

echo "$ai_speak" > "$gemini_output"

# ===== Step 4: 调用 TTS =====
# 先归一化空白，再单独写 JSON 文件，避免长文本直接塞进 curl -d 参数。
tts_input_text=$(printf '%s' "$ai_speak" | sed 's/[[:space:]][[:space:]]*/ /g')
echo "$tts_input_text" > "$clean_text_output"

TEXT_LEN=$(printf '%s' "$tts_input_text" | wc -c | sed 's/[^0-9]//g')
echo "$TEXT_LEN" > "$tts_input_length"

if [ -z "$TEXT_LEN" ]; then
  echo "TTS Failed: could not measure input length" > "$tts_error"
  exit 1
fi

if [ "$TEXT_LEN" -gt "$MAX_TTS_CHARS" ]; then
  echo "TTS Failed: input too long ($TEXT_LEN chars, limit $MAX_TTS_CHARS)" > "$tts_error"
  echo "Gemini output is saved at $gemini_output" >> "$tts_error"
  exit 1
fi

CLEAN_TEXT=$(json_escape_one_line "$tts_input_text")
TTS_INSTRUCTIONS=$(json_escape_one_line "你是听写助手，逐字朗读文本让学生抄写。最重要的规则：绝不跳过任何文字，每一个字、每一个字母、每一个单位都必须读出来。遇到【字母】加单个英文字母时，清晰读出该字母。用清晰、缓慢、沉稳的语速朗读。每道题之间停顿两秒。逗号处短暂停顿，句号处停顿一秒。数字和单位之间的逗号也要停顿。遇到英文单词时自然切换为标准英文发音。整体节奏像老师在课堂上念题。")

printf '{
  "model": "gpt-4o-mini-tts-2025-03-20",
  "input": "%s",
  "voice": "coral",
  "instructions": "%s"
}
' "$CLEAN_TEXT" "$TTS_INSTRUCTIONS" > "$tts_request"

HTTP_CODE=$(curl -sS --max-time 180 \
  -o "$OUTPUT_TMP" \
  -w "%{http_code}" \
  https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @"$tts_request" \
  2> "$tts_curl_stderr")
CURL_EXIT=$?

echo "$CURL_EXIT" > "$tts_curl_exit"
echo "$HTTP_CODE" > "$tts_http_status"

if [ "$CURL_EXIT" -ne 0 ]; then
  echo "TTS curl failed with exit code $CURL_EXIT" > "$tts_error"
  cat "$tts_curl_stderr" >> "$tts_error"
  rm -f "$OUTPUT_TMP"
  exit 1
fi

if [ "$HTTP_CODE" != "200" ]; then
  echo "TTS HTTP error: $HTTP_CODE" > "$tts_error"
  cat "$OUTPUT_TMP" >> "$tts_error"
  rm -f "$OUTPUT_TMP"
  exit 1
fi

if [ ! -s "$OUTPUT_TMP" ]; then
  echo "TTS Failed: empty audio response" > "$tts_error"
  rm -f "$OUTPUT_TMP"
  exit 1
fi

mv "$OUTPUT_TMP" "$OUTPUT"
exit 0
