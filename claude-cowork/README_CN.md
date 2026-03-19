# Claude Cowork 自动化做作业

> **[English Version](README.md)**


不是工具——是方法论。

## 问题

大多数学生用 AI 做作业的方式都一样：把题目粘贴到 ChatGPT 然后祈祷。输出是通用的，漏掉评分标准，忽略教授的偏好，重复你已经被扣过分的错误。交上去，在同样的地方丢分，然后觉得 AI "不好用"。

## 解决方案：Skills

Claude Cowork 有一个功能叫 **Skills**——跨会话持久化的指令文件。它们存在你的 `.claude/` 目录里，告诉模型怎么处理特定类型的任务。

核心思路很简单：**把所有影响你成绩的东西都编码进一个 Skill。**

1. **评分标准** — 评分标准具体怎么说的
2. **老师的特殊要求** — 课上说了但没写进标准的东西
3. **历史扣分反馈** — 之前被扣分的地方，确保不再犯

## 迭代循环

每一轮都在收紧校准。到第三四次作业，Skill 比你自己还了解你教授的口味。模型不再生成泛泛的内容，而是生成针对拿着红笔那个人校准过的内容。

## 最适合

- Lab reports (实验报告)
- R/statistics analysis reports (R 语言/统计分析报告)
- Complex multi-section assignments (复杂的多章节作业)
- Structured long-form essays (结构化长文论述)
- Anything with a rubric and a repeating pattern (任何有评分标准和重复模式的作业)

## 下一步
