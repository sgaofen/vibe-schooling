# TTS Provider Comparison

> **[中文版](tts-comparison-guide_cn.md)**

The answers coming out of Gemini are a mess of Chinese, English, numbers, units, and scientific notation — all in the same sentence. Finding a TTS engine that doesn't butcher this took longer than I expected.

## The one that works: OpenAI TTS

**Model:** `gpt-4o-mini-tts` with the `coral` voice.

I tried a lot of options before settling on this. Here's why it won:

**It actually reads mixed-language content.** Chinese sentence, English chemistry term in the middle, a number with a unit, back to Chinese — it handles the switches without stumbling. Sounds basic. Almost nothing else can do it.

**MP3 output, no conversion.** MacroDroid needs an MP3 file to play audio. OpenAI gives you MP3 directly from the API. No ffmpeg, no format conversion step, no extra point of failure. This sounds minor but it saved me hours of debugging.

**The instructions parameter.** You can tell the model exactly how to read: slow pace, pause between questions, emphasize units after numbers. For exam answer dictation where you're writing while listening, this control is everything.

**It sounds like a person.** Not a great voice actor, but recognizably human. There's intonation, natural phrasing. You can listen to it for an hour without going crazy.

**The downsides:** voice quality is "clear" not "beautiful." Slow it down and you'll hear a faint metallic edge. And it costs more per character than Chinese alternatives. But it's the only engine where I can trust that every word gets read correctly.

**Pricing:** $0.60 per million text input tokens + $12 per million audio output tokens. Roughly $0.015 per minute of audio. A typical exam answer costs a fraction of a cent.

**Voices:** 13 options — coral works best for mixed Chinese-English in my testing. Other good ones: alloy (neutral), nova (warm), sage (calm).

## Chinese TTS: great voices, broken output

Tested three: **Fish Speech**, **Index 3 TTS**, **Xiaomi MIMO TTS**.

They're genuinely impressive for what they're built for. Voice cloning is scary good. Pure Chinese sounds natural and expressive. Pure English is decent too.

Then you feed them an exam answer with mixed content and it falls apart:

- Words vanish between commas. The model just... skips them.
- Single English letters embedded in Chinese get ignored or garbled.
- Numbers followed by units ("3.5 mL", "pH 7.4") turn into nonsense.
- Longer sentences are worse. Short phrases are okay-ish; a full multi-step calculation answer is a disaster.

This isn't a niche edge case — it's the primary use case of this system. Every answer has mixed content. If the TTS skips a variable name or misreads a number, you write the wrong thing on the exam. Confidently delivered wrong information is worse than no information.

**Verdict:** incredible for dubbing and voice cloning. Completely unusable for this project.

## Haven't tested yet

**Google Cloud TTS:** probably fine for multilingual, but it doesn't output MP3 directly. You'd need to convert WAV/OGG to MP3 on an Android phone, which adds latency and complexity. Not worth the effort when OpenAI already works.

**Microsoft Edge TTS:** free tier is generous. Haven't gotten around to testing it. If someone does, I'd like to hear the results.

## Summary

| Provider | Mixed language | Direct MP3 | Voice quality | Custom instructions | Use it? |
|----------|--------------|------------|---------------|-------------------|---------|
| OpenAI TTS (gpt-4o-mini-tts) | Works | Yes | Good | Yes | **Yes** |
| Fish Speech | Broken | Varies | Excellent (CN) | Limited | No |
| Index 3 TTS | Broken | Varies | Excellent (CN) | Limited | No |
| Xiaomi MIMO TTS | Broken | Varies | Excellent (CN) | Limited | No |
| Google Cloud TTS | Probably fine | No (needs convert) | Good | Yes | Untested |
| Microsoft Edge TTS | Unknown | Unknown | Good | Limited | Untested |
