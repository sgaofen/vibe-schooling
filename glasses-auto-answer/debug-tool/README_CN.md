# 调试工具

> **[English Version](README.md)**

电脑上的本地 web UI，用来迭代 Gemini prompt 和试听 Azure TTS。在 MacroDroid 里改 prompt 很折磨——真正干活的地方是这里。

## 它干什么

1. **拖一张图进去**——作业题的照片。
2. **在浏览器里改 prompt**。
3. **看 Gemini 输出**——返回了什么，想手动改也可以。
4. **试听 Azure Speech**——直接在浏览器里听。
5. **导出**——把调好的 shell 脚本打包成 ZIP，粘贴到 MacroDroid。

工作流：改一行、点发送、听效果、再改。

## 配 Azure Speech

工具需要 `AZURE_SPEECH_KEY` 和 `AZURE_SPEECH_REGION`（比如 `westus2`）。从环境变量读，或者退而读 `~/.azure-tts.env`：

```bash
cat > ~/.azure-tts.env <<'EOF'
AZURE_SPEECH_KEY=你的KEY1从Azure portal复制
AZURE_SPEECH_REGION=westus2
EOF
chmod 600 ~/.azure-tts.env
```

F0 免费档每月 50 万字符。Key 从 [portal.azure.com](https://portal.azure.com) → 创建 Speech 资源 → KEY 1 复制。

## 运行

```bash
GEMINI_API_KEY=your-key-here python3 app.py
# 浏览器打开 http://127.0.0.1:8765
```

或者把两个变量都内联：

```bash
GEMINI_API_KEY=... AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=westus2 python3 app.py
```

或者用便捷启动脚本：

```bash
./run.sh
```

不需要 `pip install`，不需要虚拟环境。只用 Python 3 标准库——`http.server`、`urllib`、`json`、`zipfile`、`html.escape`。

## 改声音 / 语速

启动时通过环境变量覆盖默认值：

- `AZURE_TTS_VOICE`（默认 `zh-CN-XiaoxiaoNeural`）
- `AZURE_TTS_RATE`（默认 `-25%`）

声音列表：[Azure 中文神经语音](https://learn.microsoft.com/zh-cn/azure/ai-services/speech-service/language-support?tabs=tts)。听写场景慢一点（`-15%` 到 `-30%`）最好用。

## 这不是生产系统

调试工具跑在你的电脑上。生产系统通过 MacroDroid 和 [`../android-scripts/study_dictation_full.sh`](../android-scripts/study_dictation_full.sh) 跑在你的 Android 手机上。两边用的是同一份 prompt 和同一种 Azure 调用方式；这个 UI 只是让调 prompt 不那么折磨人。

prompt 调到满意了：把 prompt 内容复制到生产脚本里（或者点 Export 从 ZIP 里拿），更新两个宏。

## 文件结构

```
debug-tool/
├── app.py           Python web 服务（Gemini 调用、Azure TTS 调用、导出）
├── run.sh           启动脚本
└── static/
    ├── index.html   界面
    ├── app.js       拖拽、fetch、音频播放
    └── styles.css   样式
```

---

*在电脑上迭代，在手机上部署。*
