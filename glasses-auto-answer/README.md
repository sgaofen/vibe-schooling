# Glasses Auto-Answer System

> **[中文版](README_CN.md)**

Put on the glasses. Take a photo of the exam question. ~15-25 seconds later, the answer plays in your ear. Write it down. Done.

No phone in hand, no screen glowing, no suspicious behavior. The whole pipeline runs in your pocket.

---

## Architecture

```
Xiaomi AI Glass — photo of paper
  → Bluetooth → 小米眼镜 app (camera roll lives inside the app)
眼镜_纯导入.macro — MacroDroid taps "导入" every 3s
  → photo lands in /sdcard/DCIM/XiaomiGlass/IMG*.jpg
上传文件_azure.macro — FileChangedTrigger watches that folder
  → ShellScript:
      1-3. curl Gemini 3 Flash Preview (thinkingLevel=high) → answer text
      4.   curl Azure Speech REST (westus2) → tts_output.mp3
      5.   sanity-check the mp3
  → PlaySoundAction plays /storage/emulated/0/MacroDroid/tts_output.mp3
  → audio comes through the glasses' bone-conduction speaker
```

End-to-end: ~15-25 seconds from shutter to first syllable. No server, no app to install — two MacroDroid macros and a shell script.

---

## What we picked, and why

### Vision: Gemini 3 Flash Preview, `thinkingLevel: high`

We compared Gemini 3 Flash against GPT-5.5 across 60 trials on the same multiple-choice exam photos:

| Model | All-trial-stable on MC | Notes |
|---|---|---|
| **Gemini 3 Flash** | **58%** | Stable picks; willing to answer exam photos |
| GPT-5.5 | 38% | Drifts: same letter, different option text per trial (B platyhelminth → B annelid → B amnion). Trips its own "I won't help with active exams" guard on borderline images. |

Gemini also ships ~30% cheaper output tokens (~100 vs ~1000 — GPT-5 hides reasoning inside `completion_tokens`).

`thinkingLevel: high` averages 12.2s latency (range 4.5-28.7s on 60 trials). `medium` is ~30% faster with the same answer quality on clear images, so swap to medium if your photos are clean. We default to `high` because lecture-hall lighting and busy backgrounds eat the speed savings anyway.

### TTS: Azure Speech REST direct, `zh-CN-XiaoxiaoNeural` at `rate=-25%`

Head-to-head on a 500-character mixed Chinese-English answer:

| Engine | Latency | Quality | Notes |
|---|---|---|---|
| **Azure Speech REST** | **~1s** end-to-end (Mac → westus2) | Reads every char | Winner. F0 free tier = 500K chars/month. $100 student credit on S0 ≈ 6M chars ≈ 10+ years. |
| edge-tts (unofficial) | ~1.25s | Same voice model | Free, no SLA — uses an undocumented Edge browser API. |
| OpenAI gpt-4o-mini-tts (Coral) | ~14s for 500 chars | Natural, but stochastic | Occasional silent skipping on long inputs. Paid. |
| Piper local (zh_CN-huayan-medium) | local | Garbage on mixed content | Silently drops English/formula segments. 63s of audio for what should be 100s. |
| macOS `say` (Tingting) | local | Fine | Mac-only, useful for desktop testing. |

**Why traditional TTS beats LLM-based TTS for dictation.** Pre-LLM TTS engines (VITS, FastSpeech2 + HiFi-GAN, Tacotron2) were engineered around stability — every character in equals every character out. Azure Neural TTS uses FastSpeech2 + HiFi-GAN under the hood. LLM-based TTS (gpt-4o-mini-tts, Bark, VALL-E) sounds more natural but treats audio as a generative codec sequence — outputs are stochastic and occasionally drop characters. For dictation where you must read every digit and every variable name, traditional TTS wins.

`rate=-25%` slows the voice to a comfortable note-taking pace.

### Photo path: raw photos straight to Gemini

The production flow sends the raw glasses photo directly to Gemini. With Gemini 3 Flash, that's ~90% accurate even on handheld angled photos with hand intrusion — no preprocessing required.

If you want tighter cropping (fewer Gemini input tokens, no surrounding scene visible to the LLM), we trained a dedicated paper segmentation model: [**sgaofen/paper-extractor**](https://github.com/sgaofen/paper-extractor). It's a small Unet (~5M params, 34MB ONNX, ~100ms on phone CPU) trained on 341 of these handheld glasses photos with manual 4-corner annotations. Val IoU = 0.96.

Integration sketch: run the model in a tiny Python service on the phone (Termux + onnxruntime, ~350ms total step latency), and add one `curl 127.0.0.1:8125/extract` step before the Gemini call. The model returns the warped page (or passes the raw photo through if the mask is too irregular). See the dedicated repo's README for details.

We tried two earlier approaches that didn't pan out:
- **OpenCV-only (Canny + Hough + approxPolyDP)**: ~60% on clean scans, fell apart on handheld angles.
- **U²-Netp pretrained on generic salient objects**: ~80% baseline; failed at extreme angles because "generic salient object" isn't the same task as "paper boundary".

The custom-trained model in `sgaofen/paper-extractor` solves the angle problem because the training data is in-domain.

---

## Repo layout

```
glasses-auto-answer/
├── android-scripts/
│   └── study_dictation_full.sh   # Canonical one-shot: Gemini → Azure → mp3
├── macrodroid/
│   ├── 眼镜_纯导入.macro          # Macro 1: tap 导入 every 3s
│   ├── 上传文件_azure.macro       # Macro 2: trigger on file change, run script, play mp3
│   ├── setup-guide.md            # Step-by-step deployment
│   └── setup-guide_cn.md
├── prompts/
│   └── gemini-prompt.md          # The Gemini prompt, annotated
└── debug-tool/                    # Local web UI for prompt iteration
    ├── app.py                    # Calls Gemini + Azure on your dev machine
    └── static/
```

Page-cropping is optional and lives in a separate repo: [sgaofen/paper-extractor](https://github.com/sgaofen/paper-extractor).

---

## Deploy

1. Get an [Azure Speech key](https://portal.azure.com) (Free F0 tier, region `westus2` or any region near you).
2. Get a [Gemini API key](https://aistudio.google.com/apikey).
3. On your Android phone: install MacroDroid (free version is fine) and the 小米眼镜 app.
4. Import [`macrodroid/眼镜_纯导入.macro`](macrodroid/眼镜_纯导入.macro) and [`macrodroid/上传文件_azure.macro`](macrodroid/上传文件_azure.macro) into MacroDroid.
5. Open the second macro's shell script action and replace `REPLACE_WITH_YOUR_GEMINI_API_KEY` and `REPLACE_WITH_YOUR_AZURE_KEY` with your actual keys.
6. Walk through the [MacroDroid setup guide](macrodroid/setup-guide.md) for the ColorOS/OPPO permission checklist — the foreground-service permission is the one most people miss.

Smoke test: open the import dialog in 小米眼镜, take a photo through the glasses, wait 15-25 seconds, listen.

---

## Iterate on prompts before deploying

The [debug tool](debug-tool/) is a local web UI. Drop in a sample photo, edit the prompt in the browser, send to Gemini, hit Azure, listen to the result. Much faster than re-uploading scripts to MacroDroid. It reads `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` from env vars or `~/.azure-tts.env`.

```bash
cd debug-tool
GEMINI_API_KEY=... AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=westus2 python3 app.py
# open http://127.0.0.1:8765
```

---

## About the Gemini prompt

Output is going to a TTS engine, not a screen. The prompt has to do three things at once:

1. Solve the problem correctly.
2. Format the answer so a TTS engine actually reads every letter and unit (single-letter variables get a `字母` prefix; numbers and units get a comma between them; consecutive variables get split with `乘以`).
3. Stay short enough — no hard char limit on Azure, but shorter audio is faster to listen through.

Every rule in the prompt exists because something went wrong without it. See [`prompts/gemini-prompt.md`](prompts/gemini-prompt.md) for the breakdown.
