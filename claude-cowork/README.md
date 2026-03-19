# Claude Cowork

> **[中文版](README_CN.md)**

Claude Cowork is how I use Claude to handle long, complex assignments — lab reports, stats write-ups, multi-section essays. The kind of homework where you can't just paste the prompt and get a decent result.

The secret is two things working together: **Skills** and **Chrome MCP**.

## Skills: teaching Claude what your professor actually wants

A Skill is basically a cheat sheet you write for Claude. It lives in your `.claude/` directory and tells Claude how to approach a specific type of assignment — not in generic terms, but calibrated to *your* class.

You put three things in it:

1. **The rubric** — copy it in verbatim, not summarized
2. **Your professor's quirks** — the stuff they say in class but don't write down ("don't use passive voice", "always include percent error", "I hate pie charts")
3. **Feedback from past assignments** — every time you lose points, you add a line so it doesn't happen again

After two or three assignments, the Skill knows your professor's taste. Claude stops writing generic A- work and starts writing the specific kind of A work that *this particular person with a red pen* wants to see.

## Chrome MCP: full automation

Here's where it gets interesting. Claude Cowork connects to your browser through [Chrome MCP](https://browsermcp.io/), which means Claude can actually *see* and *interact with* web pages.

What this means in practice: you point Claude at your assignment page, and it can read the instructions, pull up reference material, fill in text fields, navigate between tabs, and submit — all by itself. For something like an online lab report form or a Canvas assignment submission, the whole workflow can be hands-off.

I use this for long assignments that would otherwise take hours of copy-pasting between Claude and the submission platform. Claude reads the rubric from the course page, generates the content following my Skill, and fills it in directly.

## The iteration loop

```
Assignment 1: Write a Skill from the rubric → submit → get feedback
Assignment 2: Add feedback to the Skill → submit → better grade
Assignment 3: Skill is now calibrated → consistent results
```

The first submission might not be perfect. That's fine. Each round of feedback makes the Skill sharper. By the third or fourth assignment, you're mostly just reviewing what Claude produced and hitting submit.

## What this works well for

- Lab reports with strict formatting requirements
- R/statistics assignments where code + interpretation both matter
- Structured essays with rubrics (APA citations, specific section requirements)
- Any repeating assignment type where the professor grades the same way each time

Not great for creative writing or assignments where the professor expects your unique perspective. Those still need your brain.

## Getting started

- [How to write a good Skill](writing-effective-skills.md)
- [Example: chemistry lab report Skill](example-skills/lab-report.md)
- [Example: R statistics report Skill](example-skills/r-stats-report.md)
