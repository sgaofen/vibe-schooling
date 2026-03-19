# Claude Cowork

> **[English Version](README.md)**

我怎么用 Claude 搞定实验报告、统计作业、长论文。直接粘贴题目给 ChatGPT 最多拿个 C+，得换个玩法。

靠两样东西：**Skills** 和 **Chrome MCP**。

## Skills：你甚至不用自己写

Claude 自带一个专门写 Skill 的 Skill。你不用自己从零开始手搓一个完美的指令文件。给 Claude 两样东西就行：

1. **评分标准** — 截图也行，复制粘贴也行，让 Claude 看到就行
2. **历史批改过的作业** — 你以前交的作业，带教授的批注、红笔、扣分点。越多越好

Claude 读完这些，自动生成一个针对你这门课的 Skill。它能发现你可能都没注意到的规律——教授最看重哪些部分、什么错误扣分最狠、评分标准里没写但打分时会看的格式偏好。

Skill 存在 `.claude/` 目录里，跨会话一直在。下次做这门课的作业，Claude 上来就知道标准是什么。

### 迭代循环

```
第一次：把评分标准给 Claude → 它生成 Skill → 干活 → 你交作业
第二次：把批改后的作业给 Claude → 它更新 Skill → 下次做得更好
第三次：Skill 调好了 → 稳定高分
```

你不用写 Skill。你也不用手动更新 Skill。你只管把批改过的作业喂给 Claude，它自己琢磨哪里要改。到第三次作业，它比你还了解你教授的口味。

## Chrome MCP：从头到尾不用动手

Claude Cowork 通过 [Chrome MCP](https://browsermcp.io/) 连接你的浏览器。Claude 能看网页、点按钮、填表单、切 tab——完整操控浏览器，不只是处理文字。

实际用起来：你把 Claude 指向 Canvas 作业页面，它读题目要求，按 Skill 生成内容，填进文本框，你审阅一下就能交。在线实验报告表单、结构化作业提交这种场景，整个过程可以不碰键盘。

我拿这个做那些原本要花几个小时在 Claude 和提交页面之间来回倒腾的长作业。Claude 直接从课程页面读评分标准，写报告，填到该填的地方。

## 什么作业适合

- 有严格格式的实验报告（评分标准 + 历史反馈 = Claude 搞得定）
- R/统计分析（代码 + 解读 + ggplot 格式一起搞）
- 有明确评分标准的结构化论文（APA 引用、指定章节要求）
- 教授每次按同一套标准打分的重复性作业

不太适合创意写作或者教授想看*你的想法*的作业。那些还是得自己来。

## 开始用

1. 装好 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)，配置 [Chrome MCP](https://browsermcp.io/)
2. 把课程评分标准和批改过的历史作业给 Claude
3. 让它自动生成 Skill
4. 指向下一次作业，开干

示例 Skill（看看生成出来长什么样）：
- [化学实验报告](example-skills/lab-report.md)
- [R 统计报告](example-skills/r-stats-report.md)
