# Claude Cowork Homework Automation

> **[中文版](README_CN.md)**


Not a tool — a methodology.

---

## The Problem

Most students using AI for homework do the same thing: paste the assignment prompt into ChatGPT and pray. The output is generic. It misses rubric criteria. It ignores the professor's pet peeves. It repeats mistakes you've already been penalized for. You submit it, lose points in the same places, and wonder why AI "doesn't work."

---

## The Solution: Skills

Claude Cowork has a feature called **Skills** — persistent instruction files that survive across conversations. They live in your `.claude/` directory and tell the model HOW to approach specific types of work.

The insight is simple: **encode everything that affects your grade into a Skill.**

1. **Rubric standards** — what the grading criteria actually say
2. **Teacher-specific requirements** — the things they say in class but aren't written down
3. **Past grading feedback** — what you lost points on, so it never happens again

---

## The Loop

```
Assignment 1: Write Skill from rubric
              → submit → get grade + feedback

Assignment 2: Update Skill with feedback
              → submit → quality improves

Assignment 3: Skill is now calibrated to YOUR professor
              → consistent high grades
```

Each cycle tightens the calibration. By the third or fourth assignment, the Skill knows your professor's taste better than you do. The model stops producing generic output and starts producing output calibrated to the person holding the red pen.

---

## Best For

---

## Next Steps

- [Writing Effective Skills](writing-effective-skills.md) — how to actually build one
- [Example: Lab Report Skill](example-skills/lab-report.md) — a real skill for chemistry lab reports
- [Example: R Stats Report Skill](example-skills/r-stats-report.md) — a real skill for statistics assignments
