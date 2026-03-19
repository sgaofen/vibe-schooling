# Claude Code Homework Automation / Claude Code 自动化做作业

Not a tool — a methodology.

不是工具——是方法论。

---

## The Problem / 问题

Most students using AI for homework do the same thing: paste the assignment prompt into ChatGPT and pray. The output is generic. It misses rubric criteria. It ignores the professor's pet peeves. It repeats mistakes you've already been penalized for. You submit it, lose points in the same places, and wonder why AI "doesn't work."

大多数学生用 AI 做作业的方式都一样：把题目粘贴到 ChatGPT 然后祈祷。输出是通用的，漏掉评分标准，忽略教授的偏好，重复你已经被扣过分的错误。交上去，在同样的地方丢分，然后觉得 AI "不好用"。

---

## The Solution: Skills / 解决方案：Skills

Claude Code has a feature called **Skills** — persistent instruction files that survive across conversations. They live in your `.claude/` directory and tell the model HOW to approach specific types of work.

Claude Code 有一个功能叫 **Skills**——跨会话持久化的指令文件。它们存在你的 `.claude/` 目录里，告诉模型怎么处理特定类型的任务。

The insight is simple: **encode everything that affects your grade into a Skill.**

核心思路很简单：**把所有影响你成绩的东西都编码进一个 Skill。**

1. **Rubric standards** — what the grading criteria actually say
2. **Teacher-specific requirements** — the things they say in class but aren't written down
3. **Past grading feedback** — what you lost points on, so it never happens again

1. **评分标准** — 评分标准具体怎么说的
2. **老师的特殊要求** — 课上说了但没写进标准的东西
3. **历史扣分反馈** — 之前被扣分的地方，确保不再犯

---

## The Loop / 迭代循环

```
Assignment 1: Write Skill from rubric
              → submit → get grade + feedback

Assignment 2: Update Skill with feedback
              → submit → quality improves

Assignment 3: Skill is now calibrated to YOUR professor
              → consistent high grades
```

Each cycle tightens the calibration. By the third or fourth assignment, the Skill knows your professor's taste better than you do. The model stops producing generic output and starts producing output calibrated to the person holding the red pen.

每一轮都在收紧校准。到第三四次作业，Skill 比你自己还了解你教授的口味。模型不再生成泛泛的内容，而是生成针对拿着红笔那个人校准过的内容。

---

## Best For / 最适合

- Lab reports (实验报告)
- R/statistics analysis reports (R 语言/统计分析报告)
- Complex multi-section assignments (复杂的多章节作业)
- Structured long-form essays (结构化长文论述)
- Anything with a rubric and a repeating pattern (任何有评分标准和重复模式的作业)

---

## Next Steps / 下一步

- [Writing Effective Skills](writing-effective-skills.md) — how to actually build one
- [Example: Lab Report Skill](example-skills/lab-report.md) — a real skill for chemistry lab reports
- [Example: R Stats Report Skill](example-skills/r-stats-report.md) — a real skill for statistics assignments
