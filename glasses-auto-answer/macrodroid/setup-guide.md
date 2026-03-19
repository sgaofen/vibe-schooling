# MacroDroid Setup Guide

> **[中文版](setup-guide_cn.md)**

This guide assumes you've never used MacroDroid before. Every step tells you exactly what to tap and what to fill in. Just follow along.

---

## Prerequisites

1. **MacroDroid** installed from Google Play (free version works fine)
2. **Xiaomi Glasses app** (小米眼镜) installed and paired with your glasses
3. Your **Gemini API key** and **OpenAI API key** ready to paste
4. MacroDroid has all necessary permissions: accessibility, storage, notification, overlay, battery optimization disabled

### Getting API Keys

| Key | Where to get it | Cost |
|-----|----------------|------|
| Gemini API Key | [Google AI Studio](https://aistudio.google.com/apikey) → click "Create API Key" | Free tier available |
| OpenAI API Key | [OpenAI Platform](https://platform.openai.com/api-keys) → click "Create new secret key" | Pay-per-use, TTS is cheap |

Save them somewhere — you'll need them shortly.

---

## Overview

You'll create exactly two macros:

| Macro | What it does |
|-------|-------------|
| **眼镜** (Glasses Control) | Auto-imports photos from glasses to phone storage every 25 seconds |
| **上传文件** (Upload File) | Detects new photos, runs the AI pipeline, plays the answer |

Here's what it looks like when both macros are set up:

![MacroDroid Overview](../../docs/images/macrodroid-overview.jpg)

---

## Step 1: Create the "眼镜" (Glasses) Macro

This macro works around a quirk of the Xiaomi Glasses app: photos taken with the glasses don't automatically appear in phone storage. You have to manually import them through the app. This macro automates that import by simulating UI taps every 25 seconds.

### How to set it up

1. Open MacroDroid
2. Tap the **+** button in the bottom right to create a new macro
3. Name it: **眼镜**

### Trigger

4. Tap **+** in the Trigger section
5. Select **Timer** → **Fixed Time Interval**
6. Set the interval to **00:00:25** (25 seconds)
7. Confirm

### Actions (add in this exact order)

8. Tap **+** in the Actions section and add these **8 actions** in order:

| # | Action | Configuration | Purpose |
|---|--------|--------------|---------|
| 1 | **UI Interaction** → Gesture | Duration: 250ms, From: (500, 2000), To: (500, 1000) | Swipe up to dismiss overlays |
| 2 | **Launch App** | App: "小米眼镜", check "Restart" | Open the glasses app |
| 3 | **Wait** | 5 seconds | Let the app fully load |
| 4 | **UI Interaction** → Click | Target text: "取消" (Cancel) | Dismiss sync dialog |
| 5 | **Wait** | 1 second | Brief pause |
| 6 | **UI Interaction** → Click | Target text: "导入" (Import) | Import photos to phone storage |
| 7 | **Wait** | 4 seconds | Let the import complete |
| 8 | **Go Home** | — | Return to home screen |

### Constraints

9. None — leave empty

### Save

10. Tap the save button in the top right

### What it looks like

![Glasses Macro](../../docs/images/macrodroid-glasses-macro.jpg)

### Notes

- **The coordinates (500, 2000) → (500, 1000) may need adjustment** for your phone's screen resolution. The idea is a simple swipe-up gesture in the center of the screen. Test it with MacroDroid's gesture tester first.
- **The 25-second interval is tunable.** Shorter = faster response but more battery drain. Longer = more delay. 25 seconds is a good sweet spot.
- **Disable this macro when you're not using it** to save battery.

---

## Step 2: Create the "上传文件" (Upload File) Macro

This is the real one — the macro that runs the AI pipeline. When a new photo lands in the glasses folder, this macro fires a shell script that sends it to Gemini, gets the answer, converts it to speech, and plays it.

### How to set it up

1. Tap **+** to create a new macro
2. Name it: **上传文件**

### Trigger

3. Tap **+** in the Trigger section
4. Select **File** → **File Changed**
5. Path: `/storage/emulated/0/DCIM/XiaomiGlass/IMG*`
6. Check all event types: **Created**, **Deleted**, **Updated**
7. Confirm

### Actions

Add **two actions**:

**Action 1: Shell Script**

8. Select **Device Actions** → **Shell Script**
9. Execution method: select **Not Rooted** (MacroDroid's built-in shell already includes curl — no root or Termux needed)
10. Paste the **entire script** from `android-scripts/study_dictation_full.sh` into the script content box
11. **Replace the API key placeholders** at the top of the script with your real keys:
    - `api_key="YOUR_GEMINI_API_KEY_HERE"` → your Gemini key
    - `OPENAI_KEY="YOUR_OPENAI_API_KEY_HERE"` → your OpenAI key

**Action 2: Play Audio**

12. Tap **+** to add another action
13. Select **Media** → **Play Audio**
14. File: `tts_output.mp3` (located at `/storage/emulated/0/MacroDroid/tts_output.mp3`)

### Constraints

15. None — leave empty

### Save

16. Tap save

### What it looks like

![Upload File Macro](../../docs/images/macrodroid-upload-macro.jpg)

![Shell Script](../../docs/images/macrodroid-shell-script.jpg)

---

## Step 3: Test

Once both macros are set up:

1. **Enable both macros** in MacroDroid (toggle them on)
2. **Take a photo** through the glasses of any homework problem
3. **Wait ~30 seconds** (25s for the import cycle + a few seconds for the AI pipeline) — you should hear the answer play through your glasses speakers

### Troubleshooting

If nothing happens, check these debug files on your phone:

| File | What it tells you |
|------|------------------|
| `/sdcard/tts_error.txt` | TTS failures (most common issue) |
| `/sdcard/gemini_output.txt` | What Gemini actually returned |
| `/sdcard/gemini_response.json` | Raw Gemini API response |
| `/sdcard/tts_http_status.txt` | HTTP status from OpenAI TTS |
| `/sdcard/tts_curl_exit.txt` | curl exit code for TTS call |
| `/sdcard/clean_text.txt` | The exact text sent to TTS |
| `/sdcard/tts_input_length.txt` | Character count of TTS input |

The most common failure is the TTS input being too long (over 3900 characters). If that happens, take photos of fewer questions at a time, or adjust the prompt for more concise output.

---

## Tips

- **Battery**: The "眼镜" macro firing every 25 seconds uses some battery — expect maybe 5-10% extra drain over a 2-hour exam. Disable it when not in use.
- **Do Not Disturb**: Enable DND mode so notification sounds don't interrupt audio playback.
- **Volume**: Test the glasses speaker volume beforehand. Find the sweet spot where you can hear clearly but nobody else can. Privacy mode helps.
- **Debug tool first**: Before deploying to your phone, use the [debug tool](../debug-tool/) on your computer to test with sample images. Much faster iteration.
