# AI Model Selection Guide / AI 模型选择指南

> Tested across hundreds of real exam questions — not benchmarks, not vibes, actual results.
>
> 经过数百道真实考试题目测试——不是跑分，不是感觉，是实打实的结果。

---

## TL;DR

**Use Gemini 3 Flash for everything.** Seriously. Unless you have a very specific reason not to, it's the default.

**所有项目都用 Gemini 3 Flash。** 真的。除非你有非常具体的理由，否则它就是默认选择。

---

## Why Gemini 3 Flash Wins

Here's what actually matters when you're running this system in real time during an exam: you need a model that is smart enough, fast enough, and cheap enough to call repeatedly without sweating.

Gemini 3 Flash hits that sweet spot better than anything else right now.

在考试实时使用这个系统时，真正重要的是：模型要够聪明、够快、够便宜，可以反复调用而不心疼。Gemini 3 Flash 目前在这三个维度的平衡上无人能敌。

### Accuracy

With high thinking effort enabled, Gemini 3 Flash goes from roughly 95% accuracy on college-level questions to **98-99%**. That last few percent matters — it's the difference between an A and an A+, and more importantly, it's the difference between getting a tricky question right vs. having to guess.

开启高思考强度后，Gemini 3 Flash 在大学水平题目上的准确率从大约 95% 提升到 **98-99%**。这几个百分点很关键——不仅是 A 和 A+ 的区别，更是答对一道刁钻题和只能猜的区别。

### Image Recognition — The Killer Feature

This is where Gemini 3 genuinely pulls ahead. Its image understanding is **exceptionally strong** — noticeably better than both Claude and GPT for visual tasks. We're talking about:

- **Biological diagrams** — cell structures, organ systems, microscope images
- **Phylogenetic trees** — correctly reading branching patterns and evolutionary relationships
- **Blurry photos from glasses cameras** — this is the real test. When you're sneaking a photo with smart glasses, image quality is never great. Gemini 3 handles degraded image quality far better than the competition.
- **Charts and graphs** — reading values off axes, understanding trends, interpreting complex multi-panel figures

这是 Gemini 3 真正拉开差距的地方。它的图像理解能力**异常强大**——在视觉任务上明显优于 Claude 和 GPT：

- **生物学图表**——细胞结构、器官系统、显微镜图像
- **系统发育树**——正确解读分支模式和进化关系
- **眼镜摄像头拍的模糊照片**——这才是真正的考验。用智能眼镜偷拍时图像质量不会好，Gemini 3 处理低质量图像的能力远超竞品
- **图表和曲线**——从坐标轴读数、理解趋势、解读复杂的多面板图形

For pure text/reasoning tasks (no images involved), the advantage is less dramatic. All the frontier models are pretty close on text-only questions. But the moment an image is involved, Gemini 3 is the clear winner.

纯文本/推理任务（不涉及图像）时优势没那么明显，各家前沿模型在纯文字题目上都差不多。但只要涉及图像，Gemini 3 就是明确的赢家。

---

## Model Comparison Table / 模型对比表

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

## Chinese Models — The Real Story / 国产模型——实际情况

Let's be honest about Chinese AI models, because there's a lot of hype and not enough honest testing.

说实话吧，国产 AI 模型炒作太多，诚实测试太少。

### The Multimodal Problem / 多模态问题

Among Chinese models, **only Kimi is truly multimodal**. This is a crucial distinction that most people miss.

国产模型中，**只有 Kimi 是真正的多模态**。这个区别至关重要，大多数人都忽略了。

DeepSeek, GLM, MiniMax — these are all good models. They can reason well, they understand Chinese context beautifully, and for text-only tasks they're perfectly viable. But here's the thing: **they are NOT natively multimodal.** When you send them an image, they don't "see" it the way Gemini does. They run OCR preprocessing to extract text from the image, then reason about that extracted text.

DeepSeek、GLM、MiniMax——都是好模型。推理能力强，中文语境理解到位，纯文字任务完全够用。但问题是：**它们不是原生多模态的。** 你发图片给它们时，它们不像 Gemini 那样真的"看到"图片。它们是先用 OCR 预处理提取文字，然后对提取的文字进行推理。

What gets lost in OCR preprocessing:
- Spatial relationships in diagrams
- Arrows and connection lines
- Color-coded information
- Handwritten annotations
- Anything in a blurry or low-quality image

OCR 预处理中丢失的信息：
- 图表中的空间关系
- 箭头和连接线
- 颜色编码的信息
- 手写标注
- 模糊或低质量图像中的一切

### Latency Issues / 延迟问题

Chinese models also tend to have higher latency due to compute constraints. When you're sitting in an exam and every second counts, an extra 3-5 seconds per question adds up fast. Gemini consistently returns results faster.

国产模型由于算力限制，延迟普遍更高。考试中分秒必争，每题多 3-5 秒累积起来非常可观。Gemini 的响应速度始终更快。

### When to Use Chinese Models / 何时使用国产模型

- Pure text questions with no images → totally fine, sometimes even better for Chinese-language subjects
- You're behind a firewall and can't access Google → Kimi is your best bet for multimodal, DeepSeek for text
- Cost is the primary concern → Chinese models are generally cheaper

- 纯文字题目没有图片 → 完全没问题，中文科目有时甚至更好
- 在墙内无法访问 Google → 多模态用 Kimi，纯文字用 DeepSeek
- 成本是首要考虑 → 国产模型通常更便宜

---

## Bottom Line / 最终结论

For this system — where you're capturing images from glasses or screenshots, need fast responses, and accuracy on visual content is make-or-break — **Gemini 3 Flash with high thinking effort is the answer.** It's not even close for image-heavy subjects like biology, chemistry, and any course with lots of diagrams.

对于这套系统——需要从眼镜或截图获取图像、需要快速响应、视觉内容的准确性决定成败——**开启高思考强度的 Gemini 3 Flash 就是答案。** 对于生物、化学等图像密集型科目，甚至没有可比性。

For a text-only philosophy essay question? Sure, use whatever you want. But if there's even a chance an image is involved, stick with Gemini 3.

纯文字的哲学论述题？随便用什么都行。但只要有可能涉及图像，就用 Gemini 3。
