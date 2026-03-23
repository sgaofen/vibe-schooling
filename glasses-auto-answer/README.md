# Glasses Auto-Answer System

> **[中文版](README_CN.md)**

Put on the glasses. Take a photo of the exam question. A few seconds later, the answer plays in your ear. Write it down. Done.

No phone in hand, no screen glowing, no suspicious behavior. The whole thing runs in your pocket.

---

## How it works

```
Glasses photo → /DCIM/XiaomiGlass/IMG*.jpg
  → MacroDroid detects new file
    → Shell script:
        1. base64 encode the image
        2. Send to Gemini 3 Flash (high thinking)
        3. Extract the answer
        4. Send to OpenAI TTS (gpt-4o-mini-tts, coral)
        5. Save as tts_output.mp3
    → MacroDroid plays the audio
      → You hear the answer through the glasses
```

You snap a photo. MacroDroid picks it up. A shell script fires off two API calls — one to Gemini to solve the problem, one to OpenAI to turn the answer into speech. The MP3 plays through your glasses speakers. That's the whole pipeline. No server, no app, just a script on your phone.

## Why audio and not a screen

Tried screen glasses. They all leak light. Doesn't matter if it's a green tint display or a full-color one — the back of the lens glows, and anyone behind you can see it. Spent way too long looking for one that doesn't. None of them work.

Audio is different. The glasses just look like glasses. Xiaomi did a good job making them look normal. Turn on privacy mode, keep the volume low, and the person next to you won't hear anything. I've tested this sitting shoulder-to-shoulder with someone — they had no idea.

The one thing you need to deal with is the indicator light. When the camera fires, a small LED blinks. Stick an anti-light privacy sticker over it. In daylight, it's invisible.

## What you need

**Hardware:**
- Smart glasses with a camera and speakers — I use the **Xiaomi AI Glass** (12MP camera, 40g, looks like normal frames, ~¥1999). **Ray-Ban Meta** ($299+) and **Solos AirGo A5** work too. Anything with a camera + speakers/earbuds will do.
- Android phone
- Earbuds (optional — the built-in speakers are fine at low volume)

**Software:**
- [MacroDroid](https://www.macrodroid.com/) — free version works
- Xiaomi Glasses app (小米眼镜) — for importing photos to phone storage

**API keys:**
- [Gemini API key](https://aistudio.google.com/apikey) — free tier is enough
- [OpenAI API key](https://platform.openai.com/api-keys) — pay-per-use, TTS is cheap

## What's in this folder

```
glasses-auto-answer/
├── android-scripts/
│   └── study_dictation_full.sh    # The script that runs on your phone
├── macrodroid/
│   └── setup-guide.md             # Step-by-step setup for beginners
├── prompts/
│   ├── gemini-prompt.md           # How the Gemini prompt works
│   └── tts-instructions.md        # How the TTS voice is configured
└── debug-tool/
    ├── app.py                     # Web UI for testing prompts on your computer
    └── static/                    # Frontend files
```

## Where to start

**New here?** Go to the [MacroDroid Setup Guide](macrodroid/setup-guide.md). It walks you through everything from installing the app to hearing your first answer.

**Want to tweak the prompt?** Read the [Gemini prompt breakdown](prompts/gemini-prompt.md). Every rule in that prompt exists because something went wrong without it.

**Want to test on your computer first?** The [debug tool](debug-tool/) lets you drag in a photo, adjust the prompt, hear the TTS output, and export the final script — all from a browser.

## About the prompt

I spent a lot of time on this. The prompt has to do three things at once: solve the problem correctly, format the answer so TTS can actually read it without skipping letters or swallowing units, and keep the output short enough that OpenAI doesn't choke on it (under 3500 characters).

The hardest part was getting TTS to read single-letter variables. If you just write "w" or "n", TTS ignores it. So the prompt tells Gemini to output "字母w" (meaning "the letter w") — forces TTS to say it out loud. Same deal with units after numbers: without a comma between "86.3" and "J", TTS merges them into nonsense.

All of this is documented in [prompts/gemini-prompt.md](prompts/gemini-prompt.md).
