# Lab Report Skill — General Chemistry

> Copy this into your `.claude/CLAUDE.md` or use as a slash-command skill. Replace the specifics with your own course details.
>
> 复制到你的 `.claude/CLAUDE.md` 或作为斜杠命令 skill 使用。把具体内容替换成你自己课程的。

---

## Grading Standards (from rubric)

- **Title page** (2 pts): Title, name, date, lab section, TA name
- **Abstract** (10 pts): 150-200 words. Must include: purpose, brief methods, key numerical results, one-sentence conclusion
- **Introduction** (15 pts): Background theory with citations, clear hypothesis with reasoning, relevance of experiment
- **Methods** (10 pts): Past tense, third person, sufficient detail to reproduce. Do NOT copy from the lab manual — paraphrase
- **Results** (15 pts): All data in properly formatted tables/figures. No interpretation here — just present the data. Every figure/table must be referenced in text
- **Discussion** (30 pts): Interpret results, compare experimental values to literature values with percent error, error analysis (systematic AND random), answer all post-lab questions
- **Conclusion** (8 pts): One paragraph, max 150 words. Summarize findings, state whether hypothesis was supported, significance
- **References** (5 pts): APA 7th edition, minimum 3 peer-reviewed sources. No Wikipedia, no Chegg
- **Formatting** (5 pts): 12pt Times New Roman, double-spaced, 1-inch margins, numbered pages

## Teacher-Specific Rules

- Prof. Chen always includes "What would you do differently?" — MUST address this in Discussion
- Error analysis requires: percent error calculation shown, AND a discussion of at least one systematic error and one random error with specific explanations
- NO first person ("I", "we") — use passive voice throughout: "the solution was heated" not "we heated the solution"
- Significant figures: match the precision of the instrument used (3 sig figs for digital balance, 2 for graduated cylinder, 4 for analytical balance)
- She hates "human error" as a source of error — always be specific: "parallax error when reading the meniscus" or "incomplete transfer of precipitate during filtration"
- Graphs must be made in Excel or R with proper formatting — no hand-drawn, no default Excel styling

## Past Feedback (update after each submission)

- **Lab 2**: -5 pts — table column headers missing units. **Rule: EVERY column header must include units in parentheses, e.g., "Mass (g)"**
- **Lab 3**: -3 pts — conclusion was 230 words. **Rule: conclusion must be under 150 words, no exceptions**
- **Lab 4**: -8 pts — Discussion didn't compare experimental to literature values. **Rule: for every calculated value, include: our result, accepted/literature value, percent error, and brief explanation of discrepancy**
- **Lab 5**: -2 pts — figure captions too vague ("Figure 1: Graph"). **Rule: each caption must describe what is plotted AND what trend is visible, e.g., "Figure 1: Absorbance vs. concentration of CuSO₄ solution, showing a linear relationship (R² = 0.997)"**

## Output Format

When generating a lab report, follow this structure:

1. Title page (separate page)
2. Abstract (starts on new page)
3. Introduction → Methods → Results → Discussion → Conclusion (continuous)
4. References (starts on new page)

For data I haven't provided, use placeholder: `[INSERT YOUR DATA HERE]`

All calculations must show:
- The formula used
- Substitution with numbers and units
- Final answer with correct sig figs and units

Example:
```
Percent error = |experimental - theoretical| / theoretical × 100%
             = |4.52 g/mL - 4.50 g/mL| / 4.50 g/mL × 100%
             = 0.44%
```
