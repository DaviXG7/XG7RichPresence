let ipcRenderer;
try {
  ({ ipcRenderer } = require("electron"));
} catch {
  if (window.electron && window.electron.ipc) ipcRenderer = window.electron.ipc;
  else {
    ipcRenderer = { send() {}, on() {}, removeAllListeners() {} };
  }
}

// Elements
const elements = {
  id: document.getElementById("presence-id"),
  type: document.getElementById("presence-type"),
  details: document.getElementById("presence-details"),
  state: document.getElementById("state"),
  partySize: document.getElementById("party-size"),
  partyMax: document.getElementById("party-max"),
  largeImageKey: document.getElementById("large-image-key"),
  largeImageText: document.getElementById("large-image-text"),
  smallImageKey: document.getElementById("small-image-key"),
  smallImageText: document.getElementById("small-image-text"),
  button1Label: document.getElementById("button1-label"),
  button1URL: document.getElementById("button1-url"),
  button2Label: document.getElementById("button2-label"),
  button2URL: document.getElementById("button2-url"),
};

const presenceElements = {
  largeImage: document.getElementById("large-image"),
  smallImage: document.getElementById("small-image"),
  activityText: document.getElementById("presence-activity"),
  detailsText: document.getElementById("presence-details-text"),
  stateText: document.getElementById("presence-state-text"),
  largeImageText: document.getElementById("presence-large-image-text"),
  timer: document.getElementById("presence-timer"),
  members: document.getElementById("presence-members"),
  button1: document.getElementById("presence-button-1"),
  button2: document.getElementById("presence-button-2"),
  clientStatus: document.getElementById("client-status"),
  messageLabel: document.getElementById("message"),
};

// State
const presenceState = {
  id: "",
  type: 0,
  details: "",
  state: "",
  partySize: 0,
  partyMax: 0,
  largeImageKey: "",
  largeImageText: "",
  smallImageKey: "",
  smallImageText: "",
  startTimestamp: 0,
  button1Label: "",
  button1URL: "",
  button2Label: "",
  button2URL: "",
};

let previewStartTime = Date.now();

// Utils
function isHttpUrl(u) {
  try {
    const x = new URL(u);
    return x.protocol === "http:" || x.protocol === "https:";
  } catch {
    return false;
  }
}
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}
function showMsg(text, ok = true) {
  const el = presenceElements.messageLabel;
  el.classList.remove("hidden");
  el.textContent = text;
  el.className = `mt-2 text-sm text-center ${
    ok ? "text-emerald-400" : "text-rose-400"
  }`;
  setTimeout(() => el.classList.add("hidden"), 3500);
}

// Timer
function updateTimerDisplay() {
  const elapsed = Math.floor((Date.now() - previewStartTime) / 1000);
  presenceElements.timer.innerText = formatTime(elapsed);
}
setInterval(updateTimerDisplay, 1000);

// Counters
const detailsCount = document.getElementById("details-count");
const stateCount = document.getElementById("state-count");
function updateCounters() {
  if (detailsCount)
    detailsCount.textContent = `${elements.details.value.length}/128`;
  if (stateCount) stateCount.textContent = `${elements.state.value.length}/128`;
}

// Update view
function updateDisplay() {
  const typeTextMap = {
    0: "Playing",
    2: "Listening",
    3: "Watching",
    5: "Competing in",
  };
  const typeValue = parseInt(elements.type.value || "0", 10);
  const typeTitle = typeTextMap[typeValue] || "Playing";

  presenceElements.activityText.innerText = typeTitle;
  // Header info
  if (elements.id.value) {
    presenceElements.clientStatus.textContent = `Client: ${elements.id.value}`;
    presenceElements.clientStatus.style.borderColor = "#7c3aed";
    presenceElements.clientStatus.style.color = "#c4b5fd";
  }

  if (typeValue === 0) {
    // PLAYING: Details vira "Application Name" na sua UI,
    // e o State + party aparecem abaixo, como no seu mock
    presenceElements.detailsText.innerText = "Application Name";
    presenceElements.stateText.innerText = presenceState.details;

    // Large text: usa o state quando não há party, senão mostra members
    presenceElements.largeImageText.innerText = presenceState.state;

    if (
      (presenceState.partySize || 0) > 0 ||
      (presenceState.partyMax || 0) > 0
    ) {
      presenceElements.members.innerText = `${presenceState.state} (${presenceState.partySize} of ${presenceState.partyMax})`;
      presenceElements.members.classList.remove("hidden");
      presenceElements.largeImageText.classList.add("hidden");
    } else {
      presenceElements.members.classList.add("hidden");
      presenceElements.largeImageText.classList.remove("hidden");
    }
  } else {
    // Outros tipos: mostra details/state diretamente
      presenceElements.activityText.innerText = `${typeTitle} Application Name`;
    presenceElements.detailsText.innerText = presenceState.details;
    presenceElements.stateText.innerText = presenceState.state;
    presenceElements.largeImageText.innerText =
      presenceState.largeImageText || "";
    presenceElements.members.classList.add("hidden");
    presenceElements.largeImageText.classList.remove("hidden");
  }

  // Imagens: se for URL, usa; se não, placeholder
  presenceElements.largeImage.src = isHttpUrl(presenceState.largeImageKey)
    ? presenceState.largeImageKey
    : "https://placehold.co/512x512?text=1024×1024";

  presenceElements.smallImage.src = isHttpUrl(presenceState.smallImageKey)
    ? presenceState.smallImageKey
    : "https://placehold.co/256x256?text=512×512";

  // Botões
  if (presenceState.button1Label && presenceState.button1URL) {
    presenceElements.button1.classList.remove("hidden");
    presenceElements.button1.innerText = presenceState.button1Label;
    presenceElements.button1.href = presenceState.button1URL;
  } else presenceElements.button1.classList.add("hidden");

  if (presenceState.button2Label && presenceState.button2URL) {
    presenceElements.button2.classList.remove("hidden");
    presenceElements.button2.innerText = presenceState.button2Label;
    presenceElements.button2.href = presenceState.button2URL;
  } else presenceElements.button2.classList.add("hidden");

  updateCounters();
  updateTimerDisplay();
}

function updateState(updates) {
  Object.assign(presenceState, updates);
  updateDisplay();
}

// Inputs listeners
Object.keys(elements).forEach((key) => {
  if (key === "type") return;
  elements[key]?.addEventListener("input", () => {
    let value = elements[key].value;

    if (key === "partySize" || key === "partyMax") {
      value = parseInt(value) || 0;
      // validação visual rápida
      const ps = parseInt(elements.partySize.value || "0", 10);
      const pm = parseInt(elements.partyMax.value || "0", 10);
      if (ps && pm && ps > pm)
        showMsg("PartySize não pode ser maior que PartyMax", false);
    }
    updateState({ [key]: value });
  });
});

elements.type.addEventListener("change", () => {
  updateState({ type: parseInt(elements.type.value) });
});

// Preview inicial
updateDisplay();

// Buttons (IPC)
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const updateBtn = document.getElementById("update-btn");
const saveBtn = document.getElementById("save-btn");

connectBtn.addEventListener("click", () => {
  // validações rápidas no client
  const detailsOk =
    presenceState.details &&
    presenceState.details.length >= 2 &&
    presenceState.details.length <= 128;
  const stateOk =
    presenceState.state &&
    presenceState.state.length >= 2 &&
    presenceState.state.length <= 128;
  if (!elements.id.value) return showMsg("Client ID ausente.", false);
  if (!detailsOk) return showMsg("Details deve ter 2–128 caracteres.", false);
  if (!stateOk) return showMsg("State deve ter 2–128 caracteres.", false);

  presenceState.id = elements.id.value.trim();
  presenceState.startTimestamp = Math.floor(Date.now() / 1000);
  previewStartTime = Date.now();

  ipcRenderer.send("connect", presenceState);
  showMsg("Conectando…");
});

disconnectBtn.addEventListener("click", () => {
  ipcRenderer.send("disconnect");
  showMsg("Desconectado.");
});

updateBtn.addEventListener("click", () => {
  // pequena checagem
  const ps = parseInt(elements.partySize.value || "0", 10);
  const pm = parseInt(elements.partyMax.value || "0", 10);
  if (ps && pm && ps > pm)
    return showMsg("PartySize não pode ser maior que PartyMax", false);

  ipcRenderer.send("update-presence", presenceState);
  showMsg("Presença atualizada.");
});

saveBtn.addEventListener("click", () => {
  ipcRenderer.send("save-config", presenceState);
  showMsg("Configuração salva.");
});

// Carregar config do main
ipcRenderer.on("on-config-load", (_evt, config) => {
  if (!config || Object.keys(config).length === 0) return;
  Object.assign(presenceState, config);

  // preencher inputs
  Object.keys(elements).forEach((key) => {
    if (
      elements[key] &&
      presenceState[key] !== undefined &&
      presenceState[key] !== null
    ) {
      elements[key].value = presenceState[key];
    }
  });

  if (presenceState.id) {
    presenceElements.clientStatus.textContent = `Client: ${presenceState.id}`;
    presenceElements.clientStatus.style.borderColor = "#7c3aed";
    presenceElements.clientStatus.style.color = "#c4b5fd";
  }

  updateDisplay();
});

// Mensagens do main
ipcRenderer.on("message", (_evt, message) => {
  showMsg(message, !/erro|error/i.test(message));
});
