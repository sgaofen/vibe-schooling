# Writing Effective Skills / 怎么写好 Skills

A bad Skill produces bad output with confidence. A good Skill produces output your professor can't distinguish from your best work. The difference is specificity.

一个差的 Skill 会自信地产出垃圾。一个好的 Skill 产出的内容连教授都分不出是不是你的最佳水平。区别在于具体性。

---

## What Is a Skill / Skill 是什么

A Skill is a markdown file that gives Claude Code persistent instructions for a specific type of task. You can put it in:

Skill 是一个 markdown 文件，给 Claude Code 提供某类任务的持久指令。你可以放在：

- `.claude/CLAUDE.md` — applies to all conversations in the directory / 对该目录下所有对话生效
- A custom skill file invoked with a slash command / 用斜杠命令调用的自定义 skill 文件

Think of it as a brief that tells a very capable but uninformed assistant exactly what standards to meet.

把它想象成给一个能力很强但不了解情况的助手写的详细说明。

---

## Anatomy of a Homework Skill / 作业 Skill 的结构

### 1. Rubric Encoding / 评分标准编码

Translate your rubric into specific, actionable instructions. Don't summarize — be literal.

把评分标准翻译成具体的、可操作的指令。不要概括——要照搬。

```markdown
## Grading Standards

- Abstract: 150-200 words. Must include: purpose, methods summary,
  key results with numbers, and one-sentence conclusion. (10 pts)
- Discussion: Must compare experimental values to literature values
  with percent error. Must address at least 2 sources of error. (30 pts)
```

**Bad**: "Write a good discussion section" — too vague, model guesses

**Good**: "Discussion must compare experimental values to literature values with percent error calculation. Address at least 2 specific sources of error (one systematic, one random)." — the model knows exactly what to produce

**差**："写一个好的讨论部分" — 太模糊，模型靠猜

**好**："讨论部分必须将实验值与文献值对比并计算百分误差。至少讨论 2 个具体的误差来源（一个系统误差，一个随机误差）。" — 模型知道该产出什么

### 2. Teacher Quirks / 老师的特殊偏好

Every professor has unwritten rules. You learn them from class, from office hours, from red ink on returned papers. These are gold — they're the difference between a B+ and an A.

每个教授都有不成文的规定。你从课上、从答疑时间、从退回来的红笔批注里学到。这些是金子——是 B+ 和 A 的区别。

```markdown
## Teacher-Specific Rules

- Prof. Chen always asks "What would you do differently?" in Discussion
- NO first person anywhere — "the experiment was conducted", not "we conducted"
- Sig figs must match instrument precision (3 for digital balance, 1 for graduated cylinder)
- She hates when students write "human error" as a source of error — be specific
```

### 3. Past Feedback Integration / 历史扣分反馈

This is where the magic happens. Every time you get a graded assignment back, extract the lesson and add it to the Skill.

这是魔法发生的地方。每次拿到批改后的作业，提取教训，加进 Skill。

```markdown
## Past Feedback (update after each submission)

- Lab 2: -5 pts — forgot units in table column headers. ALWAYS include units.
- Lab 3: -3 pts — conclusion exceeded 150 words. Keep it tight.
- Lab 4: -8 pts — didn't compare experimental to literature value.
  MUST include: our value, literature value, percent error, possible explanation.
- Lab 5: -2 pts — figure captions were too vague. Each caption must describe
  what the figure shows AND what trend is visible.
```

### 4. Output Format / 输出格式

Don't let the model guess your formatting. Spell it out.

不要让模型猜格式。写清楚。

```markdown
## Format Requirements

- 12pt Times New Roman, double-spaced, 1-inch margins
- APA 7th edition citations
- Figures: numbered (Figure 1, 2...), caption BELOW, descriptive
- Tables: numbered (Table 1, 2...), title ABOVE, all columns have units
- Equations: numbered in parentheses, referenced in text as "Eq. (1)"
- Pages numbered bottom-center
```

---

## The Iteration Workflow / 迭代工作流

```
Week 1:  Read rubric → Write initial Skill → Generate assignment → Submit
         ↓
Week 2:  Get feedback → Update Skill with lessons → Generate → Submit
         ↓
Week 3:  Get feedback → Refine Skill → Generate → Submit
         ↓
Week 4+: Skill is now professor-calibrated → Consistent A-range work
```

The first submission might be a B+. That's fine. The Skill learns from every red mark. By week 3 or 4, it's producing work that hits every criterion because it's seen every criterion fail.

第一次交上去可能是 B+。没关系。Skill 从每一个红笔批注中学习。到第 3、4 周，它能命中每一个标准，因为它见过每一个标准失败的样子。

---

## Tips / 技巧

- **Be specific, not vague.** "Good analysis" means nothing. "Include Cohen's d effect size after every t-test" means everything.
- **Include examples.** Show the model what good and bad output looks like for YOUR class.
- **Update immediately.** Add feedback to the Skill the day you get the grade back, while it's fresh.
- **Separate skills per class.** Prof. Chen's chemistry and Prof. Lee's statistics have completely different standards.
- **Include the actual rubric text.** Don't paraphrase — if the rubric says "demonstrates critical thinking", put those exact words in the Skill.

- **要具体，不要模糊。** "好的分析" 没有意义。"每次 t 检验后都包含 Cohen's d 效应量" 才有意义。
- **包含示例。** 给模型看你这门课什么算好、什么算差。
- **立刻更新。** 拿到成绩那天就把反馈加进 Skill，趁记忆新鲜。
- **每门课一个 Skill。** 陈教授的化学和李教授的统计标准完全不同。
- **包含原始评分标准。** 不要意译——标准说 "demonstrates critical thinking"，就把这几个字写进 Skill。
