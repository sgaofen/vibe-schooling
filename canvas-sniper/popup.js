// 加载保存的状态
document.addEventListener('DOMContentLoaded', async () => {
    const enableToggle = document.getElementById('enableToggle');
    const stealthToggle = document.getElementById('stealthToggle');
    const cursorToggle = document.getElementById('cursorToggle');
    const status = document.getElementById('status');

    // 获取保存的状态
    const result = await chrome.storage.local.get(['enabled', 'stealthMode', 'cursorStatus']);
    const enabled = result.enabled !== false;
    const stealthMode = result.stealthMode === true;
    const cursorStatus = result.cursorStatus === true;

    enableToggle.checked = enabled;
    stealthToggle.checked = stealthMode;
    cursorToggle.checked = cursorStatus;
    updateStatus(enabled);

    // 通用函数：发送消息到所有 Canvas 页面
    async function notifyTabs(message) {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            if (tab.url && (tab.url.includes('instructure.com') || tab.url.includes('canvas') || tab.url.includes('.edu'))) {
                chrome.tabs.sendMessage(tab.id, message).catch(() => { });
            }
        }
    }

    // 启用开关
    enableToggle.addEventListener('change', async () => {
        const enabled = enableToggle.checked;
        await chrome.storage.local.set({ enabled });
        updateStatus(enabled);
        notifyTabs({ type: 'TOGGLE', enabled });
    });

    // 无痕模式开关
    stealthToggle.addEventListener('change', async () => {
        const stealthMode = stealthToggle.checked;
        await chrome.storage.local.set({ stealthMode });
        notifyTabs({ type: 'STEALTH_MODE', stealthMode });
    });

    // 模拟鼠标开关
    cursorToggle.addEventListener('change', async () => {
        const cursorStatus = cursorToggle.checked;
        await chrome.storage.local.set({ cursorStatus });
        notifyTabs({ type: 'CURSOR_STATUS', cursorStatus });
    });

    function updateStatus(enabled) {
        status.textContent = enabled ? '✅ 双击题目作答' : '❌ 已关闭';
        status.className = 'status' + (enabled ? ' on' : '');
    }

    // 帮助按钮
    document.getElementById('helpBtn').addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('help.html') });
    });
});
