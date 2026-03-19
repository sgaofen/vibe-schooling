# Xiaomi Glasses Auto-Answer System

# 小米眼镜自动答题系统

---

## What is this? / 这是什么？

You take a photo of a homework problem with your Xiaomi smart glasses. A few seconds later, the full worked-out answer plays through your glasses speakers as natural-sounding dictation. You write it down. That's it.

用小米智能眼镜拍一张作业题的照片，几秒后完整的解题过程就会通过眼镜扬声器以自然语音播报出来，你边听边写。就这么简单。

The pipeline is fully automated — no tapping, no swiping, no looking at your phone. Take the photo, put your pen on the paper, and listen.

整条流水线全自动运行——不用点屏幕，不用划手机。拍完照，笔放纸上，听就行了。

## Architecture / 系统架构

Here's what happens every time you take a photo:

每次拍照后发生的事情：

```
Glasses photo → /DCIM/XiaomiGlass/IMG*.jpg
  → MacroDroid: File Changed trigger
    → Shell script:
        1. base64 encode image
        2. POST to Gemini 3 Flash (high thinking effort)
        3. Extract answer text
        4. POST to OpenAI TTS (gpt-4o-mini-tts, coral voice)
        5. Save tts_output.mp3
    → MacroDroid: Play audio
      → Answer plays through glasses speakers
```

Let's walk through it:

1. You snap a photo through the glasses. It lands in `/DCIM/XiaomiGlass/` on your phone.
2. MacroDroid watches that folder. The moment a new image appears, it fires.
3. A shell script base64-encodes the photo and sends it to **Gemini 3 Flash** with a carefully tuned prompt that solves the problem and formats the answer for spoken dictation.
4. Gemini's text output goes straight to **OpenAI TTS** (gpt-4o-mini-tts, voice "coral"), which renders it as a slow, clear, teacher-paced audio file.
5. MacroDroid plays the MP3 through your glasses speakers. You hear the answer and write it down.

No cloud servers to maintain. No app to build. Just two API calls stitched together by a shell script running on your phone.

没有需要维护的云服务器。没有需要开发的 app。只有两个 API 调用，由手机上的一个 shell 脚本串起来。

## Why pure audio? Why not show it on a screen? / 为什么纯音频？为什么不显示在屏幕上？

This is the most important design decision in the whole system, and it's non-negotiable.

这是整个系统中最重要的设计决策，没有商量的余地。

**Every single screen-based smart glasses product on the market today has a light leakage problem.** The front might look fine, but the back of the lens glows. Anyone sitting behind you or beside you can see that glow. In a classroom, in an exam hall, in any situation where you need to look normal — it's a dead giveaway. No exceptions. Not the fancy ones, not the cheap ones. They all leak.

**目前市面上所有带屏幕的智能眼镜都有漏光问题。** 从正面看也许没事，但镜片背面会发光。坐在你后面或旁边的人一眼就能看到那个光。在教室里、考场上，任何你需要看起来正常的场合——一眼就暴露了。没有例外，贵的不行，便宜的也不行，全都漏光。

Pure audio through the glasses speakers is **completely invisible**. The glasses look like normal glasses because they *are* normal-looking glasses (Xiaomi nailed that part). Turn on privacy mode, keep the volume low, and the person sitting right next to you won't hear a thing.

纯音频通过眼镜扬声器播放**完全不可见**。眼镜看起来就是普通眼镜，因为它本来就长得像普通眼镜（这点小米做得不错）。打开隐私模式，音量调低，紧挨着你坐的人也听不到任何声音。

Audio-only isn't a compromise. It's the only approach that actually works.

纯音频不是妥协。它是唯一真正可行的方案。

## Hardware requirements / 硬件需求

| What / 什么 | Why / 为什么 |
|------|------|
| **Xiaomi Smart Glasses** (any model with a camera) | Takes the photo that kicks off the entire pipeline. 拍下触发整个流水线的照片。 |
| **Android phone** | Runs MacroDroid, executes the shell script, makes the API calls. 运行 MacroDroid，执行 shell 脚本，发起 API 调用。 |
| **Earbuds** (optional) | The glasses' built-in speakers work great at low volume. Pair Bluetooth earbuds if you want even more privacy. 眼镜自带扬声器在低音量下效果很好。如果想要更高隐蔽性可以配蓝牙耳机。 |

## Software requirements / 软件需求

| What / 什么 | Why / 为什么 |
|------|------|
| **MacroDroid** (Android) | Watches the photo folder, triggers the script, plays the audio. Free tier is enough. 监控照片文件夹，触发脚本，播放音频。免费版就够了。 |
| **curl** on the phone | Makes the API calls. Get it via **Termux** (no root needed) or it comes pre-installed on rooted phones. 发起 API 调用。通过 Termux 获取（不需要 root），或者 root 过的手机自带。 |
| **小米眼镜 app** (Xiaomi Glasses) | The official companion app — needed to import photos from glasses to phone storage. 官方配套 app——用于把照片从眼镜导入手机存储。 |

## API keys / API 密钥

You need exactly two API keys. That's it.

你只需要两个 API 密钥，仅此而已。

| Key / 密钥 | Where to get it / 在哪里获取 | Cost / 费用 |
|-----|-----------------|------|
| **Gemini API Key** | [Google AI Studio](https://aistudio.google.com/apikey) | Free tier available / 有免费额度 |
| **OpenAI API Key** | [OpenAI Platform](https://platform.openai.com/api-keys) | Pay-per-use, TTS is cheap / 按量计费，TTS 很便宜 |

Paste them directly into the MacroDroid shell script (replace the `YOUR_..._HERE` placeholders), or set them as environment variables if you're using the debug tool.

把它们直接粘贴到 MacroDroid shell 脚本里（替换 `YOUR_..._HERE` 占位符），或者在使用调试工具时设置为环境变量。

## Directory layout / 目录结构

```
glasses-auto-answer/
├── README.md                        ← You are here / 你在这里
├── android-scripts/
│   └── study_dictation_full.sh      ← The production shell script that runs on Android
│                                       在 Android 上实际运行的生产脚本
├── macrodroid/
│   └── setup-guide.md               ← Step-by-step MacroDroid setup for complete beginners
│                                       面向零基础用户的 MacroDroid 配置指南
├── debug-tool/
│   ├── README.md                    ← Debug tool docs / 调试工具文档
│   ├── app.py                       ← Python web server for prompt tuning + TTS preview
│   │                                   用于调试 prompt 和试听 TTS 的 Python Web 服务器
│   ├── run.sh                       ← Quick launcher / 快速启动脚本
│   └── static/
│       ├── index.html               ← Web UI / 网页界面
│       ├── app.js                   ← Frontend logic / 前端逻辑
│       └── styles.css               ← Styling / 样式
└── prompts/
    ├── gemini-prompt.md             ← The Gemini prompt, documented and explained
    │                                   Gemini prompt 的文档化说明
    └── tts-instructions.md          ← The TTS system instructions, documented and explained
                                       TTS 系统指令的文档化说明
```

## Quick links / 快速链接

- **[MacroDroid Setup Guide](macrodroid/setup-guide.md)** — Complete beginner walkthrough for setting up the two macros on your phone. Don't know what MacroDroid is? Start here.
  手机上配置两个宏的完整新手教程。不知道 MacroDroid 是什么？从这里开始。

- **[Gemini Prompt Documentation](prompts/gemini-prompt.md)** — The prompt that makes this whole thing work, broken down section by section with explanations.
  让这一切运转的 prompt，逐节拆解并附有解释。

- **[TTS Instructions Documentation](prompts/tts-instructions.md)** — How we tell OpenAI's voice model to read like a patient teacher.
  我们如何让 OpenAI 的语音模型像一个有耐心的老师一样朗读。

- **[Debug Tool](debug-tool/README.md)** — Desktop web UI for tuning prompts and testing TTS without touching your phone.
  桌面端网页工具，用于在不碰手机的情况下调试 prompt 和测试 TTS。

- **[Shell Script](android-scripts/study_dictation_full.sh)** — The actual script that runs on Android. Read it to understand exactly what happens when you take a photo.
  实际在 Android 上运行的脚本。读一下就知道拍照后到底发生了什么。

## How the prompt works (briefly) / Prompt 简述

The Gemini prompt is the soul of this system. It does three jobs simultaneously, and it took a lot of painful iteration to get right:

Gemini prompt 是整个系统的灵魂。它同时做三件事，经过了大量痛苦的迭代才调好：

1. **Solves the problem** — reads the photo, identifies each question, works through the full solution to get maximum marks.
   **解题** ——读取照片，识别每道题，完整推导解答过程以拿满分。

2. **Formats for dictation** — outputs the answer in a spoken-word format designed to be written down verbatim. No math symbols, no markdown. Chinese numbers read digit-by-digit. Single-letter variables prefixed with "字母" so TTS doesn't skip them. Pauses marked with punctuation.
   **格式化为听写格式** ——以口述格式输出答案，可以逐字抄写。没有数学符号，没有 markdown。中文数字逐位读。单字母变量前加"字母"防止 TTS 跳过。用标点标记停顿。

3. **Stays within TTS limits** — keeps output under 3500 characters (the script enforces a hard limit at 3900) so OpenAI TTS processes it cleanly.
   **控制在 TTS 限制内** ——输出控制在 3500 字符以内（脚本硬限制 3900），确保 OpenAI TTS 能正常处理。

The TTS instructions then tell OpenAI's voice model to read like a patient teacher: slow, clear, with pauses between problems and natural English pronunciation for technical terms.

TTS 指令告诉 OpenAI 的语音模型像一个有耐心的老师一样朗读：缓慢、清晰，题目之间有停顿，专业术语用自然的英文发音。

For the full prompt breakdown, see [prompts/gemini-prompt.md](prompts/gemini-prompt.md) and [prompts/tts-instructions.md](prompts/tts-instructions.md).

完整的 prompt 拆解见 [prompts/gemini-prompt.md](prompts/gemini-prompt.md) 和 [prompts/tts-instructions.md](prompts/tts-instructions.md)。

---

*Built to solve a real problem: hearing the answer is better than seeing it when you need to look normal.*

*为了解决一个真实的问题而构建：当你需要看起来正常时，听到答案比看到答案更好。*
