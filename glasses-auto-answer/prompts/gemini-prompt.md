# Gemini Prompt — Annotated

> **[中文版](gemini-prompt_cn.md)**


---

## System Role

The model is told upfront: your output isn't for reading, it's for **listening**. This framing changes how it formats everything.

---

## Section 1: TTS Anti-Skip Rules

This is the most critical section. TTS engines routinely skip single letters, swallow units after numbers, and rush through formulas.

### Rule 1: Prefix single-letter variables

Without this, TTS reads "w" as silence. With "字母w", it reads "zì mǔ w" — clear and unmissable.

### Rule 2: Separate consecutive variables

Without separators, TTS tries to pronounce "nRT" as a word. It can't.

### Rule 3: Comma between numbers and units

The comma creates a pause that prevents the unit from being absorbed into the number.

### Rule 4: Period at end of each formula step

Periods create breathing room. Without them, formulas run together into mush.

### Rule 5: Standard state symbol handling

### Rule 6: Subscripts only when necessary

### Rule 7: Line breaks

---

## Section 2: Calculation Problem Principles

The model has freedom to decide HOW to organize steps, but must hit these three constraints.

---

## Section 3: Language Rules

**Abbreviations for units / 单位念缩写：**
- j, kg, mol, L, Pa, N, W, Hz, atm, mL, g, kJ, cm, nm, K, degrees C
- NOT full names (joules, kilograms...)

---

## Section 4: Question Type Rules

---

## Section 5: Format Consistency

Mixed-format sentences are forbidden: "For Chlorine, delta G equals 负一四一" ← wrong. Stay consistent.

---

## Section 6: Absolute Prohibitions

- Don't output the question itself — only answers / 不输出题目
- No math symbols / 不输出数学符号
- No filler explanations / 不输出解释废话
- No markdown formatting / 不输出 markdown
- No consecutive letter variables without separators / 不连写变量字母
- Every character should be writable on paper / 每个字都是要写在答题纸上的
