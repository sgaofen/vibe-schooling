# Stealth & Privacy Tips / 隐蔽性与隐私建议

The tools work. The question is whether anyone notices you using them. This page is about the second part.

工具是好用的。问题是别人会不会发现你在用。这页讲的是第二个问题。

---

## Canvas Sniper

**Detection risk: Low.**

The extension runs inside the page as a content script. From Canvas's perspective, the student is clicking answers and typing text — because that's literally what's happening, just automated. There is no network signature, no browser fingerprint change, no injected iframe. Canvas LMS has no mechanism to detect a content script running in the same tab.

Mouse Simulation mode makes it even harder to distinguish: the cursor follows bezier curves with randomized control points, typing includes irregular delays between keystrokes, and dropdown menus are physically opened before selections are made. At the browser level (via CDP), the events are indistinguishable from a real mouse.

Stealth mode hides the small status overlay that normally appears when processing a question. With it on, there's nothing visible on-screen to give you away.

**The one thing it can't do: bypass Lockdown Browser.** If your school uses Respondus or a similar proctoring tool that locks the browser environment, Canvas Sniper won't load. For proctored exams, use the glasses system instead.

**检测风险：低。**

插件以内容脚本的形式运行在页面内。Canvas 看到的是学生在点答案、打字——因为事实就是如此，只不过是自动化的。没有网络指纹变化，没有注入 iframe。Canvas LMS 没有任何机制能检测同一个 tab 里运行的内容脚本。

鼠标模拟模式让区分更加困难：光标沿贝塞尔曲线移动，打字有随机延迟，下拉菜单会先打开再选择。通过 CDP，事件和真实鼠标完全一样。

隐身模式隐藏处理题目时出现的小状态提示。开了之后屏幕上没有任何暴露你的东西。

**唯一做不到的：绕过 Lockdown Browser。** 如果学校用 Respondus 或类似的锁定浏览器，Canvas Sniper 无法加载。监考考试请用眼镜系统。

---

## Glasses System

### Why Audio Beats Screens / 为什么语音比屏幕好

Every screen-based smart glasses product on the market today has the same Achilles heel: **light leakage**.

- Green-screen and color-screen glasses glow from the back of the lens
- Even if the front looks clean from your angle, someone sitting behind you or walking past sees the glow
- No manufacturer has fully solved this — it's a fundamental physics problem with current display technology
- The glow is especially visible in dim rooms (exam halls with fluorescent lighting)

Pure audio eliminates this entirely:
- The glasses look like ordinary glasses because, functionally, they are
- Built-in speakers with privacy mode direct sound into your ears, not outward
- At low volume, someone sitting **right next to you** hears nothing
- No screen = no glow = no visual tell whatsoever

现有所有带屏幕的智能眼镜都有同一个致命弱点：**漏光**。

- 绿屏、彩屏眼镜的镜片背面都会发光
- 哪怕正面从你的角度看没问题，坐你后面的人或走过来的人都能看到光
- 没有任何厂商完全解决了这个问题——这是当前显示技术的物理限制
- 在暗光环境（考场的荧光灯下）尤其明显

纯语音完全消除了这个问题：
- 眼镜外观就是普通眼镜
- 内置喇叭的隐私模式把声音导向耳朵，不会外泄
- 低音量下，**紧挨着你坐的人**都听不到
- 没有屏幕 = 没有光 = 零视觉暴露

### The Indicator Light / 指示灯问题

Xiaomi glasses blink a small light when the camera activates. This is the one remaining tell.

**Fix**: Buy an anti-light privacy sticker (防闪贴纸) and cover the indicator.

- **Daylight**: Completely invisible with the sticker. No one will notice.
- **Dark rooms**: A faint glow might still be visible at very close range. Be aware of your lighting environment.

小米眼镜拍照时指示灯会闪。这是最后一个破绽。

**解决方法**：买一张防闪贴纸贴住指示灯。

- **白天**：贴上后完全看不到。没人会注意到。
- **暗处**：近距离可能还能隐约看到一点光。注意你的光线环境。

---

## General Advice / 通用建议

The biggest risk isn't technical — it's behavioral. The system can be invisible, but you can't be.

最大的风险不是技术上的——是行为上的。系统可以隐形，但你不行。

- **Don't act differently.** If you normally look around during exams, keep doing it. If you normally sit still, sit still. Sudden changes in behavior are more suspicious than any gadget.
- **Test the full pipeline before the exam.** Know how long each step takes, what failure looks like, and what to do if something breaks. Surprises during an exam are dangerous.
- **Keep your phone out of sight.** The pipeline runs automatically — the phone should be in your pocket or bag, not on the desk.
- **Practice the photo gesture.** Taking a photo with the glasses should look natural and fast. Practice until it's muscle memory.
- **Have a fallback plan.** If the system fails mid-exam, you need to be able to continue answering normally. Don't depend on it 100%.

- **不要表现得不一样。** 你平时考试会东看西看就继续，平时不动就不动。行为突变比任何设备都可疑。
- **考前测试完整流程。** 知道每一步要多长时间，失败是什么样的，出问题了怎么办。考试中的意外很危险。
- **手机不要拿出来。** 流程全自动，手机应该在口袋或书包里，不是桌上。
- **练习拍照动作。** 用眼镜拍照的动作要自然、快速。练到形成肌肉记忆。
- **准备后备方案。** 如果系统在考试中间挂了，你要能正常继续答题。不要 100% 依赖它。
