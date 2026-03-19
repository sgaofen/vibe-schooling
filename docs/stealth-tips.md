# Stealth & Privacy Tips

> **[中文版](stealth-tips_cn.md)**


The tools work. The question is whether anyone notices you using them. This page is about the second part.

---

## Canvas Sniper

**Detection risk: Low.**

The extension runs inside the page as a content script. From Canvas's perspective, the student is clicking answers and typing text — because that's literally what's happening, just automated. There is no network signature, no browser fingerprint change, no injected iframe. Canvas LMS has no mechanism to detect a content script running in the same tab.

Mouse Simulation mode makes it even harder to distinguish: the cursor follows bezier curves with randomized control points, typing includes irregular delays between keystrokes, and dropdown menus are physically opened before selections are made. At the browser level (via CDP), the events are indistinguishable from a real mouse.

Stealth mode hides the small status overlay that normally appears when processing a question. With it on, there's nothing visible on-screen to give you away.

**The one thing it can't do: bypass Lockdown Browser.** If your school uses Respondus or a similar proctoring tool that locks the browser environment, Canvas Sniper won't load. For proctored exams, use the glasses system instead.

---

## Glasses System

### Why Audio Beats Screens

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

### The Indicator Light

Xiaomi glasses blink a small light when the camera activates. This is the one remaining tell.

**Fix**: Buy an anti-light privacy sticker (防闪贴纸) and cover the indicator.

- **Daylight**: Completely invisible with the sticker. No one will notice.
- **Dark rooms**: A faint glow might still be visible at very close range. Be aware of your lighting environment.

---

## General Advice

The biggest risk isn't technical — it's behavioral. The system can be invisible, but you can't be.

- **Don't act differently.** If you normally look around during exams, keep doing it. If you normally sit still, sit still. Sudden changes in behavior are more suspicious than any gadget.
- **Test the full pipeline before the exam.** Know how long each step takes, what failure looks like, and what to do if something breaks. Surprises during an exam are dangerous.
- **Keep your phone out of sight.** The pipeline runs automatically — the phone should be in your pocket or bag, not on the desk.
- **Practice the photo gesture.** Taking a photo with the glasses should look natural and fast. Practice until it's muscle memory.
- **Have a fallback plan.** If the system fails mid-exam, you need to be able to continue answering normally. Don't depend on it 100%.
