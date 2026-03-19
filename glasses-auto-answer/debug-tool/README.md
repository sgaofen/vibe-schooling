# Debug Tool

> **[中文版](README_CN.md)**


---

A local web UI for testing the Gemini prompt and TTS pipeline on your computer before deploying anything to your phone. Because debugging on Android with MacroDroid is painful, and you'll want to iterate fast on prompt tweaks.

## What it does

1. **Drag in an image** (a photo of a homework problem) / 拖入一张图片（作业题的照片）
2. **Adjust the Gemini prompt** — edit it right in the browser / 调整 Gemini prompt——直接在浏览器里编辑
3. **See the AI output** — read what Gemini returns / 查看 AI 输出——看看 Gemini 返回了什么
4. **Adjust the TTS instructions** — tweak voice behavior / 调整 TTS 指令——微调语音行为
5. **Listen** — hear the TTS audio right in the browser / 听——直接在浏览器里听 TTS 音频
6. **Export** — download the tuned scripts as a ZIP, ready to paste into MacroDroid / 导出——把调好的脚本打包成 ZIP 下载，直接粘贴到 MacroDroid

This is your prompt engineering workbench. Change a line in the prompt, hit send, hear the difference. Repeat until the dictation sounds perfect.

## How to run

```bash
GEMINI_API_KEY=your-key-here OPENAI_API_KEY=your-key-here python3 app.py
```

Then open: **http://127.0.0.1:8765**

That's it. No `pip install`, no virtual environment, no `requirements.txt`. The server uses only Python 3 standard library modules — `http.server`, `urllib`, `json`, `zipfile`. If you have Python 3, you're good to go.

Or use the convenience script:

```bash
GEMINI_API_KEY=your-key-here OPENAI_API_KEY=your-key-here ./run.sh
```

## This is NOT the production system

Let's be clear about this: the debug tool runs on your computer. The production system runs on your Android phone via MacroDroid + shell script. They do the same thing (call Gemini, then call TTS), but the debug tool gives you a nice UI to iterate with.

Once you're happy with your prompt, export it and paste into your MacroDroid shell script on your phone.

## File structure

```
debug-tool/
├── app.py           ← Python web server (all the API logic lives here)
├── run.sh           ← Convenience launcher
└── static/
    ├── index.html   ← The web UI
    ├── app.js       ← Frontend logic (drag-drop, API calls, audio playback)
    └── styles.css   ← Styling
```

---

*Iterate on your computer. Deploy to your phone. That's the workflow.*
