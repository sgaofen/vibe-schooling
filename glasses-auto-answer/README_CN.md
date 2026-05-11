# 眼镜拍照答题系统

> **[English Version](README.md)**

戴上眼镜，对着题拍一张照，15 到 25 秒后答案在耳边响起，照着写就行。

不用拿手机，不用看屏幕，没有亮光暴露你。整条流水线都跑在裤兜里。

---

## 系统架构

```
小米眼镜 — 拍试卷照片
  → 蓝牙 → 小米眼镜 app（照片暂存在 app 的相册）
眼镜_纯导入.macro — MacroDroid 每 3 秒点一次「导入」按钮
  → 照片落到 /sdcard/DCIM/XiaomiGlass/IMG*.jpg
上传文件_azure.macro — FileChangedTrigger 监视该目录
  → ShellScript：
      1-3. curl Gemini 3 Flash Preview（thinkingLevel=high）解题
      4.   curl Azure Speech REST（westus2）合成 mp3
      5.   验证 mp3 完整
  → PlaySoundAction 播放 /storage/emulated/0/MacroDroid/tts_output.mp3
  → 眼镜骨传导扬声器响起来
```

按下快门到第一个音节出来：约 15-25 秒。没有云服务器、没有 app 要装——就两个 MacroDroid 宏 + 一段 shell 脚本。

---

## 关键技术选择

### 视觉模型：Gemini 3 Flash Preview，`thinkingLevel: high`

在同一组选择题照片上跑了 60 轮 head-to-head：

| 模型 | 60 轮全部稳定的比例 | 备注 |
|---|---|---|
| **Gemini 3 Flash** | **58%** | 同一张图选项稳定。对正在进行的考试照片不会触发拒答。 |
| GPT-5.5 | 38% | 漂移：同一个字母编号、不同的选项内容（B platyhelminth → B annelid → B amnion）。对边界情况会触发自带的「I won't help with active exams」内容护栏。 |

成本上 Gemini 输出 token 也便宜约 30%（~100 vs ~1000——GPT-5 把推理过程藏在 `completion_tokens` 里收钱）。

`thinkingLevel: high` 平均 12.2 秒（60 轮 4.5-28.7 秒）。`medium` 快约 30%、清晰图片下答案质量一致。如果你的图片很干净可以降到 medium；默认 high 是因为教室照明、桌面杂物多的时候它给的稳定性值得这点延迟。

### TTS：Azure Speech REST 直连，`zh-CN-XiaoxiaoNeural`，`rate=-25%`

500 字符的中英混合答案 head-to-head：

| 引擎 | 延迟 | 质量 | 备注 |
|---|---|---|---|
| **Azure Speech REST** | **~1 秒** 端到端（Mac → westus2） | 每个字都读 | 赢家。F0 免费档每月 50 万字符。学生 $100 抵用券走 S0 大约够 6M 字符——按日常用量 10 年用不完。 |
| edge-tts（非官方） | ~1.25 秒 | 同款声学模型 | 免费但走的是 Edge 浏览器内部接口，没有 SLA。 |
| OpenAI gpt-4o-mini-tts（Coral） | 500 字符 ~14 秒 | 自然，但随机 | 长文本偶尔会跳过几段静音。付费。 |
| Piper 本地（zh_CN-huayan-medium） | 本地 | 中英混合直接拉胯 | 英文/公式段会被静默丢掉。100 秒的内容只生成 63 秒音频。 |
| macOS `say`（Tingting） | 本地 | 还行 | 只能 Mac 用，桌面测试用。 |

**为什么传统 TTS 在听写场景里赢过 LLM-based TTS。** LLM 出现之前的 TTS（VITS、FastSpeech2 + HiFi-GAN、Tacotron2）的设计目标就是稳定——输入每个字符，输出对应每个字符。Azure Neural TTS 底层就是 FastSpeech2 + HiFi-GAN。LLM-based TTS（gpt-4o-mini-tts、Bark、VALL-E）听感更自然，但本质是把音频当生成式 codec 序列建模，输出是随机的，偶尔会丢字。听写场景必须把每个数字、每个变量名都读出来——传统神经 TTS 才是正确答案。

`rate=-25%` 把语速降到方便边听边写的节奏。

### 图片路径：原图直接送 Gemini

生产链路把眼镜原图直接喂 Gemini。Gemini 3 Flash 对手持抖糊角度刁钻的眼镜照已经 ~90% 准——不需要预处理。

如果想裁得更紧（省 Gemini input tokens、不让 LLM 看到周遭环境），我们训了一个专门的纸张分割模型：[**sgaofen/paper-extractor**](https://github.com/sgaofen/paper-extractor)。架构是个小 Unet（~5M 参数，34MB ONNX，手机 CPU ~100ms），在 341 张手持眼镜照 + 手工 4 角标注上训出来，val IoU 0.96。

接入方式：在手机上跑一个小 Python 服务（Termux + onnxruntime，总开销 ~350ms/张），在调 Gemini 之前加一句 `curl 127.0.0.1:8125/extract`。模型返回矫正后的纸面（mask 太歪就直接 passthrough 原图）。具体看那个 repo 的 README。

之前试过两条路都没成：
- **纯 OpenCV**（Canny + Hough + approxPolyDP）：干净扫描 ~60%，手持角度全跪。
- **U²-Netp 通用 salient object 预训练**：基线 ~80%，极端角度失败——"通用显著物"和"纸张边缘"不是一回事。

[sgaofen/paper-extractor](https://github.com/sgaofen/paper-extractor) 那套定制训练把角度问题解决了，因为训练数据是 in-domain 的。

---

## 目录结构

```
glasses-auto-answer/
├── android-scripts/
│   └── study_dictation_full.sh   # 一体化脚本：Gemini → Azure → mp3
├── macrodroid/
│   ├── 眼镜_纯导入.macro          # 宏 1：每 3 秒点「导入」
│   ├── 上传文件_azure.macro       # 宏 2：监视新照片，跑脚本，播放音频
│   ├── setup-guide.md            # 配置指南
│   └── setup-guide_cn.md
├── prompts/
│   └── gemini-prompt.md          # Gemini prompt 拆解说明
└── debug-tool/                    # 本地 web 调试 UI
    ├── app.py                    # 在电脑上调用 Gemini + Azure
    └── static/
```

页面裁剪是可选项，独立 repo 见：[sgaofen/paper-extractor](https://github.com/sgaofen/paper-extractor)。

---

## 部署

1. 申请 [Azure Speech key](https://portal.azure.com)（Free F0 档够用，region 选 `westus2` 或离你近的）。
2. 申请 [Gemini API key](https://aistudio.google.com/apikey)。
3. Android 上装 MacroDroid（免费版即可）和小米眼镜 app。
4. 把 [`macrodroid/眼镜_纯导入.macro`](macrodroid/眼镜_纯导入.macro) 和 [`macrodroid/上传文件_azure.macro`](macrodroid/上传文件_azure.macro) 导入 MacroDroid。
5. 打开第二个宏的 shell 脚本动作，把 `REPLACE_WITH_YOUR_GEMINI_API_KEY` 和 `REPLACE_WITH_YOUR_AZURE_KEY` 替换成你的真 key。
6. 跟着 [MacroDroid 配置指南](macrodroid/setup-guide_cn.md) 走一遍 ColorOS / OPPO 权限清单——多数人栽在前台服务通知那一步。

冒烟测试：在小米眼镜 app 里停在「导入」对话框界面，用眼镜拍一张照，等 15-25 秒，听。

---

## 部署前先在电脑上调 prompt

[debug-tool/](debug-tool/) 是本地的 web 调试界面。拖一张样本图进去，在浏览器里改 prompt，发给 Gemini，再发给 Azure，听效果。比每次改完都重新粘贴脚本到 MacroDroid 快得多。它从环境变量或 `~/.azure-tts.env` 读 Azure 凭据。

```bash
cd debug-tool
GEMINI_API_KEY=... AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=westus2 python3 app.py
# 浏览器打开 http://127.0.0.1:8765
```

---

## 关于 Gemini prompt

输出是给 TTS 听的，不是给屏幕看的。这个 prompt 同时干三件事：

1. 把题做对。
2. 用一种让 TTS 不会跳字的格式把答案写出来——单字母变量加「字母」前缀，数字和单位之间加逗号，连续变量之间用「乘以」隔开。
3. 控制长度——Azure 没有硬上限，但短一点听起来快一点。

每条规则都是因为没这条规则的时候出过错。完整拆解见 [`prompts/gemini-prompt.md`](prompts/gemini-prompt.md)。

---

*为了一个真实的问题做的：当你需要看起来正常时，听到答案比看到答案更好。*
