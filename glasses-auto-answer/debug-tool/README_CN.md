# 调试工具

> **[English Version](README.md)**


一个本地 Web 界面，用于在部署到手机之前在电脑上测试 Gemini prompt 和 TTS 流水线。因为在 Android 上用 MacroDroid 调试很痛苦，而你会想要快速迭代 prompt 的修改。

## 它做什么

1. **Drag in an image** (a photo of a homework problem) / 拖入一张图片（作业题的照片）
2. **Adjust the Gemini prompt** — edit it right in the browser / 调整 Gemini prompt——直接在浏览器里编辑
3. **See the AI output** — read what Gemini returns / 查看 AI 输出——看看 Gemini 返回了什么
4. **Adjust the TTS instructions** — tweak voice behavior / 调整 TTS 指令——微调语音行为
5. **Listen** — hear the TTS audio right in the browser / 听——直接在浏览器里听 TTS 音频
6. **Export** — download the tuned scripts as a ZIP, ready to paste into MacroDroid / 导出——把调好的脚本打包成 ZIP 下载，直接粘贴到 MacroDroid

这是你的 prompt 工程工作台。改一行 prompt，点发送，听区别。反复迭代直到听写效果完美。

## 如何运行

就这样。不需要 `pip install`，不需要虚拟环境，不需要 `requirements.txt`。服务器只使用 Python 3 标准库模块——`http.server`、`urllib`、`json`、`zipfile`。只要你有 Python 3，就能直接跑。

或者用便捷脚本：

## 这不是生产系统

说清楚：调试工具在你的电脑上运行。生产系统通过 MacroDroid + shell 脚本在你的 Android 手机上运行。它们做同样的事（调用 Gemini，然后调用 TTS），但调试工具给你一个漂亮的界面来迭代。

一旦你对 prompt 满意了，导出它，粘贴到手机上的 MacroDroid shell 脚本里。

## 文件结构

*在电脑上迭代。部署到手机。这就是工作流。*
