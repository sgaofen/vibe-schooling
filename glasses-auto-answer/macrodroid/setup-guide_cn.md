# MacroDroid 配置指南

> **[English Version](setup-guide.md)**

本指南假设你从未使用过 MacroDroid。每一步都会写清楚点哪里、填什么。跟着做就行。

---

## 你需要准备什么

1. **MacroDroid** — 从 Google Play 安装（免费版就够）
2. **小米眼镜 app** — 已安装并配对好你的眼镜
3. **两个 API 密钥** — Gemini API key 和 OpenAI API key（获取方式见下方）
4. MacroDroid 需要以下权限：**无障碍服务**、**存储权限**、**通知权限**、**悬浮窗权限**、**关闭电池优化**

### 获取 API 密钥

| 密钥 | 在哪里获取 | 费用 |
|------|-----------|------|
| Gemini API Key | [Google AI Studio](https://aistudio.google.com/apikey) → 点「Create API Key」 | 有免费额度 |
| OpenAI API Key | [OpenAI Platform](https://platform.openai.com/api-keys) → 点「Create new secret key」 | 按量计费，TTS 很便宜 |

拿到后先存好，一会儿要用。

---

## 概览

你需要创建**两个宏**：

| 宏名称 | 作用 |
|--------|------|
| **眼镜** | 每 25 秒自动把眼镜拍的照片导入手机存储 |
| **上传文件** | 检测到新照片后，自动调用 AI 解题 + 语音合成 + 播放答案 |

配好后的样子：

![MacroDroid 宏列表](../../docs/images/macrodroid-overview.jpg)

---

## 第一步：创建「眼镜」宏

这个宏解决一个问题：小米眼镜拍的照片不会自动出现在手机存储里，必须通过小米眼镜 app 手动导入。这个宏自动化了导入操作，每 25 秒模拟一次 app 里的点击。

### 操作步骤

1. 打开 MacroDroid
2. 点击右下角的 **+** 号创建新宏
3. 给宏起名：**眼镜**

### 设置触发器

4. 点击「触发器」区域的 **+** 号
5. 选择 **定时器** → **固定时间间隔**
6. 设置间隔为 **00:00:25**（25 秒）
7. 点确认

### 设置动作（按顺序添加，顺序很重要）

8. 点击「动作」区域的 **+** 号，依次添加以下 **8 个动作**：

| 序号 | 操作 | 怎么配置 | 为什么需要 |
|------|------|---------|-----------|
| 1 | **用户界面交互** → 手势 | 持续时间 250 毫秒，起点 (500, 2000)，终点 (500, 1000) | 上划关闭可能的悬浮窗 |
| 2 | **启动应用** | 选择「小米眼镜」，勾选「重新启动」 | 打开眼镜 app |
| 3 | **等待** | 5 秒 | 等 app 加载完 |
| 4 | **用户界面交互** → 点击 | 点击文字「取消」 | 关闭同步对话框 |
| 5 | **等待** | 1 秒 | 短暂停顿 |
| 6 | **用户界面交互** → 点击 | 点击文字「导入」 | 把照片导入手机存储 |
| 7 | **等待** | 4 秒 | 等导入完成 |
| 8 | **启动主屏幕** | 直接选就行 | 退出 app 回主屏 |

### 约束条件

9. 不用设置任何约束条件，留空

### 保存

10. 点右上角保存

### 配好后的截图

![眼镜宏配置](../../docs/images/macrodroid-glasses-macro.jpg)

### 注意事项

- **坐标可能需要调整**：(500, 2000) → (500, 1000) 是按 1440 宽度的屏幕设计的。如果你手机分辨率不同，手势可能点不到对的位置。在 MacroDroid 的手势测试器里试一下。
- **25 秒可以调**：更短 = 响应更快但更耗电，更长 = 拍照后等待更久。25 秒是不错的平衡点。
- **不用的时候记得关掉这个宏**，省电。

---

## 第二步：创建「上传文件」宏

这是真正干活的宏。当眼镜的照片出现在手机存储里，这个宏自动运行 AI 流水线：拍照 → Gemini 解题 → TTS 语音合成 → 播放答案。

### 操作步骤

1. 点击右下角 **+** 号创建新宏
2. 给宏起名：**上传文件**

### 设置触发器

3. 点击「触发器」的 **+** 号
4. 选择 **文件** → **文件已更改**
5. 路径填：`/storage/emulated/0/DCIM/XiaomiGlass/IMG*`
6. 勾选事件类型：**已创建**、**已删除**、**已更新**（全部勾上）
7. 点确认

### 设置动作

8. 点击「动作」的 **+** 号，添加 **两个动作**：

**动作 1：Shell 脚本**

9. 选择 **设备操作** → **Shell 脚本**
10. 执行方式选择 **未 Root**（MacroDroid 自带的 Shell 环境已经包含 curl，不需要 Root 也不需要 Termux）
11. 把下面的**完整脚本**粘贴到脚本内容框里：

<details>
<summary>点击展开完整脚本（粘贴前需要填入你的 API 密钥）</summary>

```bash
#!/system/bin/sh
# 学习听写助手
# Gemini 解题 -> OpenAI TTS -> 生成音频
# 适配 Android /system/bin/sh（mksh/busybox），不依赖 bash。

api_key="在这里填你的 Gemini API Key"
OPENAI_KEY="在这里填你的 OpenAI API Key"
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

MAX_TTS_CHARS=3900

json_escape_one_line() {
  printf '%s' "$1" | \
    sed 's/\\/\\\\/g' | \
    sed 's/"/\\"/g'
}

rm -f "$OUTPUT" "$OUTPUT_TMP" "$tts_error" "$tts_curl_stderr" "$tts_http_status" "$tts_curl_exit" "$tts_input_length"

# ===== Step 1: 构建 Gemini 请求 =====
# 这里的 prompt 是精心调教过的，让 Gemini 输出 TTS 友好的格式
# 完整 prompt 说明见 prompts/gemini-prompt.md
echo '{
  "contents": [
    {
      "parts": [
        {
          "text": "你是我的学习听写助手。识别图片中的题目，解出每道题，输出能拿满分的完整答案。\n\n重要：输出将直接交给TTS语音合成朗读，我边听边写在试卷上。TTS对单个字母容易漏读，所以你必须用特殊格式确保每个字母都被读出来。\n\n===== TTS防漏读规则（最重要）=====\n\n1. 单字母变量必须加前缀。所有单字母变量前面加上【字母】二字，让TTS不会跳过：\n字母w，字母q，字母n，字母R，字母T，字母P，字母V，字母E，字母S，字母G，字母H，字母C，字母m，字母v\n\n2. 连续变量之间用【乘以】隔开，绝不连写：\nnRT 要说成：字母n，乘以，字母R，乘以，字母T\nPV 要说成：字母P，乘以，字母V\n绝不能写成 nRT 或 PV 让TTS自己读\n\n3. 数字和单位之间必须加逗号停顿：\n八六点三，j\n零点二九零，j per K\n零点五零，L atm\n二九八，K\n绝不能写成 八六点三j（没有逗号TTS会吞掉单位）\n有单位的数值必须带单位，用你的判断力决定哪些数值需要单位\n\n4. 每个公式步骤用句号结尾，创造停顿\n\n5. 标准态符号 degree 的处理：如果整道题都在标准态下，degree 符号直接省略不读。如果需要区分标准态和非标准态，用 standard 这个词。绝不要把 degree 符号当作下标处理。\n\n6. 下标规则——只在必要时使用：只有当同一道题中同一个变量出现多个下标版本时才需要标注下标。\n\n7. 换行提示：每当需要写下一行公式时，在句号后面说【下一行】。\n\n===== 计算题核心原则 =====\n目标：精简、完整、能拿满分。多余的一个字不要。\n必须满足三个条件：1.完整性 2.精简性 3.长度限制（3500字符以内）\n\n===== 语言规则 =====\n中文念：题号、数字逐位念、运算符、括号等\n单位念缩写不翻译：j, kg, mol, L, Pa, K, degrees C\n英文念：变量名、答案内容、化学式、希腊字母、数学函数\n\n===== 题型输出规则 =====\n计算题：精简完整满分。选择题：选哪个+念内容。填空题：按顺序念。简答题：完整英文。判断题：true/false+理由。\n\n===== 格式一致性 =====\n运算符永远用中文。温度转换用273.15。\n\n===== 绝对禁止 =====\n不输出题目本身，不输出数学符号，不输出解释废话，不输出markdown，不连写变量字母，每个字都是要写在答题纸上的"
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

ai_speak=$(printf '%s' "$ai_speak" | \
  sed 's/\\"/"/g' | \
  sed 's/\\n/ /g' | \
  sed 's/\\r/ /g' | \
  sed 's/\\t/ /g')

echo "$ai_speak" > "$gemini_output"

# ===== Step 4: 调用 TTS =====
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
```

</details>

12. **重要**：粘贴后，把脚本最前面两行的 API 密钥替换成你自己的：
    - `api_key="在这里填你的 Gemini API Key"` → 换成你的 Gemini key
    - `OPENAI_KEY="在这里填你的 OpenAI API Key"` → 换成你的 OpenAI key

**动作 2：播放音频**

13. 再点 **+** 添加动作
14. 选择 **媒体** → **播放音频**
15. 文件路径填：`tts_output.mp3`（位于 `/storage/emulated/0/MacroDroid/tts_output.mp3`）

### 约束条件

16. 不用设置，留空

### 保存

17. 点右上角保存

### 配好后的截图

![上传文件宏配置](../../docs/images/macrodroid-upload-macro.jpg)

![Shell 脚本内容](../../docs/images/macrodroid-shell-script.jpg)

---

## 第三步：测试

两个宏都配好之后：

1. 在 MacroDroid 里**启用两个宏**（开关拨到开）
2. 用眼镜**拍一张**任何作业题的照片
3. **等大约 30 秒**（25 秒导入周期 + 几秒 AI 处理），你应该能听到答案通过眼镜喇叭播放

### 如果没声音怎么办

检查手机上的这些调试文件：

| 文件路径 | 看什么 |
|---------|--------|
| `/sdcard/tts_error.txt` | TTS 报错信息（最常见的问题） |
| `/sdcard/gemini_output.txt` | Gemini 返回的文字答案 |
| `/sdcard/gemini_response.json` | Gemini API 原始响应 |
| `/sdcard/tts_http_status.txt` | OpenAI TTS 的 HTTP 状态码 |
| `/sdcard/tts_curl_exit.txt` | curl 退出码 |
| `/sdcard/clean_text.txt` | 实际发给 TTS 的文本 |
| `/sdcard/tts_input_length.txt` | 文本字符数 |

**最常见的失败原因**：TTS 输入超过 3900 字符。说明题量太大，Gemini 输出太长。解决方法：拍照时只拍部分题目，或者调整 prompt 让输出更精简。

---

## 小贴士

- **电池**：「眼镜」宏每 25 秒触发一次，2 小时考试大约额外消耗 5-10% 电量。不用的时候关掉。
- **勿扰模式**：建议开启，避免通知声打断音频。
- **音量**：提前测试眼镜扬声器音量，找到你能听清但别人听不到的最佳音量。隐私模式帮助很大。
- **先用调试工具**：部署到手机之前，先在电脑上用 [调试工具](../debug-tool/README_CN.md) 测试样本图片，迭代更快。
