# MacroDroid 配置指南

> **[English Version](setup-guide.md)**

最终效果：眼镜拍照 → 等 15-25 秒 → 答案直接在耳边响。

---

## 准备

1. **MacroDroid**——Google Play 装免费版。
2. **小米眼镜 app**——已经装好并和眼镜配对完成。
3. **两个 API key**：Gemini + Azure Speech（下面说）。
4. **权限**：无障碍、存储、通知、悬浮窗、关闭电池优化。OPPO/Realme/OnePlus 用户还要走下面的 ColorOS 清单。

### 申请 API key

| Key | 在哪申请 | 费用 |
|-----|---------|------|
| **Gemini API key** | [Google AI Studio](https://aistudio.google.com/apikey) → Create API Key | 有免费额度，日常够用 |
| **Azure Speech key** | [portal.azure.com](https://portal.azure.com) → 创建 Speech 资源（region 选 `westus2` 或离你近的）→ 复制 `KEY 1` | F0 免费档每月 50 万字符，远超你的用量 |

Azure 那边创建资源时记得把 pricing tier 选成 **F0 (Free)**。哪天用爆 F0 了把资源切到 S0 就行——key 不用换，脚本不用改。

---

## 你要建的东西

两个宏：

| 宏 | 干什么 |
|-----|------|
| `眼镜_纯导入.macro` | 每 3 秒模拟点击小米眼镜 app 里的「导入」按钮，把眼镜里的照片同步到手机存储 |
| `上传文件_azure.macro` | 监视照片目录，新照片出现时跑 shell 脚本（Gemini + Azure）然后播放生成的 mp3 |

---

## 第一步：填脚本里的 key

导入宏之前，先用任意文本编辑器打开 [`android-scripts/study_dictation_full.sh`](../android-scripts/study_dictation_full.sh)。脚本头：

```sh
api_key="REPLACE_WITH_YOUR_GEMINI_API_KEY"
TTS_KEY="REPLACE_WITH_YOUR_AZURE_KEY"
TTS_REGION="westus2"
TTS_VOICE="zh-CN-XiaoxiaoNeural"
TTS_RATE="-25%"
```

把两个 key 换成你的真 key。如果你 Azure 选了别的 region，改 `TTS_REGION`。保存。

> `macrodroid/上传文件_azure.macro` 文件里 `m_script` 字段就是这同一段脚本。你可以在 .macro JSON 里直接改完再导入，也可以导入完再在 MacroDroid 里改——后者一般更不容易出错。

---

## 第二步：导入两个宏

1. 把 `macrodroid/眼镜_纯导入.macro` 和 `macrodroid/上传文件_azure.macro` 传到手机上（云盘、USB、AirDrop 都行）。
2. MacroDroid 里：**设置 → 导入 / 导出 → 导入** → 各选一次。
3. 导入完成后，打开 上传文件_azure 这个宏，点 Shell 脚本动作，把里面的 `api_key` 和 `TTS_KEY` 改成你的真 key（如果你第一步是改 .macro 文件这步就跳过）。
4. 把两个宏开关都打开。

宏里已经配好了：

- `眼镜_纯导入`：每 3 秒触发一次，按文字匹配模拟点击「导入」按钮。使用时手机停在小米眼镜 app 的「导入」对话框界面。
- `上传文件_azure`：监视 `/storage/emulated/0/DCIM/XiaomiGlass/IMG*`（Created/Modified/Deleted），跑脚本，然后播放 `/storage/emulated/0/MacroDroid/tts_output.mp3`。

---

## 第三步：ColorOS / OPPO 权限清单（必看）

ColorOS 杀后台特别凶。OPPO/Realme/OnePlus 用户必须把下面**全部**做完：

- **设置 → 电池 → 电池优化 → MacroDroid：不优化 / 无限制**
- **设置 → 应用 → MacroDroid → 自启动：允许**
- **设置 → 应用 → MacroDroid → 后台运行：允许**
- **设置 → 电池 → 智能后台冻结：关闭**（或者把 MacroDroid 加入白名单）
- **最近任务里把 MacroDroid 下拉，点锁图标**（锁住，防止被一键清理）
- **MacroDroid → 设置 → 通知栏 → 显示常驻通知：开** ← **前台服务豁免最关键的一条，多数人栽在这里**
- **开发者选项**：「不保留活动」关闭、「后台进程限制」选标准限制
- 小米眼镜 app **同样**要给后台启动和自启动权限。否则连续触发宏的时候被冻的不是宏，而是被点击的目标 app。

如果你的音频每过 5-10 分钟就突然不响了，基本都是上面这几条没配齐。

---

## 第四步：冒烟测试

1. 打开小米眼镜 app，导航到能看见「导入」按钮的那个对话框界面。停在这一屏。
2. 确认两个宏都开了。
3. 用眼镜拍一张照。
4. 等。3 秒内照片会同步到手机；再 12-22 秒答案就响了。

按下快门到第一个音节出来，通常 15-25 秒。

---

## 出问题怎么排查

听不到音频，先看手机上这几个调试文件：

| 文件 | 看什么 |
|------|--------|
| `/sdcard/tts_error.txt` | Gemini 没返回文本，或者 Azure 拒绝（key 错、region 错、tier 用爆等） |
| `/sdcard/gemini_output.txt` | Gemini 返回的具体文本 |
| `/sdcard/gemini_response.json` | Gemini API 原始响应——输出空时看这个 |
| `/sdcard/tts_request.xml` | 发给 Azure 的 SSML 内容 |

常见情况：

- **没声音 + tts_error.txt 空** → Gemini key 错，或者额度用爆了。
- **tts_error.txt 里是 `<?xml` 开头的 XML** → Azure 拒了。多半是 key 错、region 错，或者你创建的不是 Speech 资源。
- **mp3 能放但被截断 / 静音** → MacroDroid 的 PlaySoundAction 偶尔会和系统媒体流冲突。重存一次宏，换个音频流试试。
- **第一张能用、之后不响了** → ColorOS 把 MacroDroid 杀了。回到上面的权限清单重新对一遍。

---

## 小贴士

- **开勿扰**：避免通知声把音频打穿。
- **音量**：先在私下试音量。有个甜点位置——你听得清楚，旁边人完全听不到。
- **先在电脑上调 prompt**：在 MacroDroid 里改 prompt 很折磨。[debug-tool](../debug-tool/) 可以在浏览器里拖图、改 prompt、试 Azure、听效果，迭代快得多。
- **电量**：3 秒一次的导入宏在 2 小时考试里大约多耗 5-10% 电。不用的时候把两个宏都关掉。
