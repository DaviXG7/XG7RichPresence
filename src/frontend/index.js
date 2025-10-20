const { ipcRenderer } = require('electron');

//Elements

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
    // timerMode: document.getElementById("timer-mode"),
    // timerCustom: document.getElementById("timer-custom")
};

const presenceElements = {
    largeImage: document.getElementById("large-image"),
    smallImage: document.getElementById("small-image"),
    activityText: document.getElementById("presence-activity"),
    info: document.getElementById("presence-info"),
    detailsText: document.getElementById("presence-details-text"),
    stateText: document.getElementById("presence-state-text"),
    largeImageText: document.getElementById("presence-large-image-text"),
    timer: document.getElementById("presence-timer"),
    members: document.getElementById("presence-members"),
    button1: document.getElementById("presence-button-1"),
    button2: document.getElementById("presence-button-2")
};

// Current state
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
    button2URL: ""
    // timerMode: "start",
    // timerCustom: new Date()
};


//View updaters

let previewStartTime = Date.now();

function updateTimerDisplay() {
    const elapsed = Math.floor((Date.now() - previewStartTime) / 1000);
    presenceElements.timer.innerText = formatTime(elapsed);

    // const mode = presenceState.timerMode;
    // if(mode === "current") {
    //     const now = new Date();
    //     text = now.toLocaleTimeString();
    // } else if(mode === "start") {
    //     const elapsed = Math.floor((Date.now() - appStartTime)/1000);
    //     text = formatTime(elapsed);
    // } else if(mode === "custom") {
    //     const date = presenceState.timerCustom instanceof Date ? presenceState.timerCustom : new Date(presenceState.timerCustom);
    //     text = date.toLocaleTimeString();
    // }
}

function updateDisplay() {
    const typeValue = elements.type.options[elements.type.selectedIndex].text.toUpperCase();

    if (typeValue === "PLAYING") {
        presenceElements.detailsText.innerText = "Application Name";
        presenceElements.activityText.innerText = "Playing";
        presenceElements.stateText.innerText = presenceState.details;
        presenceElements.largeImageText.innerText = presenceState.state;
        presenceElements.members.classList.add("hidden");

        if (presenceState.partySize !== 0 || presenceState.partyMax !== 0) {
            presenceElements.members.innerText = `${presenceState.state} (${presenceState.partySize} of ${presenceState.partyMax})`;
            presenceElements.members.classList.remove("hidden");
            presenceElements.largeImageText.classList.add("hidden");
        } else {
            presenceElements.largeImageText.classList.remove("hidden");
        }
    } else {
        presenceElements.activityText.innerText = `${typeValue} Application Name`;
        presenceElements.detailsText.innerText = presenceState.details;
        presenceElements.stateText.innerText = presenceState.state;
        presenceElements.largeImageText.innerText = presenceState.largeImageText;
        presenceElements.members.classList.add("hidden");
        presenceElements.largeImageText.classList.remove("hidden");
    }

    if (presenceState.button1Label && presenceState.button1URL) {
        presenceElements.button1.classList.remove("hidden");
        presenceElements.button1.innerText = presenceState.button1Label;
        presenceElements.button1.href = presenceState.button1URL;
    } else {
        presenceElements.button1.classList.add("hidden");
    }

    if (presenceState.button2Label && presenceState.button2URL) {
        presenceElements.button2.classList.remove("hidden");
        presenceElements.button2.innerText = presenceState.button2Label;
        presenceElements.button2.href = presenceState.button2URL;
    } else {
        presenceElements.button2.classList.add("hidden");
    }

    updateTimerDisplay();
}

//Update state (from client) and display
function updateState(updates) {
    Object.assign(presenceState, updates);
    updateDisplay();
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2,'0');
    const m = Math.floor((seconds % 3600)/60).toString().padStart(2,'0');
    const s = Math.floor(seconds % 60).toString().padStart(2,'0');
    return `${h}:${m}:${s}`;
}

//Listener for input changes
Object.keys(elements).forEach(key => {
    if (key === "type") return;

    elements[key]?.addEventListener("input", () => {
        let value = elements[key].value;
        if (key === "partySize" || key === "partyMax") {
            value = parseInt(value) || 0;
        }
        updateState({ [key]: value });
    });
});

elements.type.addEventListener("change", () => {
    updateState({ type: parseInt(elements.type.value) });
});

//Define time. TODO: doesn't work
// elements.timerMode?.addEventListener("change", () => {
//     const mode = elements.timerMode.value;
//     presenceState.timerMode = mode;
//
//     // if(mode === "current") {
//     //     const now = new Date();
//     //     const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     //     const secondsSinceStartOfDay = Math.floor((now - startOfDay) / 1000);
//     //     updateState({startTimestamp: secondsSinceStartOfDay});
//     // } else if(mode === "start") {
//     //     updateState({ startTimestamp: Math.floor(appStartTime / 1000) });
//     // } else if(mode === "custom") {
//     //     const customSeconds = presenceState.timerCustom.getTime() / 1000 || 0;
//     //     updateState({ startTimestamp: customSeconds });
//     // }
//
//     updateTimerDisplay();
// });

setInterval(updateTimerDisplay, 1000);

updateDisplay();

// Control buttons
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const updateBtn = document.getElementById("update-btn");
const saveBtn = document.getElementById("save-btn");

connectBtn.addEventListener("click", () => {
    presenceState.startTimestamp = Math.floor(Date.now() / 1000);
    console.log("Connecting with state:", presenceState);
    ipcRenderer.send("connect", presenceState);
});

disconnectBtn.addEventListener("click", () => {
    console.log("Disconnecting...");
    ipcRenderer.send("disconnect");
});

updateBtn.addEventListener("click", () => {
    console.log("Updating presence with state:", presenceState);
    ipcRenderer.send("update-presence", presenceState);
});

saveBtn.addEventListener("click", () => {
    console.log("Saving config...");
    ipcRenderer.send("save-config", presenceState);
});

//Load inputs from state

function loadInputsFromState() {
    Object.keys(elements).forEach(key => {
        if (elements[key] && presenceState[key] !== undefined && presenceState[key] !== null) {
            elements[key].value = presenceState[key];
        }
    });
    console.log("Inputs carregados do estado atual");
}

ipcRenderer.on("on-config-load", (_, config) => {
    console.log("Config loaded:", config);

    if (!config || Object.keys(config).length === 0) {
        console.log("No config to load");
        return;
    }

    Object.assign(presenceState, config);

    loadInputsFromState();

    updateDisplay();

    console.log("Configuração carregada com sucesso!");
});

//Message label
const messageLabel = document.getElementById("message");

ipcRenderer.on("message", (_, message) => {
    console.log("Received message:", message);
    messageLabel.classList.remove("hidden");
    messageLabel.innerText = message;
});