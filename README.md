# Vibe Schooling

**You're not learning. You just have the vibe.**

"Vibe Coding" got its name because you let the AI write code while you just... vibe. It has a bad reputation — and maybe it should. But here's the thing: that metaphor fits education *perfectly*. When you use AI to breeze through assignments, quizzes, and exams, you walk away with nothing but the atmosphere of having studied. The transcript says you learned. You know you didn't. That's Vibe Schooling.

There's a strange irony unfolding right now. Every industry on Earth is racing to integrate AI — except schools. Schools are the last holdout, the one place still pretending the walls can keep it out. And what do schools assign? Homework, quizzes, essays, lab reports — precisely the kind of work that AI handles most effortlessly. The fortress is made of paper.

This repository doesn't resolve that contradiction. It just makes it harder to ignore.

---

**你没有在学习，你只是有学习的氛围。**

"Vibe Coding" 的意思是让 AI 写代码，你只负责感受氛围。名声不太好——但这个比喻用在教育上简直天衣无缝。用 AI 刷完作业、考试、论文，你带走的只有"学过了"的幻觉。成绩单说你学了，你自己心里清楚。这就是 Vibe Schooling。

现在有一个荒诞的现象：全世界每个行业都在拥抱 AI，唯独学校在拒绝。而学校布置的偏偏是作业、考试、论文——恰好是 AI 最轻松就能搞定的东西。纸糊的堡垒，挡不住任何东西。

这个仓库不解决这个矛盾，只是让它更难被无视。

---

## Modules / 模块一览

| Module | What it does | Stack |
|--------|-------------|-------|
| [Canvas Sniper](canvas-sniper/) | Auto-answers Canvas LMS quizzes via Chrome extension | Chrome Extension, Gemini AI, GhostCursor |
| [Glasses Auto-Answer](glasses-auto-answer/) | Smart glasses → photo → AI solves → audio answer in your ear | Xiaomi Smart Glasses, MacroDroid, Gemini Flash, OpenAI TTS |
| [Claude Code Homework](claude-code-homework/) | Methodology for automating complex assignments with Claude Code Skills | Claude Code, Custom Skills |

---

## Canvas Sniper

Originally at [`sgaofen/canvas-sniper`](https://github.com/sgaofen/canvas-sniper).

A Chrome extension that answers Canvas LMS quiz questions using Gemini AI. Double-click any question. That's the entire workflow.

It handles the question types you'd expect — multiple choice, multi-select, dropdown, fill-in-the-blank, mixed inputs, and full essay responses. But the interesting part is how it *behaves*. Turn on Mouse Simulation and it stops acting like a bot: the cursor traces bezier curves across the page with GhostCursor, types characters one at a time with irregular pauses, opens dropdown menus before selecting, and adds the kind of micro-hesitations a real hand produces. With CDP integration, the mouse movement happens at the browser level — not just DOM events.

Stealth mode hides the status notification overlay entirely. The extension runs in the page's background. Canvas sees a student clicking through a quiz.

**Does not bypass Lockdown Browser.** If your school uses Respondus, this won't help you.

**Canvas Sniper** 是一个 Chrome 扩展，用 Gemini AI 回答 Canvas LMS 的各种题型。双击题目，答案就填好了。

支持单选、多选、下拉、填空、混合题型和论述题。开启鼠标模拟后，光标会沿贝塞尔曲线移动（GhostCursor），逐字输入带随机停顿，先打开下拉菜单再选择——行为上和真人几乎无法区分。CDP 集成让鼠标移动发生在浏览器层面，不只是 DOM 事件。隐身模式会隐藏所有状态提示。Canvas 看到的只是一个正常答题的学生。

**不能绕过 Lockdown Browser。** 如果你学校用 Respondus，这个工具帮不了你。

---

## Glasses Auto-Answer

The pipeline: Xiaomi smart glasses → take a photo → Android phone detects the new image via MacroDroid → shell script sends the image to Gemini Flash for analysis → answer text goes to OpenAI TTS → audio plays back through the glasses' speakers. The whole loop finishes in seconds.

The critical design choice is **pure audio, no screen**. Every screen-based smart glasses product on the market today has the same fatal flaw: light leakage. Even if the front looks fine, the back of the lens glows. Anyone sitting behind you — or a proctor walking past — can see it. Audio through the glasses' built-in speakers, with privacy mode enabled and volume low, is invisible. The glasses look like ordinary glasses because, functionally, they are. An anti-flash sticker covers the indicator light that would otherwise blink during operation.

The `debug-tool/` directory contains a local web UI (Python server) for testing and refining the Gemini prompt and TTS pipeline without needing the glasses or phone.

**核心设计：纯音频，不用屏幕。** 市面上所有带屏幕的智能眼镜都有同一个致命问题：漏光。正面可能看不出来，但镜片背面会亮。坐你后面的人、走过来的监考都能看见。用眼镜内置喇叭播放音频，开隐私模式、低音量，从外面完全看不出来。眼镜就是普通眼镜的样子。指示灯用防闪贴纸遮住。

流程：小米智能眼镜拍照 → 手机通过 MacroDroid 检测到新图片 → Shell 脚本把图片发给 Gemini Flash 解题 → 答案文本送到 OpenAI TTS → 音频通过眼镜喇叭播放。整个流程几秒钟完成。

`debug-tool/` 目录包含一个本地 Web 调试界面（Python 服务器），可以在没有眼镜和手机的情况下测试和调整 Gemini prompt 与 TTS 流程。

---

## Claude Code Homework

Not a tool — a methodology.

The insight: Claude Code Skills are persistent instruction sets that survive across sessions. If you encode your professor's rubric, their specific stylistic preferences, the feedback from your last graded assignment, and the formatting quirks of your department into a Skill, Claude Code stops producing generic output. It produces output calibrated to the person grading it.

The loop works like this: submit an assignment, get it back with feedback, fold that feedback into the Skill, submit the next one. Each cycle tightens the calibration. By the third or fourth assignment, the Skill knows your professor's taste better than you do.

This works especially well for lab reports, R/statistics write-ups, and structured long-form essays — anything with a rubric and a pattern.

The `example-skills/` directory will contain sample Skill definitions to start from.

**不是工具，是方法论。**

核心思路：Claude Code 的 Skills 是跨会话持久化的指令集。把教授的评分标准、具体的格式偏好、上次作业的批改反馈、院系的排版要求全部编码进一个 Skill，Claude Code 就不再生成泛泛的内容——它会生成针对批改人校准过的内容。

循环是这样的：交作业 → 拿回批改反馈 → 把反馈写进 Skill → 交下一次作业。每一轮都在收紧校准。到第三四次作业的时候，Skill 比你自己还了解你教授的口味。

对实验报告、R/统计分析报告、结构化长文论述特别有效——任何有评分标准和固定模式的作业都适用。

`example-skills/` 目录将包含可以直接使用的示例 Skill 定义。

---

## Quick Start / 快速开始

### Path 1: Canvas Sniper

```bash
git clone https://github.com/YOUR_USERNAME/vibe-schooling.git
```

1. Open `chrome://extensions/`, enable **Developer mode**
2. Click **Load unpacked**, select the `canvas-sniper/` folder
3. Click the extension icon → enter your Gemini API key on the Help page
4. Open any Canvas quiz → double-click a question

### Path 2: Glasses Auto-Answer

1. Set up [MacroDroid](https://www.macrodroid.com/) on your Android phone
2. Configure the macro to detect new photos from your smart glasses
3. Copy `glasses-auto-answer/android-scripts/study_dictation_full.sh` to your phone
4. Set your `GEMINI_API_KEY` and `OPENAI_API_KEY` in the script
5. Take a photo with your glasses — listen for the answer

To test without hardware, use the debug tool:

```bash
cd glasses-auto-answer/debug-tool
GEMINI_API_KEY=your_key OPENAI_API_KEY=your_key python3 app.py
# Open http://127.0.0.1:8765
```

### Path 3: Claude Code Homework

1. Install [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
2. Read the example Skills in `claude-code-homework/example-skills/`
3. Create a Skill encoding your course's rubric and requirements
4. Run Claude Code against your assignment, iterate with grading feedback

---

## Prerequisites / 环境要求

| Module | Requirements |
|--------|-------------|
| Canvas Sniper | Chrome/Chromium browser, [Gemini API key](https://aistudio.google.com/apikey) (free tier works) |
| Glasses Auto-Answer | Android phone, Xiaomi Smart Glasses (or similar), [MacroDroid](https://www.macrodroid.com/), Gemini API key, [OpenAI API key](https://platform.openai.com/api-keys) |
| Claude Code Homework | [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code), Anthropic API access |

---

## Documentation / 文档

| Guide | Description |
|-------|-------------|
| [AI Model Selection Guide](docs/model-selection-guide.md) | Which models to use for which tasks, and why / 不同任务选什么模型 |
| [TTS Provider Comparison](docs/tts-comparison-guide.md) | OpenAI vs alternatives for text-to-speech / TTS 方案对比 |
| [Stealth & Privacy Tips](docs/stealth-tips.md) | Practical advice on not getting caught / 隐蔽性和隐私建议 |

---

## API Keys & Security / API 密钥安全

All modules require API keys. **Never commit your keys to version control.**

- Copy `.env.example` to `.env` and fill in your keys there
- The `.gitignore` already excludes `.env` and all `*.env` files
- For the Android shell script, replace the placeholder values directly in the script on your phone — do not push the modified script

所有模块都需要 API 密钥。**绝对不要把密钥提交到版本控制。** 复制 `.env.example` 为 `.env` 填入密钥即可，`.gitignore` 已经排除了所有 `.env` 文件。Android 脚本里的密钥直接在手机上修改，不要把改过的脚本推送到仓库。

---

## Why This Exists / 为什么要做这个项目

The idea behind Vibe Schooling isn't to help students cheat. It's bigger than that.

Before you enter the workforce, your job *is* school. Assignments, exams, reports — that's the work. And right now, AI can do most of it faster and better than you can. That's not a moral judgment. It's just where the technology is.

What I actually want is for students — young people who haven't entered the workforce yet — to experience what AI can do for them *now*, while the stakes are lower. Not by chatting with a chatbot in a text box, but by building real pipelines. Writing a shell script that turns a photo into audio. Configuring an automation macro that runs on your phone. Encoding your professor's grading rubric into a reusable Skill file. These are small programs, simple integrations — but they put AI to work in your actual life.

Every two or three months, a new model drops. The frontier keeps moving. The people who benefit most aren't the ones who wait for someone to wrap it in a product — they're the ones who tinker with the raw capabilities the week they come out. Explore the edges. Build something that solves a problem you actually have. That habit will serve you long after school ends.

This project exists to lower the barrier. To show that with a Chrome extension, a pair of smart glasses, or a well-written Skill file, AI stops being a novelty and starts being infrastructure. The sooner you get on that train, the better.

---

Vibe Schooling 的目的不是帮学生作弊，格局要大一点。

在你踏入社会之前，你的"工作"就是学习。作业、考试、报告——这就是你的活。而现在，AI 能比你做得更快更好。这不是道德评判，只是技术到了这一步。

我真正想做的是，让学生——那些还没踏入社会的年轻人——在风险更低的时候就体验到 AI 能为他们做什么。不是在聊天框里跟 AI 闲聊，而是搭建真实的流程。写一个把照片变成语音的 shell 脚本，配置一个在手机上运行的自动化宏，把教授的评分标准编码进一个可复用的 Skill 文件。这些都是小程序、简单集成——但它们让 AI 真正在你的生活中干活。

每隔两三个月就有新模型发布，前沿在不断推进。获益最大的人不是等着别人把它包装成产品的人，而是新模型发布那一周就去折腾原始能力的人。去探索边界，造一个解决你真实问题的东西。这个习惯会在学校结束之后继续为你服务。

这个项目存在的意义就是降低门槛。告诉你：一个 Chrome 插件、一副智能眼镜、或者一个写得好的 Skill 文件，就能让 AI 从新鲜玩具变成基础设施。越早上车越好。

---

## Disclaimer / 免责声明

This repository is published for **educational and research purposes** — to demonstrate what is technically possible and to contribute to the conversation about AI in education.

Using these tools to violate your institution's academic integrity policies is your decision and your responsibility. The authors do not endorse cheating and are not liable for how you use this code.

If your school's policy says don't do it, then the risk is yours.

本仓库以**教育和研究目的**发布——展示技术上的可能性，并参与关于 AI 与教育的讨论。

使用这些工具违反学校学术诚信政策是你自己的决定和责任。作者不鼓励作弊，也不对你如何使用这些代码承担任何责任。

如果学校的规定说不行，那风险由你自己承担。

---

## License / 许可证

[MIT](LICENSE) — Stephen Yu, 2026
