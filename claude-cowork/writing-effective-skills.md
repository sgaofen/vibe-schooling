# Writing Effective Skills

> **[中文版](writing-effective-skills_cn.md)**


A bad Skill produces bad output with confidence. A good Skill produces output your professor can't distinguish from your best work. The difference is specificity.

---

## What Is a Skill

A Skill is a markdown file that gives Claude Cowork persistent instructions for a specific type of task. You can put it in:

Think of it as a brief that tells a very capable but uninformed assistant exactly what standards to meet.

---

## Anatomy of a Homework Skill

### 1. Rubric Encoding

Translate your rubric into specific, actionable instructions. Don't summarize — be literal.

```markdown
## Grading Standards

- Abstract: 150-200 words. Must include: purpose, methods summary,
  key results with numbers, and one-sentence conclusion. (10 pts)
- Discussion: Must compare experimental values to literature values
  with percent error. Must address at least 2 sources of error. (30 pts)
```

**Bad**: "Write a good discussion section" — too vague, model guesses

**Good**: "Discussion must compare experimental values to literature values with percent error calculation. Address at least 2 specific sources of error (one systematic, one random)." — the model knows exactly what to produce

### 2. Teacher Quirks

Every professor has unwritten rules. You learn them from class, from office hours, from red ink on returned papers. These are gold — they're the difference between a B+ and an A.

```markdown
## Teacher-Specific Rules

- Prof. Chen always asks "What would you do differently?" in Discussion
- NO first person anywhere — "the experiment was conducted", not "we conducted"
- Sig figs must match instrument precision (3 for digital balance, 1 for graduated cylinder)
- She hates when students write "human error" as a source of error — be specific
```

### 3. Past Feedback Integration

This is where the magic happens. Every time you get a graded assignment back, extract the lesson and add it to the Skill.

```markdown
## Past Feedback (update after each submission)

- Lab 2: -5 pts — forgot units in table column headers. ALWAYS include units.
- Lab 3: -3 pts — conclusion exceeded 150 words. Keep it tight.
- Lab 4: -8 pts — didn't compare experimental to literature value.
  MUST include: our value, literature value, percent error, possible explanation.
- Lab 5: -2 pts — figure captions were too vague. Each caption must describe
  what the figure shows AND what trend is visible.
```

### 4. Output Format

Don't let the model guess your formatting. Spell it out.

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

## The Iteration Workflow

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

---

## Tips

- **Be specific, not vague.** "Good analysis" means nothing. "Include Cohen's d effect size after every t-test" means everything.
- **Include examples.** Show the model what good and bad output looks like for YOUR class.
- **Update immediately.** Add feedback to the Skill the day you get the grade back, while it's fresh.
- **Separate skills per class.** Prof. Chen's chemistry and Prof. Lee's statistics have completely different standards.
- **Include the actual rubric text.** Don't paraphrase — if the rubric says "demonstrates critical thinking", put those exact words in the Skill.
