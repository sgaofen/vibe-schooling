# TTS 提供商对比

> **[English Version](tts-comparison-guide.md)**

Gemini 输出的答案是中文、英文、数字、单位、科学记数法混在同一句里。找一个不会念错的 TTS 引擎花了我五个 provider 的实测对比时间。

## 当前赢家：Azure Speech REST 直连

**模型**：`zh-CN-XiaoxiaoNeural`，`prosody rate="-25%"` 慢速适合边听边写。
**Endpoint**：`https://westus2.tts.speech.microsoft.com/cognitiveservices/v1`
**鉴权**：`Ocp-Apim-Subscription-Key` header 里塞 subscription key。

### 为什么它赢

**延迟**。五个长度档每档 5 trial 实测（Mac → Azure West US 2）：

| 字符数 | 音频时长 | 最小/平均/最大延迟 |
|---|---|---|
| 10 | 3.9s | 0.33 / 0.37 / 0.46s |
| 50 | 16.2s | 0.38 / 0.43 / 0.47s |
| 200 | 60.4s | 0.50 / 0.53 / 0.56s |
| **500** | **151s** | **0.89 / 0.99 / 1.06s** |
| 1500 | 459s | 2.08 / 5.77 / 11.59s |

500 字是典型考试答案长度。**端到端 ~1 秒** 拿到 2.5 分钟音频。RTF（real-time factor）大约 150 倍。

对照之前生产用的 OpenAI 在同样 500 字上的 **14 秒**——Azure 在这个长度上**快了大约 14 倍**。原因是 Azure 走 streaming 协议，边生成边推到客户端；OpenAI 必须等整段合成完才一次性返回。

**逐字节读对**。底层是 FastSpeech2 + HiFi-GAN——为稳定性而工程化的，不是为创造性。中英混合、科学记数法、嵌在中文句子里的单个英文变量名，全都干净通过。SSML prosody 提供精确的语速/音调控制，-25% 慢速下也没有金属电音。

**免费档够日常用**。F0 每月 50 万字符神经 TTS 配额——大约能撑 1000 次典型考试答案。学生 100 美元 credit 在 S0 付费档（$16/百万字符）能买 600 万字符，按典型用量是十年的量。

**直接出 MP3**。`X-Microsoft-OutputFormat: audio-24khz-48kbitrate-mono-mp3` 拿回 MacroDroid PlaySound 直接能放的 MP3 字节流，不用 ffmpeg 转换。

### 注意点

- region 选离你近的。尔湾到 westus2 的 RTT 大约 15ms，到 East US 是 80ms——后者每次调用多 200-300ms。短答案影响小，长答案累积差别明显。
- 1500 字以上延迟开始非线性增长（不再是稳定值）。日常 200-800 字答案不会触碰；如果是 5 分钟讲座转录，预期 5-15s 生成 + 偶发离群点。
- Azure subscription key 在 shell 脚本里就意味着会落到手机上。当 secret 处理：不要把 macro 文件 push 到公开 repo，先脱敏。

---

## 之前用的：OpenAI gpt-4o-mini-tts（Coral）

最早上的方案。能用——Coral 是辨识度高的人声，中英混合通过没问题，`instructions` 参数能调整节奏和重音。它**之所以不再赢**，是因为**延迟**：典型 500 字答案要 14 秒，是整个等待时间的大头。换上 Azure 之后端到端从 30-40 秒降到 15-25 秒，瓶颈让给 Gemini OCR（那块更难优化）。

OpenAI 还做得好的：
- 声音多样性。Coral 是 13 款声音之一，几款有鲜明性格。
- `instructions` 参数接受自由形式行为文本——Azure SSML 没有等价物。想说"用严厉老师的语气念这段"，OpenAI 听得懂。
- 随机生成产生*自然*韵律。Azure 是为字符级可靠性而工程化的，-25% 慢速下偶尔听感稍机械。

让我换掉它的：
- 实际答案长度上 14s vs 1s 太硬伤了。
- 长输入（>1000 字）偶尔会无声跳字。LLM 风格的 codec TTS 本质是从分布里采样——大多数时候对，少数采样会吞字。听写场景必须 100% 准确，这是 dealbreaker。
- 纯付费，没免费档。

如果你看重声音多样性，且不在乎多等 10 秒，OpenAI 仍然是合理选择。

---

## Edge TTS（`edge-tts` Python 包）

跟 Azure 共用同一套语音模型（Microsoft 全公司一份模型注册表）。同样 SSML 输入，`zh-CN-XiaoxiaoNeural` 从 edge-tts 和 Azure 生成的 MP3 字节级一致——我们用 md5 校验过。

**延迟**：~1.25s for 7.6s 音频。比 Azure REST 慢约 2 倍，因为 edge-tts 走的是 websocket-based 协议（设计用于 Edge 浏览器朗读模式），多了一层 framing 开销。

**为啥没选它**：Microsoft 这个 Edge endpoint 是未公开的。`edge-tts` 这个包跟得上 Microsoft 改协议，但**没有 SLA、没有官方支持**。当玩具用没问题；当"明早 8 点考试要靠它"的工具用，Azure REST 更稳。

**最早试它的原因**：零鉴权、免费、声音一致。如果你不想注册 Azure subscription，这是最接近的替代品。

---

## 纯本地方案（失败）

### Piper（`zh_CN-huayan-medium`）
75MB ONNX 模型，CPU 上 >10 倍实时跑，**对中英混合内容完全失败**。我们 552 字的测试 prompt，它返回了 63 秒音频——本来该是 ~100 秒。英文字符和化学公式被无声跳过——Piper 的纯中文训练数据没有映射。这个项目用不了。

### macOS `say`（Tingting / Meijia / Eddy / Flo / Sandy / Shelley 等）
中英混合处理意外地好。Tingting `-r 130` 的听写节奏很合适。**桌面端调 prompt 时很有用**——想听一个修改的 prompt 念出来啥效果，又不想烧 Azure 配额。但只在 macOS 上跑，部署不行。

### 中文原生开源模型（Fish Speech、Index 3 TTS、Xiaomi MIMO TTS、MeloTTS、CosyVoice、GPT-SoVITS、ChatTTS）
声音克隆很厉害。纯中文优秀。纯英文凑合。**混合内容崩溃方式跟 Piper 一样**：逗号之间的词消失、英文字母乱码、带单位的数字变废话。这些模型的训练数据压倒性单语，碰到 `字母P下标CO，等于，一点九六，atm` 就懵。如果你内容单语，可以考虑。我们不是。

---

## 汇总

| Provider | 中英混合 | 直出 MP3 | 500 字延迟 | 免费档 | 用不？ |
|---|---|---|---|---|---|
| **Azure Speech REST** | 优 | 是 | **~1s** | 50万字/月 | **现役赢家** |
| edge-tts（同款声音） | 优 | 是 | ~1.5s | 无限（无 SLA） | 备份方案 |
| OpenAI gpt-4o-mini-tts（Coral） | 好 | 是 | ~14s | 无 | 曾经的赢家，Azure 干掉了 |
| Google Cloud TTS | 大概行 | 否（要转码） | 没测 | 有限 | 没测 |
| Piper（本地） | 混合崩溃 | 是（WAV） | <1s 本地 | 免费 | 否 |
| macOS `say` | 优 | 否（AIFF） | 即时 | 免费 | Mac only，开发时用 |
| Fish Speech / Index / MIMO | 混合崩溃 | 各异 | 各异 | 各异 | 否 |

## 怎么切换

可部署脚本（`android-scripts/study_dictation_full.sh`）和生产 macro 都已经指向 Azure REST 直连。想测 Edge TTS 或回滚 OpenAI：

- **Edge TTS**：`pip install edge-tts && edge-tts --voice zh-CN-XiaoxiaoNeural --rate=-25% --text "..." --write-media out.mp3`
- **OpenAI**：旧的 OpenAI 块在 `debug-tool/app.py` 里以注释代码保留。取消注释，配 `OPENAI_API_KEY`，回到旧链路。

想本地 A/B 听，`paper-extractor/results/tts_compare/` 里有同一段复杂测试文本被 5 个引擎渲染的样本——逐个听，自己挑。
