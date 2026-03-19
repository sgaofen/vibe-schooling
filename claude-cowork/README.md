# Claude Cowork

> **[中文版](README_CN.md)**

Claude Cowork is how I use Claude to handle long, complex assignments — lab reports, stats write-ups, multi-section essays. The kind of homework where pasting the prompt into ChatGPT gives you a C+ at best.

Two things make it work: **Skills** and **Chrome MCP**.

## Skills: you don't even write them yourself

Claude already has a built-in skill for creating skills. You don't need to sit there crafting a perfect instruction file from scratch. Just give Claude two things:

1. **The rubric / grading criteria** — screenshot it, copy-paste it, whatever. Just get it in front of Claude.
2. **Past graded assignments** — your old submissions with the professor's feedback, red marks, point deductions. The more the better.

Claude reads through all of that and generates a Skill tailored to your specific class. It picks up on patterns you might not even notice — which sections the professor cares most about, what kind of mistakes cost the most points, formatting preferences that aren't in the rubric but show up in the grading.

The Skill lives in your `.claude/` directory and persists across sessions. Next time you start an assignment for that class, Claude already knows the standards.

### The iteration loop

```
Assignment 1: Feed Claude the rubric → it generates a Skill → does the work → you submit
Assignment 2: Feed Claude the graded version → it updates the Skill → does the next one better
Assignment 3: Skill is dialed in → consistent high grades
```

You're not writing the Skill. You're not even updating it manually. You just keep feeding Claude your graded work and it figures out what to fix. By the third assignment, it knows your professor's taste better than you do.

## Chrome MCP: hands-off from start to finish

Claude Cowork connects to your browser through [Chrome MCP](https://browsermcp.io/). That means Claude can see web pages, click buttons, fill in forms, navigate tabs — the full browser, not just text.

In practice: you point Claude at your Canvas assignment page. It reads the instructions, generates the content following your Skill, fills in the text fields, and you review before submitting. For online lab report forms or structured assignment submissions, the whole thing can run without you touching the keyboard.

I use this for the assignments that would otherwise take hours of back-and-forth between Claude and the submission platform. Claude reads the rubric directly from the course page, writes the report, and puts it where it needs to go.

## What works well

- Lab reports with strict formatting (rubric + past feedback = Claude nails it)
- R/statistics assignments (code + interpretation + proper ggplot formatting)
- Structured essays with clear grading criteria (APA citations, required sections)
- Any repeating assignment where the professor grades the same way each time

Doesn't work great for creative writing or assignments where the professor wants to see *your* thinking. Those still need a human.

## Getting started

1. Get [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and set up [Chrome MCP](https://browsermcp.io/)
2. Give Claude your course rubric and any past graded assignments
3. Let it generate a Skill for your class
4. Point it at your next assignment

Example Skills (to see what the output looks like):
- [Chemistry lab report](example-skills/lab-report.md)
- [R statistics report](example-skills/r-stats-report.md)
