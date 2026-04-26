# Debug Tool

> **[中文版](README_CN.md)**

A local web UI for iterating on the Gemini prompt and listening to the Azure TTS output before deploying anything to your phone. Editing prompts inside MacroDroid is painful — this is where you actually do the work.

## What it does

1. **Drag in an image** — a photo of a homework problem.
2. **Edit the Gemini prompt** in the browser.
3. **See Gemini's output** — read what came back, edit by hand if you want.
4. **Hit Azure Speech** — hear the audio in the browser.
5. **Export** — download a ZIP with the tuned shell scripts, ready to paste into MacroDroid.

Workflow: change a line, send, listen, repeat.

## Configure Azure Speech

The tool needs `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` (e.g. `westus2`). It picks them up from env vars or, as a fallback, from `~/.azure-tts.env`:

```bash
cat > ~/.azure-tts.env <<'EOF'
AZURE_SPEECH_KEY=your_key_1_from_azure_portal
AZURE_SPEECH_REGION=westus2
EOF
chmod 600 ~/.azure-tts.env
```

Free F0 tier covers 500K chars/month. Get the key from [portal.azure.com](https://portal.azure.com) → create a Speech resource → KEY 1.

## Run

```bash
GEMINI_API_KEY=your-key-here python3 app.py
# open http://127.0.0.1:8765
```

Or with both vars inline:

```bash
GEMINI_API_KEY=... AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=westus2 python3 app.py
```

Or use the convenience launcher:

```bash
./run.sh
```

No `pip install`, no virtualenv. Python 3 standard library only — `http.server`, `urllib`, `json`, `zipfile`, `html.escape`.

## Voice override

You can override voice/rate via env vars at startup:

- `AZURE_TTS_VOICE` (default `zh-CN-XiaoxiaoNeural`)
- `AZURE_TTS_RATE` (default `-25%`)

Voice catalog: [Azure neural voices list](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts). For dictation, slow rates (`-15%` to `-30%`) work best.

## This is NOT the production system

The debug tool runs on your computer. The production system runs on your Android phone via MacroDroid + the shell script in [`../android-scripts/study_dictation_full.sh`](../android-scripts/study_dictation_full.sh). They share the same prompt and the same Azure call shape; this UI just makes prompt iteration not awful.

Once a prompt feels right: copy the prompt body into the canonical shell script (or hit Export and copy from the ZIP) and update both macros.

## File structure

```
debug-tool/
├── app.py           Python web server (Gemini call, Azure TTS call, export)
├── run.sh           Launcher
└── static/
    ├── index.html   UI
    ├── app.js       Drag-drop, fetch, audio playback
    └── styles.css   Styling
```

---

*Iterate on your computer. Deploy to your phone.*
