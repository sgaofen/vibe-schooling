# Stealth & Privacy Tips

> **[中文版](stealth-tips_cn.md)**

The tech works. The question is whether anyone notices you using it.

## Canvas Sniper

Low risk. The extension runs as a content script inside the Canvas page. From Canvas's perspective, a student is clicking answers and typing text — because that's literally what's happening, just automated.

Mouse Simulation makes it harder to distinguish from real input: bezier curve cursor paths, irregular typing delays, dropdown menus physically opened before selection. Via CDP, the events are indistinguishable from a real mouse at the browser level.

Stealth mode hides the small processing indicator. With it on, nothing on screen gives you away.

**The limit:** it cannot bypass Lockdown Browser. If your school uses Respondus or similar proctoring software that locks the browser, Canvas Sniper won't load. For proctored exams, use the glasses system.

## Glasses system

### Why audio beats any screen

I looked at every smart glasses option with a display — green tint, full color, you name it. They all have the same problem: **the back of the lens glows.** From the front you might not notice, but anyone behind you or walking past sees it immediately. In an exam hall with a proctor circling the room, that's a death sentence.

Audio through the glasses speakers is invisible. There's nothing to see. The glasses look like regular glasses because they basically are — the Xiaomi AI Glass weighs 40g and looks like an ordinary pair of frames. Other options like Ray-Ban Meta or Solos AirGo work too, as long as they have a camera and speakers.

Privacy mode + low volume = the person sitting right next to you hears nothing. I've tested this multiple times, sitting shoulder to shoulder. Zero sound leakage.

### Compatible glasses

This system works with any smart glasses that have a camera and built-in speakers:

| Glasses | Camera | Speakers | Notes |
|---------|--------|----------|-------|
| **Xiaomi AI Glass** | 12MP, f/2.2, 105° wide | 2 directional speakers | What I use. 40g, looks like normal glasses. ~¥1999 |
| **Ray-Ban Meta** | 12MP ultra-wide | Temple speakers | More widely available outside China. $299+ |
| **Solos AirGo A5** | 16MP | Open-ear speakers | Budget-friendly alternative |

The key requirements are: camera that can take a photo you can trigger, and speakers (or Bluetooth earbuds pairing). The MacroDroid automation just needs the photos to land in a known folder on your phone.

### The indicator light

Most glasses blink an LED when the camera activates. On the Xiaomi AI Glass, it's a small light near the lens.

**Fix:** buy an anti-light privacy sticker (防闪贴纸) and cover it.

- **Daylight:** completely invisible with the sticker
- **Dark rooms:** a faint glow might still be visible at very close range — be aware of your environment

### Don't get caught by your own behavior

The system can be invisible. You might not be. Some things to keep in mind:

- **Act normal.** If you usually fidget during exams, keep fidgeting. If you usually sit still, sit still. Sudden changes in behavior catch more attention than any gadget.
- **Practice the photo gesture.** Taking a photo with the glasses should look like adjusting your frames or scratching your temple. Make it muscle memory.
- **Phone stays in your pocket.** The pipeline is automatic. Having your phone on the desk defeats the purpose.
- **Test before the exam.** Know how long each step takes, what failure looks like, and what you'll do if something breaks mid-exam. Surprises are dangerous.
- **Don't rely on it 100%.** If the system fails, you need to be able to keep answering on your own. It's a tool, not a life raft.
