# TTS Provider Comparison

> **[中文版](tts-comparison-guide_cn.md)**


Picking a TTS engine sounds simple until you realize your content is a chaotic mix of Chinese, English, numbers, units, commas, and scientific notation — all in the same sentence. That's when most TTS engines fall apart. Here's what actually works and what doesn't.

## The Winner: OpenAI TTS

**Model**: `gpt-4o-mini-tts` with the `coral` voice.

This is the one we're using, and here's why:

- **Handles mixed-language content correctly.** Chinese sentence, English term in the middle, a number with units, back to Chinese — it reads it all without stumbling. This sounds basic, but it's shockingly rare.
- **MP3 output directly.** This matters more than you'd think. MacroDroid (the Android automation layer) needs MP3 files for audio playback. No format conversion step = no extra latency = no extra failure points.
- **The "instructions" system prompt.** You can tell it exactly how to pronounce things, what pace to use, where to emphasize. This level of control is invaluable for exam answer readback where clarity is everything.
- **Human-like intonation.** It's not going to win any voice acting awards, but it sounds like a person talking, not a GPS navigator reading a textbook.

**The honest drawbacks:**
- Voice quality isn't stunning. It's clear and comprehensible, not beautiful.
- At slower playback speeds, you'll notice slight electronic artifacts — a faint metallic edge. At normal speed it's fine.
- It's not the cheapest option per character.

But here's the thing: it's the **only** engine that reads everything correctly and stays comprehensible across our specific content format. "Works every time" beats "sounds prettier but skips words" any day of the week.

## Chinese TTS Models — Beautiful Voices, Broken Output

We tested several:

- **Fish Speech**
- **Index 3 TTS**
- **Xiaomi MIMO TTS**

These models are genuinely impressive for what they're designed to do. Voice cloning is eerily good. Pure Chinese content sounds natural and expressive. Pure English content is decent too.

**But they completely fall apart on mixed content:**

- Words get skipped between commas. The model seems to lose track of what it was saying.
- English words embedded in Chinese sentences get mangled — single letters read incorrectly or just... ignored.
- Numbers with units (like "3.5 mL" or "pH 7.4") become garbled nonsense.
- The jumbling gets worse with longer sentences. Short phrases are okay-ish; full exam answers are a disaster.

This isn't a minor issue. When you're listening to an exam answer through your glasses and the TTS skips a key term or misreads a number, you're worse off than having no help at all. Wrong information delivered confidently is dangerous.

**Verdict**: Amazing for voice cloning and dubbing. Completely unsuitable for this system's mixed-language exam content.

## Untested (But On the Radar)

**Google Cloud TTS:**
- Reputation for good multilingual handling
- Problem: doesn't support direct MP3 output. You'd need a format conversion step, which adds latency and complexity
- Not worth the engineering effort when OpenAI TTS already works

**Microsoft Edge TTS:**
- Free tier is generous
- Haven't gotten around to testing it
- If someone wants to try it and report back, that'd be useful

## Summary Table

| Provider | Mixed Language | MP3 Direct | Voice Quality | Pronunciation Control | Verdict |
|----------|--------------|------------|---------------|----------------------|---------|
| **OpenAI TTS** (gpt-4o-mini-tts) | Excellent | Yes | Good (not great) | Yes (instructions prompt) | **Use this one** |
| Fish Speech | Broken | Varies | Excellent (Chinese) | Limited | Don't use for this |
| Index 3 TTS | Broken | Varies | Excellent (Chinese) | Limited | Don't use for this |
| Xiaomi MIMO TTS | Broken | Varies | Excellent (Chinese) | Limited | Don't use for this |
| Google Cloud TTS | Unknown | No (needs conversion) | Good | Yes | Not tested — format issue |
| Microsoft Edge TTS | Unknown | Unknown | Good | Limited | Not tested |

## Configuration Tips

When using OpenAI TTS with the glasses pipeline:

1. **Use the `coral` voice** — it's the clearest for mixed content. Other voices (alloy, echo, etc.) are fine for English-only but coral handles the Chinese-English transitions best.
2. **Keep the instructions prompt focused** — tell it to read clearly, enunciate numbers and units, maintain a steady pace. Don't overcomplicate it.
3. **Normal speed is best** — slowing down introduces artifacts. If you need more time to process, use the pause/replay controls on the glasses instead of slowing the TTS.

---

# 中文版

## 赢家：OpenAI TTS

**模型**：`gpt-4o-mini-tts`，`coral` 嗓音。

## 国产 TTS — 声音好听，输出崩坏

测试了几个：**Fish Speech**、**Index 3 TTS**、**小米 MIMO TTS**

## 未测试（但在关注）
