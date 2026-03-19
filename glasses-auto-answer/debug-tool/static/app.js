const state = {
  imageName: "",
  imageMimeType: "",
  imageBase64: "",
  audioUrl: "",
  defaults: null,
};

const elements = {
  imageInput: document.querySelector("#imageInput"),
  dropzone: document.querySelector("#dropzone"),
  previewImage: document.querySelector("#previewImage"),
  previewEmpty: document.querySelector("#previewEmpty"),
  imageName: document.querySelector("#imageName"),
  imageMeta: document.querySelector("#imageMeta"),
  promptInput: document.querySelector("#promptInput"),
  promptStats: document.querySelector("#promptStats"),
  geminiButton: document.querySelector("#geminiButton"),
  outputInput: document.querySelector("#outputInput"),
  outputStats: document.querySelector("#outputStats"),
  copyOutputButton: document.querySelector("#copyOutputButton"),
  geminiStatus: document.querySelector("#geminiStatus"),
  ttsInput: document.querySelector("#ttsInput"),
  ttsStats: document.querySelector("#ttsStats"),
  ttsButton: document.querySelector("#ttsButton"),
  exportButton: document.querySelector("#exportButton"),
  audioPlayer: document.querySelector("#audioPlayer"),
  ttsStatus: document.querySelector("#ttsStatus"),
  globalStatus: document.querySelector("#globalStatus"),
  geminiModelLabel: document.querySelector("#geminiModelLabel"),
  ttsModelLabel: document.querySelector("#ttsModelLabel"),
  voiceLabel: document.querySelector("#voiceLabel"),
  resetPromptButton: document.querySelector("#resetPromptButton"),
  resetTtsButton: document.querySelector("#resetTtsButton"),
};

function updateCount(target, value) {
  target.textContent = `${value.trim().length} 字`;
}

function setStatus(message) {
  elements.globalStatus.textContent = message;
}

function setBusy(button, busy, label) {
  button.disabled = busy;
  if (label) {
    button.textContent = busy ? `${label}中...` : label;
  }
}

function revokeAudioUrl() {
  if (state.audioUrl) {
    URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = "";
  }
}

async function loadDefaults() {
  const response = await fetch("/api/defaults");
  if (!response.ok) {
    throw new Error("默认配置加载失败");
  }
  state.defaults = await response.json();
  elements.promptInput.value = state.defaults.geminiPrompt;
  elements.ttsInput.value = state.defaults.ttsInstructions;
  elements.geminiModelLabel.textContent = state.defaults.geminiModel;
  elements.ttsModelLabel.textContent = state.defaults.ttsModel;
  elements.voiceLabel.textContent = state.defaults.ttsVoice;
  updateCount(elements.promptStats, elements.promptInput.value);
  updateCount(elements.ttsStats, elements.ttsInput.value);
  updateCount(elements.outputStats, elements.outputInput.value);
}

function applySelectedFile(file) {
  if (!file) return;
  state.imageName = file.name;
  state.imageMimeType = file.type || "image/jpeg";
  elements.imageName.textContent = file.name;
  elements.imageMeta.textContent = `${state.imageMimeType} · ${(file.size / 1024 / 1024).toFixed(2)} MB`;

  const reader = new FileReader();
  reader.onload = () => {
    const result = String(reader.result || "");
    const commaIndex = result.indexOf(",");
    state.imageBase64 = commaIndex >= 0 ? result.slice(commaIndex + 1) : "";
    elements.previewImage.src = result;
    elements.previewImage.hidden = false;
    elements.previewEmpty.hidden = true;
    setStatus(`已加载图片：${file.name}`);
  };
  reader.readAsDataURL(file);
}

async function runGemini() {
  if (!state.imageBase64) {
    window.alert("请先选择一张图片。");
    return;
  }

  setBusy(elements.geminiButton, true, "发送到 Gemini");
  elements.geminiStatus.textContent = "Gemini 请求中";
  setStatus("正在把图片和 Prompt 发送到 Gemini...");

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: elements.promptInput.value,
        imageBase64: state.imageBase64,
        imageMimeType: state.imageMimeType,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.detail || payload.error || "Gemini 请求失败");
    }

    elements.outputInput.value = payload.text || "";
    updateCount(elements.outputStats, elements.outputInput.value);
    elements.geminiStatus.textContent = "Gemini 完成";
    setStatus("Gemini 已返回结果，可以继续试听 TTS。");
  } catch (error) {
    elements.geminiStatus.textContent = "Gemini 失败";
    setStatus("Gemini 请求失败");
    window.alert(error.message);
  } finally {
    setBusy(elements.geminiButton, false, "发送到 Gemini");
  }
}

async function runTts() {
  const text = elements.outputInput.value.trim();
  if (!text) {
    window.alert("没有可朗读的文本。");
    return;
  }

  setBusy(elements.ttsButton, true, "播放 TTS");
  elements.ttsStatus.textContent = "生成音频中";
  setStatus("正在向 OpenAI TTS 生成音频...");

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        instructions: elements.ttsInput.value,
      }),
    });

    const contentType = response.headers.get("Content-Type") || "";
    if (!response.ok || contentType.includes("application/json")) {
      const payload = await response.json();
      throw new Error(payload.detail || payload.error || "TTS 请求失败");
    }

    const blob = await response.blob();
    revokeAudioUrl();
    state.audioUrl = URL.createObjectURL(blob);
    elements.audioPlayer.src = state.audioUrl;
    elements.audioPlayer.play().catch(() => {});
    elements.ttsStatus.textContent = "音频已生成";
    setStatus("TTS 音频已准备好。");
  } catch (error) {
    elements.ttsStatus.textContent = "TTS 失败";
    setStatus("TTS 请求失败");
    window.alert(error.message);
  } finally {
    setBusy(elements.ttsButton, false, "播放 TTS");
  }
}

async function exportScripts() {
  setBusy(elements.exportButton, true, "导出脚本");
  setStatus("正在打包 Android shell 脚本...");

  try {
    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: elements.promptInput.value,
        instructions: elements.ttsInput.value,
      }),
    });

    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.detail || payload.error || "导出失败");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "study-dictation-scripts.zip";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("脚本已导出为 ZIP 文件。");
  } catch (error) {
    setStatus("导出失败");
    window.alert(error.message);
  } finally {
    setBusy(elements.exportButton, false, "导出脚本");
  }
}

async function copyOutput() {
  const text = elements.outputInput.value;
  if (!text.trim()) {
    window.alert("没有可复制的文本。");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Gemini 输出已复制。");
  } catch (error) {
    window.alert("复制失败，请检查浏览器权限。");
  }
}

function bindEvents() {
  elements.imageInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    applySelectedFile(file);
  });

  elements.dropzone.addEventListener("click", () => elements.imageInput.click());

  ["dragenter", "dragover"].forEach((eventName) => {
    elements.dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    elements.dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropzone.classList.remove("dragover");
    });
  });

  elements.dropzone.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];
    applySelectedFile(file);
  });

  elements.promptInput.addEventListener("input", () => {
    updateCount(elements.promptStats, elements.promptInput.value);
  });

  elements.ttsInput.addEventListener("input", () => {
    updateCount(elements.ttsStats, elements.ttsInput.value);
  });

  elements.outputInput.addEventListener("input", () => {
    updateCount(elements.outputStats, elements.outputInput.value);
  });

  elements.geminiButton.addEventListener("click", runGemini);
  elements.ttsButton.addEventListener("click", runTts);
  elements.exportButton.addEventListener("click", exportScripts);
  elements.copyOutputButton.addEventListener("click", copyOutput);

  elements.resetPromptButton.addEventListener("click", () => {
    if (!state.defaults) return;
    elements.promptInput.value = state.defaults.geminiPrompt;
    updateCount(elements.promptStats, elements.promptInput.value);
    setStatus("Gemini Prompt 已恢复默认。");
  });

  elements.resetTtsButton.addEventListener("click", () => {
    if (!state.defaults) return;
    elements.ttsInput.value = state.defaults.ttsInstructions;
    updateCount(elements.ttsStats, elements.ttsInput.value);
    setStatus("TTS Instructions 已恢复默认。");
  });
}

async function init() {
  bindEvents();
  try {
    await loadDefaults();
    setStatus("准备就绪");
  } catch (error) {
    setStatus("初始化失败");
    window.alert(error.message);
  }
}

window.addEventListener("beforeunload", revokeAudioUrl);
init();
