// ============================================================
// Canvas Sniper - Content Script
// 集成 GhostCursor 和 UIMimic 引擎
// ============================================================

// ==================== GhostCursor Engine (模拟光标) ====================
class GhostCursor {
    constructor() {
        this.cursorEl = null;
        this.overlayEl = null;
        this.currentPos = { x: 0, y: 0 };
        this.realMousePos = { x: 0, y: 0 };

        this.trackHandler = (e) => {
            this.realMousePos = { x: e.clientX, y: e.clientY };
        };
    }

    init() {
        if (!document.getElementById('sniper-cursor-style')) {
            const style = document.createElement('style');
            style.id = 'sniper-cursor-style';
            style.textContent = `
                body.sniper-active, body.sniper-active * {
                    cursor: none !important;
                }
                .sniper-ghost-cursor {
                    position: fixed !important;
                    top: 0 !important; left: 0 !important;
                    width: 32px !important; height: 32px !important;
                    z-index: 2147483647 !important;
                    pointer-events: none !important;
                    transition: none !important;
                    background: transparent !important;
                    border: none !important;
                }
                .sniper-interaction-lock {
                    position: fixed;
                    top: 0; left: 0; width: 100vw; height: 100vh;
                    z-index: 2147483646;
                    background: transparent;
                    cursor: none !important;
                }
            `;
            document.head.appendChild(style);
        }
        document.addEventListener('mousemove', this.trackHandler, { passive: true });
    }

    // 获取系统对应的鼠标 SVG
    _getCursorSVG() {
        const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform) || navigator.userAgent.includes('Mac');

        if (isMac) {
            // macOS 风格：黑色填充，白色细边
            // 精确模拟 macOS 默认箭头光标的形状和比例
            return `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 1L4 22L8.5 17.5L12 25.5L14.5 24.5L11 16.5L17 16.5L4 1Z"
                      fill="black" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>
            </svg>`;
        } else {
            // Windows 11 风格光标：白色填充，极细黑边（还原用户原版代码）
            return `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L1 16.5L4.8 12.8L7.8 19.5L10 18.5L6.8 11.8L12.5 11.8L1 1Z"
                      fill="white" stroke="black" stroke-width="0.3" stroke-linejoin="round"/>
            </svg>`;
        }
    }

    activate(startX, startY) {
        document.body.classList.add('sniper-active');

        this.overlayEl = document.createElement('div');
        this.overlayEl.className = 'sniper-interaction-lock';
        document.body.appendChild(this.overlayEl);

        this.cursorEl = document.createElement('div');
        this.cursorEl.className = 'sniper-ghost-cursor';
        this.cursorEl.innerHTML = this._getCursorSVG();
        document.body.appendChild(this.cursorEl);

        this.updatePosition(startX, startY);
    }

    // 归位：任务结束时飞回真鼠标位置
    async deactivate() {
        if (!this.cursorEl) return;

        const dist = Math.sqrt(
            Math.pow(this.realMousePos.x - this.currentPos.x, 2) +
            Math.pow(this.realMousePos.y - this.currentPos.y, 2)
        );

        if (dist > 10) {
            await this.animatePath(this.currentPos.x, this.currentPos.y, this.realMousePos.x, this.realMousePos.y);
        }

        document.body.classList.remove('sniper-active');
        if (this.cursorEl) this.cursorEl.remove();
        if (this.overlayEl) this.overlayEl.remove();
        this.cursorEl = null;
        this.overlayEl = null;
    }

    updatePosition(x, y) {
        this.currentPos = { x, y };
        if (this.cursorEl) {
            this.cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
    }

    async moveTo(element) {
        if (!this.cursorEl) return;
        const rect = element.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2 + (Math.random() * 4 - 2);
        const targetY = rect.top + rect.height / 2 + (Math.random() * 4 - 2);

        await this.animatePath(this.currentPos.x, this.currentPos.y, targetX, targetY);
    }

    async animatePath(startX, startY, endX, endY) {
        return new Promise(resolve => {
            const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            const baseDuration = Math.min(Math.max(distance * 2.5, 800), 2500);
            const duration = baseDuration * (0.85 + Math.random() * 0.3);

            // 贝塞尔曲线控制点
            const cp1X = startX + (endX - startX) * 0.3 + (Math.random() - 0.5) * distance * 0.5;
            const cp1Y = startY + (endY - startY) * 0.3 + (Math.random() - 0.5) * distance * 0.5;
            const cp2X = startX + (endX - startX) * 0.7 + (Math.random() - 0.5) * distance * 0.5;
            const cp2Y = startY + (endY - startY) * 0.7 + (Math.random() - 0.5) * distance * 0.5;

            const startTime = performance.now();

            const step = (now) => {
                if (!this.cursorEl) return resolve();
                if (cancelRequested) return resolve();

                const progress = Math.min((now - startTime) / duration, 1);
                const ease = progress < 0.5 ? 16 * Math.pow(progress, 5) : 1 - Math.pow(-2 * progress + 2, 5) / 2;
                const t = ease;

                const cx = Math.pow(1 - t, 3) * startX +
                    3 * Math.pow(1 - t, 2) * t * cp1X +
                    3 * (1 - t) * Math.pow(t, 2) * cp2X +
                    Math.pow(t, 3) * endX;

                const cy = Math.pow(1 - t, 3) * startY +
                    3 * Math.pow(1 - t, 2) * t * cp1Y +
                    3 * (1 - t) * Math.pow(t, 2) * cp2Y +
                    Math.pow(t, 3) * endY;

                this.updatePosition(cx, cy);

                // 微小随机抖动（模拟手部不稳定）
                if (Math.random() < 0.3 && progress > 0.1 && progress < 0.9) {
                    const jitterX = (Math.random() - 0.5) * 3;
                    const jitterY = (Math.random() - 0.5) * 3;
                    this.updatePosition(cx + jitterX, cy + jitterY);
                }

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(step);
        });
    }

    async click() {
        if (!this.cursorEl) return;

        // 到达目标后停留，模拟"确认目标"
        await new Promise(r => setTimeout(r, Math.random() * 1000 + 1000));

        // 按下动画
        this.cursorEl.style.transform += ' scale(0.95)';
        await new Promise(r => setTimeout(r, 80));
        this.cursorEl.style.transform = this.cursorEl.style.transform.replace(' scale(0.95)', '');

        // 真实点击：暂时穿透遮罩
        if (this.overlayEl) this.overlayEl.style.pointerEvents = 'none';

        const el = document.elementFromPoint(this.currentPos.x, this.currentPos.y);
        if (el) {
            el.click();
            el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: this.currentPos.x, clientY: this.currentPos.y }));
            el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: this.currentPos.x, clientY: this.currentPos.y }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (this.overlayEl) this.overlayEl.style.pointerEvents = 'auto';
    }
}

// ==================== UI Mimic Engine (假下拉框) ====================
class UIMimic {
    constructor() {
        this.fakeSelect = null;
        this.fakeList = null;
        this.activeRealSelect = null;
        this.activeOptionsMap = new Map();
    }

    async openDropdown(realSelect) {
        this.activeRealSelect = realSelect;
        this.activeOptionsMap.clear();

        const rect = realSelect.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(realSelect);

        // 创建假的下拉框盖在真的上面
        this.fakeSelect = document.createElement('div');
        this.fakeSelect.className = 'sniper-fake-select';
        this._copyStyles(realSelect, this.fakeSelect, computedStyle, rect);
        this.fakeSelect.textContent = realSelect.options[realSelect.selectedIndex]?.text || '';

        const arrow = document.createElement('span');
        arrow.textContent = '▼';
        arrow.style.cssText = 'float: right; font-size: 0.8em; margin-top: 2px;';
        this.fakeSelect.appendChild(arrow);
        document.body.appendChild(this.fakeSelect);

        // 创建假的下拉列表
        this.fakeList = document.createElement('ul');
        this.fakeList.className = 'sniper-fake-list';
        this.fakeList.style.cssText = `
            position: fixed;
            top: ${rect.bottom}px;
            left: ${rect.left}px;
            width: ${rect.width}px;
            max-height: 300px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ccc;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            padding: 0; margin: 0;
            list-style: none;
            z-index: 2147483647;
            font-family: ${computedStyle.fontFamily};
            font-size: ${computedStyle.fontSize};
            opacity: 0;
            transform: scaleY(0.9);
            transform-origin: top;
            transition: opacity 0.1s, transform 0.1s;
        `;

        Array.from(realSelect.options).forEach(opt => {
            const text = opt.text.trim();
            if (!text || text.toLowerCase().includes('select') || text.toLowerCase().includes('choose')) return;

            const li = document.createElement('li');
            li.textContent = text;
            li.style.cssText = `
                padding: 5px 10px;
                cursor: default;
                color: black;
                border-bottom: 1px solid #eee;
            `;
            li.onmouseenter = () => li.style.background = '#e6f7ff';
            li.onmouseleave = () => li.style.background = 'transparent';

            this.fakeList.appendChild(li);
            this.activeOptionsMap.set(normalizeText(text), li);
        });

        document.body.appendChild(this.fakeList);

        // 展开动画
        this.fakeList.offsetHeight; // 强制重绘
        this.fakeList.style.opacity = '1';
        this.fakeList.style.transform = 'scaleY(1)';

        await new Promise(r => setTimeout(r, 150));
    }

    findOptionElement(answerText) {
        const normalizedAns = normalizeText(answerText);

        // 精确匹配
        let target = this.activeOptionsMap.get(normalizedAns);

        // 模糊匹配
        if (!target) {
            for (const [text, li] of this.activeOptionsMap.entries()) {
                if (text.includes(normalizedAns) || normalizedAns.includes(text)) {
                    target = li;
                    break;
                }
            }
        }
        return target;
    }

    async closeDropdown() {
        if (!this.fakeList) return;

        this.fakeList.style.opacity = '0';
        await new Promise(r => setTimeout(r, 100));

        if (this.fakeList) this.fakeList.remove();
        if (this.fakeSelect) this.fakeSelect.remove();

        this.fakeList = null;
        this.fakeSelect = null;
        this.activeRealSelect = null;
    }

    _copyStyles(source, target, style, rect) {
        target.style.cssText = `
            position: fixed;
            top: ${rect.top}px;
            left: ${rect.left}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            background: ${style.backgroundColor === 'rgba(0, 0, 0, 0)' ? 'white' : style.backgroundColor};
            border: ${style.border};
            border-radius: ${style.borderRadius};
            padding: ${style.padding};
            font-family: ${style.fontFamily};
            font-size: ${style.fontSize};
            line-height: ${style.lineHeight};
            color: ${style.color};
            box-sizing: border-box;
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: space-between;
            overflow: hidden;
            white-space: nowrap;
        `;
    }
}

// ==================== Main Logic ====================

let isEnabled = true;
let isProcessing = false;
let cancelRequested = false;
let stealthMode = false;
let humanMode = false; // 模拟鼠标模式开关（原 cursorStatus）

// 实例化引擎
const ghostCursor = new GhostCursor();
const uiMimic = new UIMimic();

// ESC 键取消
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (isProcessing) {
            cancelRequested = true;
            if (!stealthMode) showStatus('⏹ 已取消', 2000);
            ghostCursor.deactivate();
            isProcessing = false;
            console.log('[Sniper] 用户取消');
        }
    }
});

// 初始化
(async function init() {
    const result = await chrome.storage.local.get(['enabled', 'stealthMode', 'cursorStatus']);
    isEnabled = result.enabled !== false;
    stealthMode = result.stealthMode === true;
    humanMode = result.cursorStatus === true;

    // 注入 CSS（不管模式如何，都要准备好样式）
    ghostCursor.init();

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'TOGGLE') {
            isEnabled = request.enabled;
            console.log('[Sniper] 状态:', isEnabled ? '启用' : '关闭');
        }
        if (request.type === 'STEALTH_MODE') {
            stealthMode = request.stealthMode;
            console.log('[Sniper] 无痕模式:', stealthMode ? '开' : '关');
        }
        if (request.type === 'CURSOR_STATUS') {
            humanMode = request.cursorStatus;
            console.log('[Sniper] 模拟鼠标:', humanMode ? '开' : '关');
        }
    });

    document.addEventListener('dblclick', handleDoubleClick, false);
    console.log('[Canvas Sniper] 已加载');
})();

// ==================== 双击处理 ====================
async function handleDoubleClick(e) {
    if (!isEnabled || isProcessing) return;

    const question =
        e.target.closest("div.question[id^='question_']") ||
        e.target.closest("div[id^='question_']") ||
        e.target.closest(".question") ||
        e.target.closest(".question_holder");

    if (!question) return;

    window.getSelection()?.removeAllRanges();
    isProcessing = true;
    cancelRequested = false;

    const timings = {};
    const totalStart = performance.now();

    // 根据模式决定是否启动假光标
    if (humanMode) {
        ghostCursor.activate(e.clientX, e.clientY);
    }

    if (!stealthMode) showStatus('🔍 分析中... [ESC取消]');
    // 快速模式下不改变鼠标样式，安静地处理

    try {
        // 步骤 1: 检测题型
        let stepStart = performance.now();
        const questionType = detectQuestionType(question);
        timings['1. 检测题型'] = (performance.now() - stepStart).toFixed(1) + 'ms';
        console.log('[Sniper] 题目类型:', questionType);

        // 步骤 2: 截图
        stepStart = performance.now();
        const screenshot = await captureQuestion(question);
        timings['2. 截图'] = (performance.now() - stepStart).toFixed(1) + 'ms';

        // 步骤 3: 提取选项
        stepStart = performance.now();
        const dropdownOptions = [];
        question.querySelectorAll('select').forEach((select, idx) => {
            const options = Array.from(select.options)
                .map(o => o.text.trim())
                .filter(t => t && !t.toLowerCase().includes('select') && !t.toLowerCase().includes('choose'));
            dropdownOptions.push({
                dropdown: idx + 1,
                options: options
            });
        });

        // 提取选择题选项文本
        const choiceOptions = [];
        if (questionType === 'choice') {
            question.querySelectorAll('.answer').forEach((answer, idx) => {
                const label = String.fromCharCode(65 + idx);
                const text = (answer.querySelector('.answer_text')?.innerText ||
                              answer.querySelector('.answer_label')?.innerText ||
                              answer.innerText || '').trim();
                if (text) choiceOptions.push({ label, text });
            });
            console.log('[Sniper] 选择题选项:', choiceOptions.map(o => `${o.label}) ${o.text}`));
        }
        timings['3. 提取选项'] = (performance.now() - stepStart).toFixed(1) + 'ms';

        if (cancelRequested) { cleanup(); return; }

        // 步骤 4: 发送到 AI
        stepStart = performance.now();
        const response = await sendMessageWithRetry({
            type: 'PROCESS_QUESTION',
            data: {
                questionType,
                screenshot,
                questionText: question.innerText.substring(0, 1000),
                dropdownOptions: dropdownOptions,
                choiceOptions: choiceOptions
            }
        }, 3);
        timings['4. AI请求+响应'] = (performance.now() - stepStart).toFixed(1) + 'ms';

        if (cancelRequested) { cleanup(); return; }

        if (response && response.success && response.data && response.data.answers) {
            // 步骤 5: 填写答案
            stepStart = performance.now();

            if (humanMode) {
                // 模拟模式：假鼠标 + 拟人化操作
                await performHumanActions(question, questionType, response.data.answers);
            } else {
                // 快速模式：直接填充（旧版行为）
                fillAnswersFast(question, questionType, response.data.answers);
            }

            timings['5. 填写答案'] = (performance.now() - stepStart).toFixed(1) + 'ms';

            if (!stealthMode) showStatus('✅ 完成!', 2000);
        } else {
            const errMsg = response?.error || '获取答案失败';
            if (!stealthMode) showStatus('❌ ' + errMsg, 3000);
        }

        // 性能日志
        timings['总耗时'] = (performance.now() - totalStart).toFixed(1) + 'ms';
        console.log('========== ⏱️ 性能分析 ==========');
        for (const [step, time] of Object.entries(timings)) {
            console.log(`  ${step}: ${time}`);
        }
        console.log('==================================');

    } catch (error) {
        console.error('[Sniper] 错误:', error);
        if (!stealthMode && !cancelRequested) {
            showStatus('❌ 请求失败，请重试', 2000);
        }
    } finally {
        cleanup();
    }

    function cleanup() {
        if (humanMode) {
            ghostCursor.deactivate();
        }
        isProcessing = false;
    }
}

// ==================== 模拟模式：拟人化操作 ====================
async function performHumanActions(question, type, answers) {
    console.log('[Sniper] 开始拟人化操作...');

    const selects = Array.from(question.querySelectorAll('select'));
    const textInputs = Array.from(question.querySelectorAll('input[type="text"]'));
    const allBlanks = [];

    selects.forEach(el => allBlanks.push({
        type: 'select', el,
        pos: el.getBoundingClientRect().top * 10000 + el.getBoundingClientRect().left
    }));
    textInputs.forEach(el => allBlanks.push({
        type: 'text', el,
        pos: el.getBoundingClientRect().top * 10000 + el.getBoundingClientRect().left
    }));

    allBlanks.sort((a, b) => a.pos - b.pos);

    // === 简答题 ===
    if (type === 'essay') {
        const answer = answers[0] || '';
        console.log('[Sniper] 处理简答题, 答案长度:', answer.length);

        // 方法一：TinyMCE iframe 编辑器
        const iframe = question.querySelector('iframe[id*="_ifr"], iframe');
        if (iframe && iframe.contentDocument) {
            try {
                const editorBody = iframe.contentDocument.querySelector('body#tinymce') ||
                    iframe.contentDocument.body;
                if (editorBody) {
                    await ghostCursor.moveTo(iframe);
                    await ghostCursor.click();
                    editorBody.focus();

                    editorBody.innerHTML = '<p></p>';
                    const pTag = editorBody.querySelector('p') || editorBody;

                    await typeCharsHuman(pTag, answer, 'innerHTML', editorBody);

                    editorBody.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('[Sniper] Iframe 编辑器填写完成');
                    return;
                }
            } catch (e) {
                console.warn('[Sniper] Iframe 访问失败:', e.message);
            }
        }

        // 方法二：ContentEditable 编辑器
        const textBox = question.querySelector('[contenteditable="true"], [role="textbox"]');
        if (textBox) {
            await ghostCursor.moveTo(textBox);
            await ghostCursor.click();
            textBox.focus();

            const chars = answer.split('');
            for (let i = 0; i < chars.length; i++) {
                if (cancelRequested) return;
                await humanTypeDelay(i);
                document.execCommand('insertText', false, chars[i]);
            }

            textBox.dispatchEvent(new Event('input', { bubbles: true }));
            textBox.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('[Sniper] ContentEditable 编辑器填写完成');
            return;
        }

        console.warn('[Sniper] 未找到简答题编辑器');
        return;
    }

    // === 选择题（单选 + 多选） ===
    if (type === 'choice') {
        const answerLabels = answers.map(a => String(a).trim());
        const choices = question.querySelectorAll('.answer');
        for (let index = 0; index < choices.length; index++) {
            if (cancelRequested) return;
            const letter = String.fromCharCode(65 + index);
            const choiceText = (choices[index].querySelector('.answer_text')?.innerText ||
                                choices[index].querySelector('.answer_label')?.innerText ||
                                choices[index].innerText || '').trim();

            // 字母匹配 或 文本匹配
            let shouldSelect = answerLabels.some(a => a.toUpperCase() === letter);
            if (!shouldSelect && choiceText) {
                shouldSelect = answerLabels.some(a => {
                    const na = a.toLowerCase();
                    const nc = choiceText.toLowerCase();
                    return na.length > 1 && (nc.includes(na) || na.includes(nc));
                });
            }

            if (shouldSelect) {
                await ghostCursor.moveTo(choices[index]);
                await ghostCursor.click();
                const input = choices[index].querySelector('input');
                if (input && !input.checked) input.click();
                console.log('[Sniper] ✓ 选择:', letter, choiceText);
                await new Promise(r => setTimeout(r, Math.random() * 400 + 200));
            }
        }
        return;
    }

    // === 填空 / 下拉 / 混合题 ===
    for (let i = 0; i < Math.min(allBlanks.length, answers.length); i++) {
        if (cancelRequested) return;

        const blank = allBlanks[i];
        const answer = String(answers[i]).trim();

        await ghostCursor.moveTo(blank.el);
        await new Promise(r => setTimeout(r, 100));

        if (blank.type === 'select') {
            // 下拉题：假下拉框 + 模拟点击
            await ghostCursor.click();
            await uiMimic.openDropdown(blank.el);

            const targetOptionEl = uiMimic.findOptionElement(answer);

            if (targetOptionEl) {
                await ghostCursor.moveTo(targetOptionEl);
                await new Promise(r => setTimeout(r, 150));
                await ghostCursor.click();

                // 更新真实值
                const realSelect = blank.el;
                for (const opt of realSelect.options) {
                    const normalizedOpt = normalizeText(opt.text);
                    const normalizedAns = normalizeText(answer);
                    if (normalizedOpt.includes(normalizedAns) || normalizedAns.includes(normalizedOpt)) {
                        realSelect.value = opt.value;
                        realSelect.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log('[Sniper] ✓ 选择:', opt.text);
                        break;
                    }
                }
            } else {
                console.warn('[Sniper] ✗ 找不到匹配选项:', answer);
            }

            await uiMimic.closeDropdown();

        } else {
            // 填空题：逐字输入
            await ghostCursor.click();
            blank.el.focus();
            blank.el.value = '';

            const chars = answer.split('');
            for (let j = 0; j < chars.length; j++) {
                if (cancelRequested) return;
                const char = chars[j];

                await humanTypeDelay(j);

                // 模拟完整键盘事件链
                blank.el.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
                blank.el.dispatchEvent(new KeyboardEvent('keypress', { key: char, bubbles: true }));
                blank.el.value += char;
                blank.el.dispatchEvent(new Event('input', { bubbles: true }));
                blank.el.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
            }

            await new Promise(r => setTimeout(r, Math.random() * 500 + 500));
            blank.el.blur();
            blank.el.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('[Sniper] 填入:', answer);
        }

        // 题与题之间间隔
        await new Promise(r => setTimeout(r, Math.random() * 1000 + 1500));
    }
}

// 人类打字延迟（含偶尔打错字）
async function humanTypeDelay(charIndex) {
    let delay = Math.random() * 150 + 100;

    // 5% 概率思考停顿
    if (Math.random() < 0.05) {
        delay += Math.random() * 1000 + 500;
    }

    await new Promise(r => setTimeout(r, delay));
}

// 逐字输入到 innerHTML 元素
async function typeCharsHuman(targetEl, text, prop, dispatchTarget) {
    const chars = text.split('');
    for (let i = 0; i < chars.length; i++) {
        if (cancelRequested) return;
        await humanTypeDelay(i);
        targetEl.textContent += chars[i];
        if (dispatchTarget) dispatchTarget.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// ==================== 快速模式：直接填充（旧版行为） ====================
function fillAnswersFast(question, type, answers) {
    if (!answers || answers.length === 0) return;

    const selects = Array.from(question.querySelectorAll('select'));
    const textInputs = Array.from(question.querySelectorAll('input[type="text"]'));

    const allBlanks = [];
    selects.forEach(el => allBlanks.push({
        type: 'select', el,
        pos: el.getBoundingClientRect().top * 10000 + el.getBoundingClientRect().left
    }));
    textInputs.forEach(el => allBlanks.push({
        type: 'text', el,
        pos: el.getBoundingClientRect().top * 10000 + el.getBoundingClientRect().left
    }));
    allBlanks.sort((a, b) => a.pos - b.pos);

    console.log('[Sniper] 快速模式 - 空白总数:', allBlanks.length, '答案数:', answers.length);

    // === 简答题快速填写 ===
    if (type === 'essay') {
        const answer = answers[0] || '';

        const iframe = question.querySelector('iframe[id*="_ifr"], iframe');
        if (iframe && iframe.contentDocument) {
            try {
                const editorBody = iframe.contentDocument.querySelector('body#tinymce') ||
                    iframe.contentDocument.body;
                if (editorBody) {
                    editorBody.innerHTML = `<p>${answer}</p>`;
                    editorBody.dispatchEvent(new Event('input', { bubbles: true }));
                    editorBody.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('[Sniper] 快速填写 Iframe 编辑器完成');
                    return;
                }
            } catch (e) {
                console.warn('[Sniper] Iframe 访问失败:', e.message);
            }
        }

        const textBox = question.querySelector('[contenteditable="true"], [role="textbox"]');
        if (textBox) {
            textBox.focus();
            textBox.innerHTML = answer;
            textBox.dispatchEvent(new Event('input', { bubbles: true }));
            textBox.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('[Sniper] 快速填写 ContentEditable 完成');
            return;
        }

        console.warn('[Sniper] 未找到简答题编辑器');
        return;
    }

    // === 填空 / 下拉 / 混合题快速填写 ===
    for (let i = 0; i < Math.min(allBlanks.length, answers.length); i++) {
        const blank = allBlanks[i];
        const answer = String(answers[i]).trim();

        if (blank.type === 'select') {
            const select = blank.el;
            let found = false;

            for (const option of select.options) {
                const optText = option.text.trim().toLowerCase();
                if (!optText || optText.includes('select') || optText.includes('choose')) continue;

                const normalizedOpt = normalizeText(option.text);
                const normalizedAns = normalizeText(answer);

                if (normalizedOpt.includes(normalizedAns) || normalizedAns.includes(normalizedOpt)) {
                    select.value = option.value;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('[Sniper] ✓ 选择:', option.text);
                    found = true;
                    break;
                }
            }

            if (!found) console.log('[Sniper] ✗ 未匹配:', answer);
        } else {
            const input = blank.el;
            input.value = answer;
            input.setAttribute('value', answer);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('[Sniper] 填入:', answer);
        }
    }

    // === 选择题（单选 + 多选） ===
    if (type === 'choice') {
        const answerLabels = answers.map(a => String(a).trim());
        const choices = question.querySelectorAll('.answer');
        choices.forEach((choice, index) => {
            const letter = String.fromCharCode(65 + index);
            const choiceText = (choice.querySelector('.answer_text')?.innerText ||
                                choice.querySelector('.answer_label')?.innerText ||
                                choice.innerText || '').trim();

            // 字母匹配 或 文本匹配
            let shouldSelect = answerLabels.some(a => a.toUpperCase() === letter);
            if (!shouldSelect && choiceText) {
                shouldSelect = answerLabels.some(a => {
                    const na = a.toLowerCase();
                    const nc = choiceText.toLowerCase();
                    return na.length > 1 && (nc.includes(na) || na.includes(nc));
                });
            }

            if (shouldSelect) {
                const input = choice.querySelector('input');
                if (input && !input.checked) input.click();
                console.log('[Sniper] ✓ 选择:', letter, choiceText);
            }
        });
    }
}

// ==================== 工具函数 ====================

// 带重试的消息发送
async function sendMessageWithRetry(message, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (cancelRequested) throw new Error('已取消');
        try {
            const response = await chrome.runtime.sendMessage(message);
            return response;
        } catch (e) {
            console.log(`[Sniper] 发送失败 (${attempt + 1}/${maxRetries}):`, e.message);
            if (attempt < maxRetries - 1 && !cancelRequested) {
                if (!stealthMode) showStatus(`🔄 重试中... (${attempt + 2}/${maxRetries}) [ESC取消]`);
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }
    throw new Error('消息发送失败');
}

// 检测题目类型
function detectQuestionType(question) {
    // 简答题检测（优先级最高）
    const isEssay = question.classList.contains('essay_question') ||
        question.querySelector('[data-automation="essay-question"]') !== null ||
        question.matches('[data-automation="essay-question"]');

    if (isEssay) {
        console.log('[Sniper] 检测到: 简答题');
        return 'essay';
    }

    const hasDropdown = question.querySelector('select') !== null;
    const hasText = question.querySelector('input[type="text"]') !== null;
    const hasChoice = question.querySelector('input[type="radio"], input[type="checkbox"]') !== null;

    const dropdownCount = question.querySelectorAll('select').length;
    const textCount = question.querySelectorAll('input[type="text"]').length;

    console.log('[Sniper] 检测到:', dropdownCount, '个下拉框,', textCount, '个填空');

    if (hasDropdown && hasText) return 'mixed';
    if (hasDropdown) return 'dropdown';
    if (hasText) return 'text';
    if (hasChoice) return 'choice';
    return 'unknown';
}

// 截图
async function captureQuestion(question) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'CAPTURE_TAB' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('[Sniper Content] Runtime Error:', chrome.runtime.lastError);
                resolve('');
                return;
            }
            if (response && response.error) {
                console.error('[Sniper Content] Screenshot Error:', response.error);
                resolve('');
                return;
            }
            if (response && response.dataUrl) {
                resolve(response.dataUrl.split(',')[1]);
            } else {
                console.error('[Sniper Content] No dataUrl received');
                resolve('');
            }
        });
    });
}

// 标准化文本（用于匹配 AI 答案和下拉选项）
function normalizeText(text) {
    return text
        .replace(/\b1\/2\b/g, 'half')
        .replace(/\b1\/4\b/g, 'one out of four')
        .replace(/\b3\/4\b/g, 'three out of four')
        .replace(/\b0\b/g, 'none zero')
        .replace(/\bIII\b/gi, '3')
        .replace(/\bII\b/gi, '2')
        .replace(/\bI\b/gi, '1')
        .toLowerCase()
        .trim();
}

// 显示状态提示
function showStatus(message, duration = 0) {
    let status = document.getElementById('sniper-status');
    if (!status) {
        status = document.createElement('div');
        status.id = 'sniper-status';
        status.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            padding: 12px 20px; background: rgba(0,0,0,0.8);
            color: white; border-radius: 8px; font-size: 14px;
            z-index: 2147483647; font-family: -apple-system, sans-serif;
            pointer-events: none;
        `;
        document.body.appendChild(status);
    }
    status.textContent = message;
    status.style.display = 'block';
    if (duration > 0) setTimeout(() => status.style.display = 'none', duration);
}

// 系统加载光标（快速模式下使用）
let originalCursor = '';

function showCursorLoader() {
    originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'wait';
    const style = document.createElement('style');
    style.id = 'sniper-wait-cursor';
    style.textContent = '* { cursor: wait !important; }';
    document.head.appendChild(style);
}

function hideCursorLoader() {
    document.body.style.cursor = originalCursor;
    const style = document.getElementById('sniper-wait-cursor');
    if (style) style.remove();
}
