# TTS Provider Comparison

> **[中文版](tts-comparison-guide_cn.md)**

The answers coming out of Gemini are a mess of Chinese, English, numbers, units, and scientific notation — all in the same sentence. Finding a TTS engine that doesn't butcher this took benchmarking five providers head-to-head.

## The current winner: Azure Speech REST direct

**Model:** `zh-CN-XiaoxiaoNeural` with `prosody rate="-25%"` for note-taking pace.
**Endpoint:** `https://westus2.tts.speech.microsoft.com/cognitiveservices/v1`
**Auth:** subscription key in the `Ocp-Apim-Subscription-Key` header.

### Why it wins

**Latency.** Bench results across five text lengths (5 trials each, Mac to Azure West US 2):

| chars | audio length | min/avg/max latency |
|---|---|---|
| 10 | 3.9s | 0.33 / 0.37 / 0.46s |
| 50 | 16.2s | 0.38 / 0.43 / 0.47s |
| 200 | 60.4s | 0.50 / 0.53 / 0.56s |
| **500** | **151s** | **0.89 / 0.99 / 1.06s** |
| 1500 | 459s | 2.08 / 5.77 / 11.59s |

500 characters is the typical exam-answer size. **~1 second end-to-end** for 2.5 minutes of audio. Real-time factor at the sweet spot is ~150x.

For comparison, the OpenAI baseline on the same 500-character text averaged **14 seconds**. Azure is roughly **14× faster** at this length because Azure streams the audio over the wire as it generates, while OpenAI returns the file only after the full clip has been synthesized.

**Reads every character.** The model is FastSpeech2 + HiFi-GAN under the hood — engineered for stability, not creativity. Mixed Chinese/English/numerical content, scientific notation, single English variable names embedded in Chinese sentences, all pass through cleanly. SSML prosody gives precise rate/pitch control without metallic artifacts even at -25%.

**Free tier covers daily use.** F0 is 500K characters/month for Neural TTS — enough for ~1000 typical exam answers. The $100 student credit on S0 (paid tier, $16/1M chars) buys 6M characters, which works out to over a decade at typical use.

**Direct MP3.** `X-Microsoft-OutputFormat: audio-24khz-48kbitrate-mono-mp3` returns MP3 bytes ready for MacroDroid's PlaySound action. No ffmpeg, no conversion step.

### Caveats

- Pick a region close to you. Westus2 RTT from Irvine ~15ms. East US from California is ~80ms — adds 200-300ms to every call. Doesn't matter much for short answers, hurts on long ones.
- Output token cost grows non-linearly past ~1500 chars (latency stops being deterministic). For your typical 200-800 char answer this is irrelevant; for a full 5-minute lecture transcript, expect 5-15s of generation time and occasional outliers.
- Azure subscription key in your shell script means it ends up on the phone. Treat it like any other secret: don't push the macro file to a public repo without scrubbing it first.

---

## The original solution: OpenAI gpt-4o-mini-tts (Coral)

This was the first thing I shipped. It works fine — Coral is a recognizably-human voice, mixed Chinese-English passes through, and the `instructions` parameter lets you steer pacing and emphasis. The reason it stopped being the winner is **latency**: 14 seconds for the typical 500-character answer is most of the perceived wait. With Azure swapped in, end-to-end falls from ~30-40 seconds to ~15-25 seconds, and the bottleneck moves to Gemini OCR (which is harder to optimize).

Things OpenAI still does well:
- Voice variety. Coral is one of 13 voices, several with distinct personalities.
- The `instructions` parameter accepts free-form behavior text — Azure SSML doesn't have an equivalent. If you want "read this like a stern teacher," OpenAI lets you say so.
- Stochastic generation produces *natural* prosody. Azure is engineered for character-level reliability and sometimes sounds slightly mechanical at -25% rate.

Things that pushed me off it for this project:
- 14s vs 1s on the actual answer length is hard to ignore.
- Long inputs (>1000 chars) occasionally drop characters silently. With LLM-style codec TTS, every output sequence is a sample from a distribution — most of the time it's correct, but rare outputs swallow words. For dictation that has to be 100% accurate, this is a deal-breaker.
- Paid only. No free tier.

If you want voice variety and don't care about a 10-second wait, OpenAI is still a fine choice.

---

## Edge TTS (`edge-tts` Python package)

Same voice models as Azure (Microsoft uses one model registry across both). `zh-CN-XiaoxiaoNeural` from edge-tts and Azure produce **byte-identical MP3 output** when given the same SSML — verified by md5 in our setup.

**Latency:** ~1.25s for 7.6s audio. Roughly 2× slower than Azure REST direct, because edge-tts goes through a websocket-based protocol designed for the Edge browser's reading-mode feature, with extra framing overhead.

**Why we didn't pick it:** Microsoft's Edge endpoint is undocumented. The `edge-tts` package keeps up when Microsoft tweaks the protocol, but there's no SLA and no support if it breaks. For a hobby tool that's fine; for "I need this to work tomorrow morning at 8am for my exam," Azure REST is the safer call.

**Why we tried it first:** zero auth, free, identical voice. If you don't want to set up an Azure subscription, this is the closest substitute.

---

## Local-only options (failed)

### Piper (`zh_CN-huayan-medium`)
75MB ONNX model, runs on CPU at >10× realtime, **completely fails on mixed Chinese-English content**. On our 552-character test prompt it returned 63 seconds of audio when it should have been ~100 seconds. The English characters and chemistry formulas got silently skipped — Piper's Chinese-only training data has no mapping for them. Unusable for this project.

### macOS `say` (Tingting / Meijia / Eddy / Flo / Sandy / Shelley etc.)
Surprisingly competent on mixed CN/EN. Tingting at `-r 130` does a passable dictation cadence. **Useful for desktop iteration** when you want to hear how a prompt revision will sound without burning Azure quota. But it only runs on macOS, so it's not a deployment option.

### Chinese-native open models (Fish Speech, Index 3 TTS, Xiaomi MIMO TTS, MeloTTS, CosyVoice, GPT-SoVITS, ChatTTS)
Voice cloning is impressive. Pure Chinese is excellent. Pure English is decent. **Mixed content falls apart the same way Piper does:** words vanish between commas, English letters get garbled, numbers with units turn into nonsense. The training data for these models is overwhelmingly monolingual; they don't know what to do with `字母P下标CO，等于，一点九六，atm`. If your content is single-language they're worth a look. Ours isn't.

---

## Summary

| Provider | Mixed CN/EN | Direct MP3 | Latency (500 chars) | Free tier | Use it? |
|---|---|---|---|---|---|
| **Azure Speech REST** | Excellent | Yes | **~1s** | 500K chars/month | **Yes — current winner** |
| edge-tts (same voice) | Excellent | Yes | ~1.5s | Unlimited (no SLA) | Acceptable backup |
| OpenAI gpt-4o-mini-tts (Coral) | Good | Yes | ~14s | None | Was the winner; Azure beat it |
| Google Cloud TTS | Probably fine | No (needs convert) | Untested | Limited | Untested |
| Piper (local) | Broken on mixed | Yes (WAV) | <1s local | Free | No |
| macOS `say` | Excellent | No (AIFF) | Instant | Free | Mac-only, dev-time only |
| Fish Speech / Index / MIMO | Broken on mixed | Varies | Varies | Varies | No |

## How to switch

The deployable script (`android-scripts/study_dictation_full.sh`) and the production macro both point to Azure REST direct. If you want to test Edge TTS or fall back to OpenAI:

- **Edge TTS:** `pip install edge-tts && edge-tts --voice zh-CN-XiaoxiaoNeural --rate=-25% --text "..." --write-media out.mp3`
- **OpenAI:** the OpenAI block lives as commented-out code in `debug-tool/app.py`. Uncomment, set `OPENAI_API_KEY`, you're back on the old setup.

If you want to A/B locally, the `paper-extractor/results/tts_compare/` directory has rendered samples from all five engines reading the same complex test text — listen and pick.
