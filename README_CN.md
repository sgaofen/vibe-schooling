# Vibe Schooling

> **[English Version](README.md)**

**你没有在学习，你只是有学习的氛围。**

"Vibe Coding" 的意思是让 AI 写代码，你只负责感受氛围。名声不太好——但这个比喻用在教育上简直天衣无缝。用 AI 刷完作业、考试、论文，你带走的只有"学过了"的幻觉。成绩单说你学了，你自己心里清楚。这就是 Vibe Schooling。

现在有一个荒诞的现象：全世界每个行业都在拥抱 AI，唯独学校在拒绝。而学校布置的偏偏是作业、考试、论文——恰好是 AI 最轻松就能搞定的东西。纸糊的堡垒，挡不住任何东西。

这个仓库不解决这个矛盾，只是让它更难被无视。

---

## 截图

| | |
|---|---|
| ![Canvas Sniper 使用中](docs/images/canvas-sniper-demo.png) | ![调试工具 — Gemini 解题 + TTS](docs/images/debug-tool-demo.png) |
| Canvas Sniper 自动答题中 | 调试工具：微积分题目 → Gemini 解题 → TTS 预览 |
| ![小米 AI Glass](docs/images/xiaomi-ai-glass.jpg) | ![Chrome 商店](docs/images/canvas-sniper-store.png) |
| 眼镜——看起来就是普通眼镜 | Canvas Sniper 已上架 Chrome 商店（5.0 评分） |

---

## 模块一览

| 模块 | 功能 | 技术栈 |
|------|------|--------|
| [Canvas Sniper](canvas-sniper/) | Chrome 插件自动答 Canvas LMS 题目 | Chrome 扩展、Gemini AI、GhostCursor |
| [眼镜答题系统](glasses-auto-answer/) | 智能眼镜拍照 → AI 解题 → 语音播报答案 | 小米智能眼镜、MacroDroid、Gemini Flash、OpenAI TTS |
| [Claude Cowork](claude-cowork/) | Skills + Chrome MCP 全自动完成作业 | Claude、Skills、Chrome MCP |

---

## Canvas Sniper

原始仓库：[`sgaofen/canvas-sniper`](https://github.com/sgaofen/canvas-sniper)

一个 Chrome 扩展，用 Gemini AI 回答 Canvas LMS 的各种题型。双击题目，答案就填好了。

支持单选、多选、下拉、填空、混合题型和论述题。开启鼠标模拟后，光标会沿贝塞尔曲线移动（GhostCursor），逐字输入带随机停顿，先打开下拉菜单再选择——行为上和真人几乎无法区分。CDP 集成让鼠标移动发生在浏览器层面，不只是 DOM 事件。隐身模式会隐藏所有状态提示。Canvas 看到的只是一个正常答题的学生。

**不能绕过 Lockdown Browser。** 如果你学校用 Respondus，这个工具帮不了你。监考考试请用眼镜系统。

---

## 眼镜答题系统

流程：小米智能眼镜拍照 → 手机通过 MacroDroid 检测到新图片 → Shell 脚本把图片发给 Gemini Flash 解题 → 答案文本送到 OpenAI TTS → 音频通过眼镜喇叭播放。整个流程几秒钟完成。

**核心设计：纯音频，不用屏幕。** 市面上所有带屏幕的智能眼镜都有同一个致命问题：漏光。正面可能看不出来，但镜片背面会亮。坐你后面的人、走过来的监考都能看见。用眼镜内置喇叭播放音频，开隐私模式、低音量，从外面完全看不出来。眼镜就是普通眼镜的样子。指示灯用防闪贴纸遮住就行。

`debug-tool/` 目录包含一个本地 Web 调试界面（Python 服务器），可以在没有眼镜和手机的情况下测试和调整 Gemini prompt 与 TTS 流程。

---

## Claude Cowork

我怎么做实验报告、统计作业、长论文——不是自己写的。

Skill 都不用你自己写——Claude 自带写 Skill 的 Skill。把评分标准和批改过的历史作业丢给它，它自己分析教授的打分习惯，自动生成针对这门课的 Skill。两三轮迭代之后，它比你还懂你教授要什么。

配合 [Chrome MCP](https://browsermcp.io/)，Claude 能直接读作业页面、生成内容、填进提交表单，你审阅一下就能交。

详情在 [claude-cowork/](claude-cowork/) 文件夹。

---

## 快速开始

### 路径一：Canvas Sniper

```bash
git clone https://github.com/sgaofen/vibe-schooling.git
```

1. 打开 `chrome://extensions/`，启用**开发者模式**
2. 点击**加载已解压的扩展程序**，选择 `canvas-sniper/` 文件夹
3. 点击扩展图标 → 在帮助页面输入你的 Gemini API key
4. 打开任何 Canvas 测验 → 双击题目

### 路径二：眼镜答题系统

1. 在 Android 手机上安装 [MacroDroid](https://www.macrodroid.com/)
2. 按照 [MacroDroid 配置指南](glasses-auto-answer/macrodroid/setup-guide_cn.md) 一步步操作
3. 在脚本里填入你的 API 密钥
4. 戴上眼镜拍照——等着听答案

不想用眼镜？可以先用调试工具在电脑上测试：

```bash
cd glasses-auto-answer/debug-tool
GEMINI_API_KEY=你的密钥 OPENAI_API_KEY=你的密钥 python3 app.py
# 打开 http://127.0.0.1:8765
```

### 路径三：Claude Cowork

1. 安装 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)，配置 [Chrome MCP](https://browsermcp.io/)
2. 看看 `claude-cowork/example-skills/` 里的示例 Skill
3. 给你的课写一个 Skill——评分标准、教授偏好、历史扣分
4. 让 Claude 干活，你审阅，交作业

---

## 环境要求

| 模块 | 需要 |
|------|------|
| Canvas Sniper | Chrome/Chromium 浏览器、[Gemini API 密钥](https://aistudio.google.com/apikey)（免费额度就够） |
| 眼镜答题系统 | Android 手机、小米智能眼镜、[MacroDroid](https://www.macrodroid.com/)、Gemini API 密钥、[OpenAI API 密钥](https://platform.openai.com/api-keys) |
| Claude Cowork | [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)、[Chrome MCP](https://browsermcp.io/)、Anthropic API 权限 |

---

## 文档

| 指南 | 说明 |
|------|------|
| [AI 模型选择指南](docs/model-selection-guide_cn.md) | 不同任务选什么模型、为什么 |
| [TTS 方案对比](docs/tts-comparison-guide_cn.md) | OpenAI 对比其他语音合成方案 |
| [隐蔽性与隐私建议](docs/stealth-tips_cn.md) | 怎么用才不会被发现 |

---

## API 密钥安全

所有模块都需要 API 密钥。**绝对不要把密钥提交到版本控制。**

- 复制 `.env.example` 为 `.env` 填入密钥即可
- `.gitignore` 已经排除了所有 `.env` 文件
- Android 脚本里的密钥直接在手机上修改，不要把改过的脚本推送到仓库

---

## 为什么要做这个项目

Vibe Schooling 的目的不是帮学生作弊，格局要大一点。

在你踏入社会之前，你的"工作"就是学习。作业、考试、报告——这就是你的活。而现在，AI 能比你做得更快更好。这不是道德评判，只是技术到了这一步。

我真正想做的是，让学生——那些还没踏入社会的年轻人——在风险更低的时候就体验到 AI 能为他们做什么。不是在聊天框里跟 AI 闲聊，而是搭建真实的流程。写一个把照片变成语音的 shell 脚本，配置一个在手机上运行的自动化宏，把教授的评分标准编码进一个可复用的 Skill 文件。这些都是小程序、简单集成——但它们让 AI 真正在你的生活中干活。

每隔两三个月就有新模型发布，前沿在不断推进。获益最大的人不是等着别人把它包装成产品的人，而是新模型发布那一周就去折腾原始能力的人。去探索边界，造一个解决你真实问题的东西。这个习惯会在学校结束之后继续为你服务。

这个项目存在的意义就是降低门槛。告诉你：一个 Chrome 插件、一副智能眼镜、或者一个写得好的 Skill 文件，就能让 AI 从新鲜玩具变成基础设施。越早上车越好。

---

## 免责声明

本仓库以**教育和研究目的**发布——展示技术上的可能性，并参与关于 AI 与教育的讨论。

使用这些工具违反学校学术诚信政策是你自己的决定和责任。作者不鼓励作弊，也不对你如何使用这些代码承担任何责任。

如果学校的规定说不行，那风险由你自己承担。

---

## 许可证

[MIT](LICENSE) — sgaofen, 2026
