# MacroDroid Setup Guide

> **[中文版](setup-guide_cn.md)**

End state: photo through the glasses → 15-25s wait → answer plays in your ear.

---

## Prerequisites

1. **MacroDroid** from Google Play (free version works).
2. **小米眼镜 app** installed and paired with your glasses.
3. **API keys**: Gemini + Azure Speech (see below).
4. **Permissions**: accessibility, storage, notifications, overlay, battery optimization disabled. Plus the ColorOS/OPPO checklist further down if you're on Oppo/Realme/OnePlus.

### Get the API keys

| Key | Where | Cost |
|-----|-------|------|
| **Gemini API key** | [Google AI Studio](https://aistudio.google.com/apikey) → Create API key | Free tier covers typical use |
| **Azure Speech key** | [portal.azure.com](https://portal.azure.com) → create a Speech resource (region: `westus2` or closer) → grab `KEY 1` | F0 free tier = 500K chars/month. Way more than you need. |

For Azure: when you create the resource, pick **F0 (Free)** as the pricing tier. If you ever blow past 500K chars/month, change the resource to S0 — same key, no script change needed.

---

## What you're building

Two macros:

| Macro | Purpose |
|-------|---------|
| `眼镜_纯导入.macro` | Taps the 「导入」 button in the 小米眼镜 app every 3 seconds, so photos move from glasses → phone storage |
| `上传文件_azure.macro` | Watches the photo folder. New photo → run shell script (Gemini + Azure) → play the resulting mp3 |

---

## Step 1: Edit the shell script

Before importing, open [`android-scripts/study_dictation_full.sh`](../android-scripts/study_dictation_full.sh) in any text editor. At the top:

```sh
api_key="REPLACE_WITH_YOUR_GEMINI_API_KEY"
TTS_KEY="REPLACE_WITH_YOUR_AZURE_KEY"
TTS_REGION="westus2"
TTS_VOICE="zh-CN-XiaoxiaoNeural"
TTS_RATE="-25%"
```

Paste your real keys in. Change `TTS_REGION` if you picked a different Azure region. Save.

> The same script body lives inside the `m_script` field of `macrodroid/上传文件_azure.macro`. You can edit it in the .macro JSON before importing, or edit it inside MacroDroid after importing — both work. Editing inside MacroDroid is usually less error-prone.

---

## Step 2: Import the two macros

1. Copy `macrodroid/眼镜_纯导入.macro` and `macrodroid/上传文件_azure.macro` to your phone (cloud sync, USB, anything).
2. In MacroDroid: **Settings → Import / Export → Import** → pick each file.
3. After importing 上传文件_azure: open it, tap the Shell Script action, and paste your real `api_key` and `TTS_KEY` in.
4. Toggle both macros on.

The macros come pre-wired:

- `眼镜_纯导入` triggers every 3s, simulates a click on the 「导入」 button by text match. Stay on the import dialog screen in the 小米眼镜 app while using it.
- `上传文件_azure` watches `/storage/emulated/0/DCIM/XiaomiGlass/IMG*` (Created/Modified/Deleted), runs the script, then plays `/storage/emulated/0/MacroDroid/tts_output.mp3`.

---

## Step 3: ColorOS / OPPO permission checklist

OPPO's ColorOS aggressively kills background apps. If you're on Oppo/Realme/OnePlus, do **all of these**:

- **Settings → Battery → Battery Optimization → MacroDroid: Don't optimize / Unrestricted**
- **Settings → Apps → MacroDroid → Auto-launch: Allow**
- **Settings → Apps → MacroDroid → Background activity: Allow**
- **Settings → Battery → Smart background freeze: OFF** (or whitelist MacroDroid)
- **Recent apps screen → drag MacroDroid down → tap the lock icon** (locks it against task killing)
- **MacroDroid → Settings → Notification bar → Display permanent notification: ON** ← **the foreground-service exemption. This is the one most people miss.**
- **Developer options**: "Don't keep activities" OFF, "Background process limit" = standard.
- The 小米眼镜 app **also** needs background-launch + auto-launch permission. Otherwise rapid macro fires will get the *target* app frozen instead of the macro.

If your audio randomly stops playing after 5-10 minutes idle, it's almost always one of the above.

---

## Step 4: Smoke test

1. Open 小米眼镜 app, navigate to the import dialog (the one with the 「导入」 button visible). Stay on this screen.
2. Verify both macros are enabled in MacroDroid.
3. Take a photo through the glasses.
4. Wait. Within ~3s the photo should move to phone storage. Within another ~12-22s the answer plays.

Total: usually 15-25 seconds from shutter to first syllable.

---

## Troubleshooting

If you don't hear audio, check these debug files on your phone:

| File | What it tells you |
|------|------------------|
| `/sdcard/tts_error.txt` | Either Gemini didn't return text, or Azure rejected the request (bad key, wrong region, expired tier) |
| `/sdcard/gemini_output.txt` | Exact text that Gemini returned |
| `/sdcard/gemini_response.json` | Raw Gemini API response — useful when output is empty |
| `/sdcard/tts_request.xml` | The SSML body sent to Azure |

Common causes:

- **No audio + tts_error.txt empty** → Gemini key is wrong, or quota exhausted.
- **tts_error.txt contains XML starting with `<?xml`** → Azure rejected. Likely a bad key, wrong region, or the resource is a non-Speech resource.
- **mp3 plays but is cut off / silent** → MacroDroid's PlaySoundAction occasionally collides with the system media stream. Try re-saving the macro with a different audio stream selected.
- **First photo works, then nothing** → ColorOS killed MacroDroid in the background. Re-do the permission checklist.

---

## Tips

- **DND on**: avoid notification chimes punching holes in your audio.
- **Volume**: test the glasses speaker volume in private first. There's a sweet spot — clearly audible to you, inaudible to whoever's next to you.
- **Iterate on the prompt with the desktop debug tool first.** Editing prompts inside MacroDroid is painful. The [debug tool](../debug-tool/) lets you drag in a sample photo, edit the prompt, hit Azure, listen — all in a browser.
- **Battery**: the 3-second import macro adds maybe 5-10% drain over a 2-hour exam. Disable both macros when you're not using them.
