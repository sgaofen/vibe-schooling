# 🎯 Canvas Sniper

### **Are you still stressing over Canvas quizzes?** Let Canvas Sniper handle it.

> One double-click. That's all it takes. Canvas Sniper reads the question, thinks like a tutor, and fills in the answer — automatically.

**🆓 Free to use** · **🔒 Privacy-first** · **🤖 Powered by Gemini AI**

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Canvas_Sniper-4CAF50?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore)

---

## ✨ What It Does

Canvas Sniper is a Chrome extension that **automatically answers Canvas LMS quiz questions** using Google's Gemini AI. Just **double-click** on any question and watch the magic happen.

### Supported Question Types

| Type | How It Works |
|------|-------------|
| ✅ Multiple Choice | Selects the correct option |
| ✅ Multi-Select (Checkbox) | Checks all correct options |
| ✅ Dropdown | Picks the right answer from the dropdown |
| ✅ Fill-in-the-Blank | Types in the correct answer |
| ✅ Mixed (Dropdown + Blank) | Handles combined question types |
| ✅ Essay / Short Answer | Writes a complete, thoughtful response |

---

## 🚀 How to Use

1. **Install** the extension from Chrome Web Store (or load unpacked for development)
2. **Set up your API Key** — click the extension icon → go to Help page for instructions
3. **Open** any Canvas quiz
4. **Double-click** on a question → done! ✅

### Controls

| Action | What It Does |
|--------|-------------|
| **Double-click** on a question | Triggers auto-answer |
| **ESC** key | Cancels current operation |

---

## ⚙️ Settings

| Toggle | Description |
|--------|-------------|
| **Enable** | Turn the extension on/off |
| **Stealth Mode** | Hides the status popup in the bottom-right corner |
| **Mouse Simulation** | When ON: simulates human-like mouse movement and typing. When OFF: fills answers instantly |

---

## 🖱️ Mouse Simulation Mode

When enabled, Canvas Sniper behaves like a real person:
- 🎯 Mouse cursor moves to each input field with natural curved paths
- ⌨️ Types answers character by character with random pauses
- 📋 Opens dropdown menus visually before selecting an option
- 🤚 Adds subtle hand tremor and thinking delays

> The cursor automatically adapts to your OS — Windows style on Windows, macOS style on Mac.

---

## 🔑 API Key Setup

Canvas Sniper uses **Google Gemini AI** (free tier available). You'll need your own API key:

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Copy the key
4. Open `background.js` and paste your key in the `GEMINI_API_KEY` field

> 💡 The free tier of Gemini API is generous enough for normal use.

---

## 📦 Development / Load Unpacked

```bash
git clone https://github.com/sgaofen/canvas-sniper.git
```

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **"Load unpacked"**
4. Select the `canvas-sniper` folder

---

## ⚠️ Disclaimer

This tool is for **educational purposes only**. Use responsibly and in accordance with your institution's academic integrity policies. The developers are not responsible for any misuse.

---

## 📄 License

MIT License — feel free to fork, modify, and share.

---

---

# 🎯 Canvas Sniper（中文版）

### **还在为 Canvas 做题发愁？** 让 Canvas Sniper 帮你搞定。

> 只需双击题目，AI 自动读题、分析、填答案 —— 就这么简单。

**🆓 免费使用** · **🔒 隐私安全** · **🤖 Gemini AI 驱动**

[![Chrome 应用商店](https://img.shields.io/badge/Chrome_应用商店-Canvas_Sniper-4CAF50?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chrome.google.com/webstore)

---

## ✨ 功能介绍

Canvas Sniper 是一款 Chrome 浏览器扩展，利用 Google Gemini AI **自动回答 Canvas LMS 上的各种题目**。双击即用，简单高效。

### 支持的题型

| 题型 | 方式 |
|------|------|
| ✅ 单选题 | 自动选中正确选项 |
| ✅ 多选题 | 自动勾选所有正确选项 |
| ✅ 下拉选择题 | 自动从菜单选择正确答案 |
| ✅ 填空题 | 自动填入正确答案 |
| ✅ 混合题 | 同时处理下拉 + 填空 |
| ✅ 简答题 | 自动撰写完整回答 |

---

## 🚀 使用方法

1. **安装**扩展（Chrome 应用商店或开发者模式加载）
2. **设置 API Key** — 点击扩展图标，查看帮助页面获取说明
3. **打开** Canvas 答题页面
4. **双击**题目 → 搞定！✅

### 操作说明

| 操作 | 效果 |
|------|------|
| **双击**题目区域 | 触发自动答题 |
| **ESC** 键 | 取消当前操作 |

---

## ⚙️ 设置选项

| 开关 | 说明 |
|------|------|
| **启用** | 开启或关闭插件 |
| **无痕模式** | 隐藏右下角状态提示，更加隐蔽 |
| **模拟鼠标** | 开启后模拟真人操作（鼠标移动 + 逐字输入），关闭则瞬间填充 |

---

## 🖱️ 模拟鼠标模式

开启后，插件会像真人一样操作：
- 🎯 鼠标沿弧线移动到目标位置，有随机抖动
- ⌨️ 逐字输入答案，偶尔会"打错字再改"
- 📋 模拟打开下拉菜单、选择选项
- 🤚 每步操作之间有思考停顿

> 光标会根据你的操作系统自动适配 —— Windows 显示白色箭头，Mac 显示黑色箭头。

---

## 🔑 API Key 设置

Canvas Sniper 使用 **Google Gemini AI**（有免费额度）。你需要自己的 API Key：

1. 前往 [Google AI Studio](https://aistudio.google.com/apikey)
2. 点击 **"Create API Key"**（创建 API 密钥）
3. 复制密钥
4. 打开 `background.js`，将密钥粘贴到 `GEMINI_API_KEY` 字段

> 💡 Gemini API 的免费额度足以满足日常使用。

---

## ⚠️ 免责声明

本工具仅供**学习和研究用途**。请自觉遵守学校的学术诚信规定。开发者不对任何滥用行为承担责任。

---

## 📄 许可证

MIT License — 欢迎 fork、修改和分享。
