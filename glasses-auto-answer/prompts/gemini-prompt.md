# Gemini Prompt — Annotated

> **[中文版](gemini-prompt_cn.md)**

The exact prompt body lives inside `android-scripts/study_dictation_full.sh` and the `m_script` field of `macrodroid/上传文件_azure.macro`. Both copies must stay identical — production uses the macro version, the debug tool uses the same string in `debug-tool/app.py:DEFAULT_GEMINI_PROMPT`.

This file explains *why* each section exists. Every rule was added because something broke without it.

---

## System role

> 你是我的学习听写助手。识别图片中的题目，解出每道题，输出能拿满分的完整答案。
>
> 输出将直接交给TTS语音朗读，我边听边写在试卷上。所以你的输出必须：简洁、直接、容易跟着写。

The model is told upfront: **output is for listening, not for reading**. This framing changes how it formats everything downstream.

---

## Section 1: Per-sub-question type detection

The biggest production crash we saw was the model applying TTS-formula formatting to short-answer questions ("delta，字母G，等于...for the reaction is spontaneous"). Mixing voice modes inside one answer is unparseable by ear.

The fix is upfront type detection — the prompt forces the model to classify each sub-question independently and pick a format mode:

| Type | Output mode |
|------|-------------|
| 选择题 (multiple choice) | "选 X, the option text" — never expand calculations |
| 计算题 (calculation) | TTS formula format with 句号 + 下一行 between steps |
| 改错题 (corrections) | "划掉 X，改成 Y" |
| 画图题 (drawing) | Chinese narration + English technical terms |
| 填空题 (fill-in) | Sequential answers |
| 简答题 (short answer) | Natural English prose, no `字母` prefix, no Chinese digits |

The "**绝不在简答题中使用TTS公式格式**" prohibition at the bottom is the explicit guard against the original failure mode.

---

## Section 2: TTS formula format (calculation only)

This is the heart of the prompt. Without these rules, TTS engines:

- Skip single-letter variables (`w` → silence).
- Run consecutive variables together (`nRT` → unpronounceable).
- Swallow units after numbers (`86.3J` → just "86.3").
- Slur formula steps into mush.

The fixes:

1. **`字母` prefix on every single-letter variable.** `字母w`, `字母n`, `字母R`. Reads as "zì-mǔ w" — clear and unmissable.
2. **`乘以` between consecutive variables.** `nRT` → `字母n，乘以，字母R，乘以，字母T`.
3. **Comma between number and unit.** `86.3` then `,` then `j`. The comma is a forced pause that prevents merging.
4. **Period + `下一行` between formula steps.** Creates breathing room and tells the listener to start a new line on paper.
5. **Standard state `°`** is read as the literal English word `degree`. Never as a subscript.
6. **Subscripts** like `rxn`, `f`, `fus`, `p`, `ext` are spoken (`下标rxn`).
7. **Case clarification** when the same letter appears in both cases in one problem ("第一次标注大写或小写").
8. **Digits run together** inside a number — never `二，九，八，点，三，七`. Always `二九八点三七`. The earlier version put commas between digits and it sounded like ransom-note pacing.
9. **`点` for the decimal point** — voice models occasionally heard `占` (which means "occupy") if you wrote it loosely.
10. **Operators stay Chinese**: 加, 减, 乘以, 除以, 等于, 负. Never `negative`, `plus`, `equals`. Mixing English operators inside Chinese math drove the rate of TTS errors way up.
11. **Connectors stay Chinese**: 所以, 得到, 代入.
12. **Confusable units in Chinese**: `kJ` → 千焦, `kg` → 千克, `kPa` → 千帕. Latin-letter unit names get garbled by the Chinese voice on rapid syllables.

Rules 13-20 cover brackets, exponents, fractions, scientific notation, math functions (`ln`, `log`, `sin`, `cos`, `tan`, `delta` — kept as English names), unit abbreviation policy (`j` not `joules`), and the `+273.15` temperature rule.

---

## Section 3: Calculation principles

> 精简、完整、满分。每个字都是写在答题纸上的，没有废话。
>
> 如果要求计算多个量，每个都给完整过程，不能只给最终结果。

The model has freedom to organize steps but must hit three constraints: **complete** (no missed steps for full marks), **concise** (no filler), and the explicit "if asked for multiple quantities, give the full derivation for each one" — added because the model used to short-circuit and only show the final answer for problems with multiple unknowns.

---

## Section 4: Question numbering

| Source format | Spoken format |
|---|---|
| 1, 2, 3 | 第一题, 第二题, 第三题 |
| a, b, c | a小问, b小问 |
| i, ii, iii | 第一小问, 第二小问 |
| A, B, C (capitals as labels) | 大A, 大B |

The `i ii iii` problem: small letter `i` reads as a vowel, not a numeral. Forcing 第一小问 / 第二小问 makes the question structure audible.

---

## Section 5: Format consistency

> 计算题中绝不能切换成英文句式。运算符永远中文。
> 简答题中用自然英文，不插入中文数字或字母前缀。
> 画图题中用中文指导，关键英文术语保持英文。

The model used to try mixing modes mid-sentence ("For Chlorine, delta G equals 负一四一" — half English narration, half Chinese formula format). Forced consistency by mode.

---

## Section 6: Absolute prohibitions

The negative space matters as much as the positive rules:

- Don't echo the question itself — answers only.
- No mathematical symbols (`+ − × ÷ =`) — they don't read.
- No markdown (no `**bold**`, no `#` headers).
- No expanding calculations inside a multiple-choice answer.
- No TTS formula format inside a short-answer.
- No Chinese descriptions in place of formulas ("反应物键能总和" — write the actual formula).
- No consecutive letter variables.
- No commas inside a number.
- No filler explanation.
- Every character should be writable on paper.

That last line is the spirit of the whole prompt: if you wouldn't write it on the answer sheet, don't say it.
