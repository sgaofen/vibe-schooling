# MacroDroid Setup Guide / MacroDroid 配置指南

---

This guide assumes you've never used MacroDroid before. If you have, skip to the macro configs. If you haven't, don't worry — this is a very forgiving app, and the setup is surprisingly simple for what it does.

本指南假设你从未使用过 MacroDroid。如果你用过，直接跳到宏配置部分。如果没用过也别担心——这个 app 非常友好，考虑到它能做的事情，配置过程简单得出乎意料。

## Prerequisites / 前置条件

Before you start, make sure you have:

开始之前，确保你有：

1. **MacroDroid** installed from Google Play (free version works fine)
   从 Google Play 安装了 **MacroDroid**（免费版就够了）

2. **curl** available on your phone — either through **Termux** (install from F-Droid, not Play Store) or because your phone is rooted
   手机上有 **curl**——通过 **Termux** 获取（从 F-Droid 安装，不要从 Play Store 安装）或者你的手机已经 root

3. Your **Gemini API key** and **OpenAI API key** ready to paste
   准备好 **Gemini API 密钥**和 **OpenAI API 密钥**

4. The **小米眼镜 app** (Xiaomi Glasses) installed and paired with your glasses
   安装并配对了**小米眼镜 app**

5. MacroDroid has all necessary permissions: accessibility, storage, notification, overlay, battery optimization disabled
   MacroDroid 拥有所有必要权限：无障碍、存储、通知、悬浮窗、关闭电池优化

## Overview / 概览

You'll create exactly two macros:

你需要创建两个宏：

| Macro | What it does | 做什么 |
|-------|-------------|--------|
| **眼镜** (Glasses Control) | Automatically imports photos from glasses to phone every 25 seconds | 每 25 秒自动把照片从眼镜导入手机 |
| **上传文件** (Upload File) | Detects new photos, runs AI pipeline, plays the answer | 检测新照片，运行 AI 流水线，播放答案 |

Here's what it looks like when both macros are set up:

两个宏配置好后的样子：

![MacroDroid Overview](../../docs/images/macrodroid-overview.jpg)

---

## Macro 1: "眼镜" (Glasses Control) / 宏一："眼镜"（眼镜控制）

This macro is a workaround for a quirk of the Xiaomi Glasses app. Photos taken with the glasses don't automatically appear in your phone's storage — you have to manually import them through the app. This macro automates that import process by simulating the UI taps every 25 seconds.

这个宏是为了解决小米眼镜 app 的一个特性。通过眼镜拍的照片不会自动出现在手机存储中——你必须通过 app 手动导入。这个宏通过每 25 秒模拟界面点击来自动化导入过程。

It's a bit of a hack, honestly. But it works reliably and that's what matters.

说实话这有点 hack。但它稳定可靠，这才是重要的。

### Trigger / 触发器

- **Fixed Time Interval / 固定时间间隔**: `00:00:25` (every 25 seconds)

That's it. One trigger. It just fires every 25 seconds, rain or shine.

就这样。一个触发器。每 25 秒触发一次，风雨无阻。

### Actions (in exact order) / 动作（按确切顺序）

Here's the sequence. Each step matters, and the waits are there for a reason — the Xiaomi app is not fast.

以下是动作序列。每一步都有意义，等待时间是因为小米 app 不快。

| # | Action Type | Details | Why |
|---|------------|---------|-----|
| 1 | **UI Interaction** → Gesture/Swipe | Duration: 250ms, From: (500, 2000) → To: (500, 1000) | Swipe up to dismiss any overlay / 上划关闭可能的悬浮窗 |
| 2 | **Launch App** | App: "小米眼镜", Mode: Restart | Open the glasses app fresh / 重新打开眼镜 app |
| 3 | **Wait** | 5 seconds | Let the app fully load / 等待 app 完全加载 |
| 4 | **UI Interaction** → Click | Target: "取消" (Cancel) | Dismiss any sync dialog / 关闭可能的同步对话框 |
| 5 | **Wait** | 1 second | Brief pause / 短暂停顿 |
| 6 | **UI Interaction** → Click | Target: "导入" (Import) | Tap the import button to pull photos to phone storage / 点击导入按钮把照片导入手机存储 |
| 7 | **Wait** | 4 seconds | Let the import complete / 等待导入完成 |
| 8 | **Go Home** | — | Return to home screen to get out of the way / 回到主屏幕 |

### Constraints / 约束条件

None. This macro runs unconditionally.

无。此宏无条件运行。

### What it looks like / 配置截图

![Glasses Macro](../../docs/images/macrodroid-glasses-macro.jpg)

### Important notes / 重要说明

**The coordinates (500, 2000) → (500, 1000) are for a specific screen resolution.** If your phone has a different screen size, you'll need to adjust these. The idea is a simple swipe-up gesture in the center of the screen. Try it manually first — if MacroDroid's gesture tester hits the right spot, you're good.

**坐标 (500, 2000) → (500, 1000) 是针对特定屏幕分辨率的。** 如果你的手机屏幕尺寸不同，需要调整这些数值。思路就是在屏幕中央做一个简单的上划手势。先手动试一下——如果 MacroDroid 的手势测试器能准确点到位置，就没问题。

**The 25-second interval is tunable.** Shorter means faster response but more battery drain. Longer means more delay between taking a photo and hearing the answer. 25 seconds is a good sweet spot — fast enough that you're not waiting awkwardly, slow enough that your battery survives an exam.

**25 秒的间隔可以调整。** 更短意味着响应更快但更耗电。更长意味着拍照到听到答案之间有更多延迟。25 秒是一个不错的平衡点——快到不会尴尬地等待，慢到电池能撑过一场考试。

---

## Macro 2: "上传文件" (Upload File) / 宏二："上传文件"

This is the real one — the macro that runs the AI pipeline. When a new photo lands in the glasses folder, this macro fires the shell script that sends it to Gemini, gets the answer, converts it to speech, and plays it.

这才是真正干活的——当新照片出现在眼镜文件夹中时，这个宏触发 shell 脚本，把照片发送给 Gemini，获取答案，转换成语音，然后播放。

### Trigger / 触发器

- **File Changed / 文件变化**
  - Path: `/storage/emulated/0/DCIM/XiaomiGlass/IMG*`
  - Events: Created, Deleted, Updated (all three checked)

The `IMG*` wildcard matches the naming pattern Xiaomi uses for photos. When any file matching this pattern changes, the macro fires.

`IMG*` 通配符匹配小米给照片的命名规则。当任何匹配此模式的文件发生变化时，宏就会触发。

### Actions / 动作

| # | Action Type | Details |
|---|------------|---------|
| 1 | **Shell Script** | Paste the entire content of `study_dictation_full.sh` here (with your real API keys replacing the placeholders) |
| 2 | **Play Audio** | File: `tts_output.mp3` (located at `/storage/emulated/0/MacroDroid/tts_output.mp3`) |

That's all. Two actions. The shell script does the heavy lifting.

就这样。两个动作。shell 脚本干所有重活。

### Constraints / 约束条件

None.

无。

### What it looks like / 配置截图

![Upload File Macro](../../docs/images/macrodroid-upload-macro.jpg)

![Shell Script](../../docs/images/macrodroid-shell-script.jpg)

---

## Setting up the Shell Script / 配置 Shell 脚本

This is the part where most people get stuck, so let's be extra clear.

这是大多数人卡住的地方，所以说清楚一点。

### Step 1: Open the shell script source / 打开 shell 脚本源文件

Open `android-scripts/study_dictation_full.sh` in any text editor. You'll see two lines near the top:

用任何文本编辑器打开 `android-scripts/study_dictation_full.sh`。你会在顶部附近看到两行：

```bash
api_key="YOUR_GEMINI_API_KEY_HERE"
OPENAI_KEY="YOUR_OPENAI_API_KEY_HERE"
```

### Step 2: Replace the placeholders / 替换占位符

Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key, and `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key. Keep the quotes.

把 `YOUR_GEMINI_API_KEY_HERE` 替换成你的 Gemini API 密钥，把 `YOUR_OPENAI_API_KEY_HERE` 替换成你的 OpenAI API 密钥。保留引号。

### Step 3: Paste into MacroDroid / 粘贴到 MacroDroid

In the "上传文件" macro's Shell Script action, paste the **entire** script content. Yes, the whole thing. MacroDroid will run it as-is.

在"上传文件"宏的 Shell Script 动作中，粘贴**整个**脚本内容。对，全部。MacroDroid 会原样运行它。

### Step 4: Shell execution method / Shell 执行方式

This is important: the shell script needs either **root access** or the **Termux:Tasker plugin** to run curl. In MacroDroid's shell script settings:

这很重要：shell 脚本需要 **root 权限** 或 **Termux:Tasker 插件** 才能运行 curl。在 MacroDroid 的 shell 脚本设置中：

- **Rooted phone**: Select "Use root" as the execution method
  **已 root 手机**：选择"使用 root"作为执行方式

- **Non-rooted phone with Termux**: Select "Termux:Tasker" as the execution method. Make sure you've installed both Termux and the Termux:Tasker add-on.
  **未 root 手机用 Termux**：选择"Termux:Tasker"作为执行方式。确保你已经安装了 Termux 和 Termux:Tasker 插件。

---

## Testing / 测试

Once both macros are set up:

两个宏都配好之后：

1. **Enable both macros** in MacroDroid / 在 MacroDroid 中**启用两个宏**
2. **Take a photo** through the glasses of any homework problem / 用眼镜**拍一张**任何作业题的照片
3. **Wait** — within about 30 seconds (25s for the import cycle + a few seconds for the AI pipeline), you should hear the answer play through your glasses speakers
   **等待**——大约 30 秒内（25 秒导入周期 + 几秒 AI 流水线），你应该能听到答案通过眼镜扬声器播放

If nothing happens, check these debug files on your phone:

如果什么都没发生，检查手机上的这些调试文件：

| File | What it tells you | 告诉你什么 |
|------|------------------|-----------|
| `/sdcard/tts_error.txt` | TTS failures (most common issue) | TTS 失败（最常见的问题） |
| `/sdcard/gemini_output.txt` | What Gemini actually returned | Gemini 实际返回的内容 |
| `/sdcard/gemini_response.json` | Raw Gemini API response | Gemini API 原始响应 |
| `/sdcard/tts_http_status.txt` | HTTP status from OpenAI TTS | OpenAI TTS 的 HTTP 状态码 |
| `/sdcard/tts_curl_exit.txt` | curl exit code for TTS call | TTS 调用的 curl 退出码 |
| `/sdcard/clean_text.txt` | The exact text sent to TTS | 发送给 TTS 的确切文本 |
| `/sdcard/tts_input_length.txt` | Character count of TTS input | TTS 输入的字符数 |

The most common failure is the TTS input being too long (over 3900 characters). If that happens, the Gemini prompt might need adjustment for your specific type of homework — or the problem set was just really big.

最常见的失败原因是 TTS 输入太长（超过 3900 字符）。如果发生这种情况，可能需要针对你的具体作业类型调整 Gemini prompt——或者题量本身就很大。

---

## Tips / 小贴士

- **Battery**: MacroDroid running every 25 seconds will use some battery, but it's not dramatic. Expect maybe 5-10% extra drain over a 2-hour exam. Disable the "眼镜" macro when you're not using it.
  **电池**：MacroDroid 每 25 秒运行一次会消耗一些电量，但不算夸张。预计 2 小时考试大约额外消耗 5-10%。不用的时候记得关闭"眼镜"宏。

- **Do Not Disturb**: Consider enabling DND mode on your phone so notification sounds don't interrupt the audio playback.
  **勿扰模式**：考虑在手机上开启勿扰模式，这样通知声音不会打断音频播放。

- **Volume**: Test the glasses speaker volume beforehand. Find the sweet spot where you can hear clearly but nobody else can. Privacy mode helps a lot here.
  **音量**：提前测试眼镜扬声器音量。找到你能听清但别人听不到的最佳音量。隐私模式在这方面帮助很大。

- **Use the debug tool first**: Before deploying to your phone, use the [debug tool](../debug-tool/README.md) on your computer to test with sample images. Much faster iteration loop.
  **先用调试工具**：在部署到手机之前，先在电脑上用[调试工具](../debug-tool/README.md)测试样本图片。迭代循环快得多。

---

*If you got this far, you're basically done. Take a photo and listen.*

*如果你走到了这一步，基本上就搞定了。拍张照，听就行。*
