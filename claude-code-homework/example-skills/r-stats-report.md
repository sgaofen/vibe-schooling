# R Statistics Report Skill

> For R Markdown (.Rmd) assignments that require statistical analysis. Adapt to your course.
>
> 适用于需要统计分析的 R Markdown (.Rmd) 作业。根据你的课程调整。

---

## Standards

- All R code must be **reproducible**: use `set.seed()` for any randomization
- Use **tidyverse** style: ggplot2 for plots, dplyr/tidyr for data manipulation, unless base R is specifically required
- Every figure must have: descriptive title, axis labels with units, legend if multiple groups, appropriate theme (not default gray)
- Statistical tests must report: test statistic, degrees of freedom, exact p-value, effect size measure, 95% confidence interval
- **Plain English interpretation** after every statistical output — don't just dump R output and move on

## Teacher Rules

- Submit as R Markdown (.Rmd), **knit to PDF**
- Code chunks must have **meaningful names** (not `unnamed-chunk-1`)
- Suppress package loading messages: `message=FALSE, warning=FALSE` in setup chunk
- **Assumption checks before every parametric test**: normality (Shapiro-Wilk + Q-Q plot), homogeneity of variance (Levene's test)
- If assumptions are violated, use non-parametric alternative and explain why

## Common Mistakes to Avoid

- **Don't just say p < 0.05** — report exact p-value: "p = 0.0034"
- **Always visualize before testing** — include exploratory plots (histograms, boxplots) before running any test
- **No pie charts** — Prof. Lee considers them misleading and will deduct points. Use bar charts or dot plots instead
- **Round appropriately** — 2-3 decimal places for test statistics, 4 for p-values. Not the 15 digits R gives you by default
- **Don't forget effect size** — a significant p-value means nothing without knowing if the effect is small, medium, or large
- **Label factor levels meaningfully** — "Treatment" and "Control", not "1" and "2"

## Output Structure

```
1. Introduction & Research Question
   - State the question clearly
   - Why it matters (1-2 sentences)

2. Data Description & Exploratory Analysis
   - Source, sample size, variables
   - Summary statistics table
   - Exploratory plots (histogram, boxplot, scatter)

3. Statistical Methods
   - Which test and WHY (justify the choice)
   - Assumption check results
   - Significance level stated

4. Results
   - Test output with inline R code for key values
   - Effect size + CI
   - Result plot (means with error bars, regression line, etc.)
   - Plain English: "Group A (M = 4.2, SD = 1.1) scored significantly
     higher than Group B (M = 3.1, SD = 0.9), t(48) = 3.67, p = 0.0006,
     d = 0.82, 95% CI [0.45, 1.19]."

5. Discussion & Limitations
   - Interpret in context of research question
   - At least 2 limitations
   - Suggestions for future analysis

6. Appendix: Full R Code
   - Clean, commented, reproducible
```

## R Code Style

```r
# Setup chunk example
library(tidyverse)
library(effectsize)
library(car)
theme_set(theme_minimal(base_size = 12))

# Good: descriptive variable names, piped operations
summary_stats <- data %>%
  group_by(treatment) %>%
  summarise(
    mean_score = mean(score, na.rm = TRUE),
    sd_score = sd(score, na.rm = TRUE),
    n = n()
  )

# Good: complete ggplot with labels
ggplot(data, aes(x = treatment, y = score, fill = treatment)) +
  geom_boxplot(alpha = 0.7) +
  labs(
    title = "Score Distribution by Treatment Group",
    x = "Treatment Condition",
    y = "Score (points)",
    fill = "Group"
  )
```
