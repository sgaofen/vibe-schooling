# AI Model Selection Guide

> **[中文版](model-selection-guide_cn.md)**

I've burned through a lot of API credits testing models on real exam questions. Not benchmarks — actual college homework and quizzes. Here's what I landed on.

## Short answer: Gemini 3 Flash

For everything in this project — Canvas Sniper, glasses pipeline, prompt testing — use Gemini 3 Flash. It's the best tradeoff between smart, fast, and cheap that exists right now.

## Why Gemini 3 Flash

**Speed matters more than you think.** During an exam, every second of latency is a second you're sitting there doing nothing, looking suspicious. Gemini 3 Flash responds fast even with high thinking effort enabled. Claude and GPT are smart but noticeably slower, and when you're waiting for audio to play through your glasses, that delay adds up.

**Image recognition is where it really pulls ahead.** Google's benchmarks show Gemini 3 outperforming competitors on visual tasks by a wide margin — their Pro model hit 72.7% on ScreenSpot-Pro versus 36.2% for Claude Sonnet and 3.5% for GPT-5.1. The Flash model inherits the same vision architecture, and in my testing it reads blurry glasses photos better than anything else I've tried.

This matters because the glasses camera isn't great. You're taking photos through small lenses, often at weird angles, sometimes in bad lighting. Most models choke on these images. Gemini handles them surprisingly well — phylogenetic trees, chemical structure diagrams, graphs with small axis labels, even blurry handwritten problems.

**With high thinking effort**, accuracy on my college chemistry and physics questions goes from roughly 95% to 98-99%. That last few percent is the difference between nailing a tricky equilibrium problem and having to guess.

**Cost is low.** The free tier covers decent usage, and even paid is cheaper than Claude or GPT per call.

## What about Claude and GPT?

Both are good at reasoning. Pure text problems — philosophy essays, reading comprehension, legal analysis — they're competitive. GPT-4o and Claude Sonnet/Opus hold their own on text-only tasks.

But the moment there's an image, Gemini wins. And for this project, there's almost always an image.

They're also pricier. Dozens of API calls during a single exam adds up. Gemini's pricing is more forgiving.

## Chinese models

Tested these because I'm curious and because Google access isn't guaranteed everywhere.

**The critical thing: only Kimi is actually multimodal.** Sounds like a small detail but it changes everything.

DeepSeek, GLM (Zhipu), MiniMax — solid for text. Good Chinese language understanding, decent reasoning. But when you send them an image, they don't see it the way Gemini does. They run OCR first, extract text, then reason on that. The image itself — spatial layout, arrows, colors, diagram structure — gets lost in translation.

Text-heavy multiple choice? They're fine. Biology diagram showing a metabolic pathway? Physics force diagram? The OCR layer loses too much. I've had DeepSeek completely misread a phylogenetic tree because the branching structure didn't survive text extraction.

Kimi is the exception — native vision. Accuracy is decent, not Gemini level, but much better than OCR-based models on image tasks. Downside is speed. Chinese compute infrastructure means higher latency, and during an exam that matters.

**Bottom line:** behind a firewall and can't reach Google? Use Kimi for image tasks, DeepSeek for text. Otherwise, Gemini 3 Flash.

## Comparison

| | Gemini 3 Flash | Claude Sonnet | GPT-4o | Kimi | DeepSeek |
|---|---|---|---|---|---|
| Image understanding | Excellent | Good | Good | Decent | Poor (OCR) |
| Blurry photo handling | Excellent | Okay | Okay | Decent | Poor |
| Text reasoning | Very good | Excellent | Very good | Good | Very good |
| Speed | Fast | Medium | Fast | Slow | Medium |
| Cost | Low | High | Medium | Medium | Low |
| Multimodal | Native | Native | Native | Native | OCR-based |
