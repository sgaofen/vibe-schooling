// ============================================================
// Canvas Sniper - Background Service Worker
// ============================================================

// 在这里粘贴你的 Gemini API Key（参考 README 获取方法）
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
const MODEL_NAME = "gemini-3-flash-preview";

// ==================== CDP Real Mouse Control ====================
let attachedTabs = new Set();

// 统一消息监听器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Sniper BG] 收到消息:', request.type);

    // 处理题目请求
    if (request.type === 'PROCESS_QUESTION') {
        console.log('[Sniper BG] 处理题目请求...');
        const bgStart = performance.now();

        handleQuestion(request.data, sender.tab.id)
            .then(result => {
                const bgTime = (performance.now() - bgStart).toFixed(1);
                console.log(`[Sniper BG] 处理成功 (后台总耗时: ${bgTime}ms):`, result);
                sendResponse({ success: true, data: result, bgTime: bgTime });
            })
            .catch(error => {
                console.error('[Sniper BG] 处理失败:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    // 截图请求
    if (request.type === 'CAPTURE_TAB') {
        const windowId = sender.tab ? sender.tab.windowId : null;
        console.log('[Sniper BG] 截图请求, windowId:', windowId);

        chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                console.error('[Sniper BG] 截图失败:', chrome.runtime.lastError.message);
                sendResponse({ error: chrome.runtime.lastError.message });
            } else if (!dataUrl) {
                console.error('[Sniper BG] 截图为空');
                sendResponse({ error: 'Screenshot is empty' });
            } else {
                console.log('[Sniper BG] 截图成功, 长度:', dataUrl.length);
                sendResponse({ dataUrl });
            }
        });
        return true;
    }

    // CDP 鼠标移动
    if (request.type === 'CDP_MOUSE_MOVE') {
        handleCDPMouseMove(sender.tab.id, request.x, request.y)
            .then(() => sendResponse({ success: true }))
            .catch(err => sendResponse({ error: err.message }));
        return true;
    }

    // CDP 鼠标点击
    if (request.type === 'CDP_MOUSE_CLICK') {
        handleCDPMouseClick(sender.tab.id, request.x, request.y)
            .then(() => sendResponse({ success: true }))
            .catch(err => sendResponse({ error: err.message }));
        return true;
    }
});

// 处理题目
async function handleQuestion(data, tabId) {
    const { questionType, screenshot, questionText, dropdownOptions, choiceOptions } = data;

    if (!screenshot) {
        throw new Error('Screenshot data is missing or failed to capture');
    }

    let prompt = '';

    // 所有题型都带上题目文本，帮助 AI 在多题截图中定位正确的题目
    const questionContext = questionText
        ? `\nTARGET QUESTION: "${questionText.substring(0, 500)}"\nThe screenshot may show multiple questions. ONLY answer the target question above.\n`
        : '';

    if (questionType === 'dropdown') {
        let optionsText = '';
        if (dropdownOptions && dropdownOptions.length > 0) {
            optionsText = '\n\nAVAILABLE OPTIONS FOR EACH DROPDOWN:\n';
            dropdownOptions.forEach(d => {
                optionsText += `Dropdown ${d.dropdown}: ${d.options.join(' | ')}\n`;
            });
        }

        prompt = `This is a quiz question. Read the question and select the correct answer for each dropdown.
${questionContext}${optionsText}
INSTRUCTIONS:
1. For each dropdown, choose ONE option from the list above
2. Your answer must be EXACTLY one of the options listed - copy it character for character
3. Answer in order: Dropdown 1, Dropdown 2, etc.

OUTPUT FORMAT (JSON only):
{"answers": ["answer for dropdown 1", "answer for dropdown 2", ...]}`;
    } else if (questionType === 'text') {
        prompt = `You are an educational tutor. Look at this fill-in-the-blank question screenshot.
${questionContext}
IMPORTANT INSTRUCTIONS:
1. Count how many blank input fields are visible in the question
2. Provide the correct answer for EACH blank, in order from left to right or top to bottom
3. Keep answers SHORT - usually 1-3 words per blank
4. If a blank expects a number, provide just the number

Return ONLY a JSON object with ALL answers:
{"answers": ["answer1", "answer2", "answer3", ...]}

You MUST provide an answer for every blank. Do not skip any.`;
    } else if (questionType === 'mixed') {
        prompt = `You are an educational tutor. Look at this quiz question screenshot.
${questionContext}
This question has BOTH dropdown menus AND text input blanks.

IMPORTANT INSTRUCTIONS:
1. Count ALL blanks (both dropdowns and text inputs) from top to bottom, left to right
2. For dropdowns: choose the correct option from the available choices
3. For text inputs: provide the correct text answer
4. Provide answers IN ORDER of how blanks appear in the question

Return ONLY a JSON object with ALL answers in order:
{"answers": ["answer1", "answer2", "answer3", "answer4", ...]}

You MUST provide an answer for EVERY blank. Do not skip any.`;
    } else if (questionType === 'essay') {
        prompt = `You are an educational tutor. Look at this essay/short-answer question screenshot.
${questionContext}
IMPORTANT INSTRUCTIONS:
1. This is a reflective or essay question requiring a thoughtful paragraph response
2. Write a well-structured, complete answer that addresses the question
3. Keep the response concise but comprehensive (2-4 sentences typically)
4. Use proper grammar and academic language
5. Be specific and provide examples when relevant

Return ONLY a JSON object with your answer:
{"answers": ["Your complete essay/short-answer response here"]}

Write a thoughtful, complete response that would earn full points.`;
    } else {
        // choice question
        let optionsText = '';
        if (choiceOptions && choiceOptions.length > 0) {
            optionsText = '\nAVAILABLE OPTIONS:\n';
            choiceOptions.forEach(o => {
                optionsText += `${o.label}) ${o.text}\n`;
            });
        }

        prompt = `You are an educational tutor. Look at this multiple choice question.
${questionContext}${optionsText}
Identify the correct answer option(s) by their letter (A, B, C, D...).

Return ONLY a JSON object: {"answers": ["A"]} or {"answers": ["A", "C"]} for multiple correct answers.`;
    }

    // 调用 Gemini API（带重试）
    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await callGeminiAPI(prompt, screenshot);
            return response;
        } catch (e) {
            lastError = e;
            console.log(`[Sniper BG] 尝试 ${attempt + 1} 失败:`, e.message);
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }
    throw lastError;
}

// 调用 Gemini API
async function callGeminiAPI(prompt, imageBase64) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    console.log('[Sniper BG] 调用API, 模型:', MODEL_NAME);
    console.log('[Sniper BG] 图片Base64长度:', (imageBase64?.length / 1024).toFixed(1), 'KB');

    let stepStart = performance.now();
    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: "image/png",
                        data: imageBase64
                    }
                }
            ]
        }],
        generationConfig: {
            temperature: 0,
            maxOutputTokens: 8192,
            thinkingConfig: {
                thinkingLevel: "high"
            }
        },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
    };
    const bodyStr = JSON.stringify(requestBody);
    console.log('[Sniper BG] 请求体大小:', (bodyStr.length / 1024).toFixed(1), 'KB, 构建耗时:', (performance.now() - stepStart).toFixed(1), 'ms');

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 70000);

        stepStart = performance.now();
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: bodyStr,
            signal: controller.signal
        });
        const networkTime = (performance.now() - stepStart).toFixed(1);

        clearTimeout(timeout);

        console.log('[Sniper BG] API响应状态:', response.status, ', 网络耗时:', networkTime, 'ms');

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Sniper BG] API错误:', errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        stepStart = performance.now();
        const result = await response.json();
        console.log('[Sniper BG] JSON解析耗时:', (performance.now() - stepStart).toFixed(1), 'ms');
        console.log('[Sniper BG] API返回:', JSON.stringify(result).substring(0, 200));

        if (!result.candidates || !result.candidates[0]) {
            console.error('[Sniper BG] 无候选结果:', result);
            throw new Error('No response from API');
        }

        // 直接取回复文本（无 thinkingConfig，响应只有一个 text part）
        let text = result.candidates[0].content.parts[0].text;
        console.log('[Sniper BG] 原始回复:', text);

        // 清理 Markdown 代码块
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // 解析 JSON
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.error('JSON parse error:', e);
        }

        return { answers: [], raw: text };
    } catch (e) {
        console.error('[Sniper BG] API调用失败:', e);
        throw e;
    }
}

// ==================== CDP Mouse Functions ====================

async function ensureDebuggerAttached(tabId) {
    if (attachedTabs.has(tabId)) return;
    try {
        await chrome.debugger.attach({ tabId }, "1.3");
        attachedTabs.add(tabId);
        chrome.debugger.onDetach.addListener((source) => {
            if (source.tabId === tabId) attachedTabs.delete(tabId);
        });
        console.log(`[Sniper BG] Debugger attached to tab ${tabId}`);
    } catch (e) {
        if (e.message.includes("Already attached")) {
            attachedTabs.add(tabId);
        } else {
            console.error("[Sniper BG] Failed to attach debugger:", e);
            throw e;
        }
    }
}

async function handleCDPMouseMove(tabId, x, y) {
    await ensureDebuggerAttached(tabId);
    try {
        await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", {
            type: "mouseMoved",
            x: Math.round(x),
            y: Math.round(y)
        });
    } catch (e) {
        console.error("CDP Move Failed:", e);
    }
}

async function handleCDPMouseClick(tabId, x, y) {
    await ensureDebuggerAttached(tabId);
    try {
        await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", {
            type: "mousePressed",
            x: Math.round(x),
            y: Math.round(y),
            button: "left",
            clickCount: 1
        });
        await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", {
            type: "mouseReleased",
            x: Math.round(x),
            y: Math.round(y),
            button: "left",
            clickCount: 1
        });
    } catch (e) {
        console.error("CDP Click Failed:", e);
    }
}

// 初始化
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ enabled: true });
    console.log('Canvas Sniper installed!');
});
