# AI Model Selection Guide

> **[中文版](model-selection-guide_cn.md)**


---

## TL;DR

**Use Gemini 3 Flash for everything.** Seriously. Unless you have a very specific reason not to, it's the default.

---

## Why Gemini 3 Flash Wins

Here's what actually matters when you're running this system in real time during an exam: you need a model that is smart enough, fast enough, and cheap enough to call repeatedly without sweating.

Gemini 3 Flash hits that sweet spot better than anything else right now.

### Accuracy

With high thinking effort enabled, Gemini 3 Flash goes from roughly 95% accuracy on college-level questions to **98-99%**. That last few percent matters — it's the difference between an A and an A+, and more importantly, it's the difference between getting a tricky question right vs. having to guess.

### Image Recognition — The Killer Feature

This is where Gemini 3 genuinely pulls ahead. Its image understanding is **exceptionally strong** — noticeably better than both Claude and GPT for visual tasks. We're talking about:

- **Biological diagrams** — cell structures, organ systems, microscope images
- **Phylogenetic trees** — correctly reading branching patterns and evolutionary relationships
- **Blurry photos from glasses cameras** — this is the real test. When you're sneaking a photo with smart glasses, image quality is never great. Gemini 3 handles degraded image quality far better than the competition.
- **Charts and graphs** — reading values off axes, understanding trends, interpreting complex multi-panel figures

For pure text/reasoning tasks (no images involved), the advantage is less dramatic. All the frontier models are pretty close on text-only questions. But the moment an image is involved, Gemini 3 is the clear winner.

---

## Model Comparison Table

| Dimension | Gemini 3 Flash | Claude (Sonnet/Opus) | GPT-4o | Chinese Models (DeepSeek, GLM, etc.) | Kimi |
|-----------|:-:|:-:|:-:|:-:|:-:|
| **Text accuracy** | A+ | A+ | A | A | A- |
| **Image understanding** | S | A | A- | D (OCR-based) | B+ |
| **Blurry image handling** | S | B+ | B | F | B |
| **Speed** | Fast | Medium | Fast | Slow | Medium |
| **Cost** | Low | High | Medium | Low | Medium |
| **Mixed language support** | A | A | A | A+ (Chinese) | A+ (Chinese) |
| **Overall recommendation** | **Best choice** | Good backup | Decent | Text-only OK | Best Chinese option |

---

## Chinese Models — The Real Story

Let's be honest about Chinese AI models, because there's a lot of hype and not enough honest testing.

### The Multimodal Problem

Among Chinese models, **only Kimi is truly multimodal**. This is a crucial distinction that most people miss.

DeepSeek, GLM, MiniMax — these are all good models. They can reason well, they understand Chinese context beautifully, and for text-only tasks they're perfectly viable. But here's the thing: **they are NOT natively multimodal.** When you send them an image, they don't "see" it the way Gemini does. They run OCR preprocessing to extract text from the image, then reason about that extracted text.

What gets lost in OCR preprocessing:
- Spatial relationships in diagrams
- Arrows and connection lines
- Color-coded information
- Handwritten annotations
- Anything in a blurry or low-quality image

### Latency Issues

Chinese models also tend to have higher latency due to compute constraints. When you're sitting in an exam and every second counts, an extra 3-5 seconds per question adds up fast. Gemini consistently returns results faster.

### When to Use Chinese Models

- Pure text questions with no images → totally fine, sometimes even better for Chinese-language subjects
- You're behind a firewall and can't access Google → Kimi is your best bet for multimodal, DeepSeek for text
- Cost is the primary concern → Chinese models are generally cheaper

---

## Bottom Line

For this system — where you're capturing images from glasses or screenshots, need fast responses, and accuracy on visual content is make-or-break — **Gemini 3 Flash with high thinking effort is the answer.** It's not even close for image-heavy subjects like biology, chemistry, and any course with lots of diagrams.

For a text-only philosophy essay question? Sure, use whatever you want. But if there's even a chance an image is involved, stick with Gemini 3.
