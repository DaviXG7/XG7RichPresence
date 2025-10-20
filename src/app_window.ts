import {app, BrowserWindow, ipcMain } from "electron";
import url = require("url");
import {RichPresence} from "./rich_presence";
import {SetActivity} from "@xhayper/discord-rpc";
import fileS = require('fs');
import path = require('path');

export * from "colors";

const configPath = path.join(__dirname, 'config.json');

let win: BrowserWindow;

export class WindowConfiguration {

    client: RichPresence;
    clientID: string | undefined;

    width: number;
    height: number;

    constructor(width: number, height: number, client: RichPresence) {
        this.width = width;
        this.height = height;

        this.client = client;

        // Handlers IPC
        ipcMain.on('connect', (_, data) => {
            if (data?.id) {
                this.clientID = data.id;
                console.log("ID: " + this.clientID);
            }

            const response = this.checkActivity(data);
            sendMessage(response.message);

            if (response.error) {
                console.log(response.message);
                return;
            }

            client.setActivity(buildActivity(data));
            this.connect();
        });

        ipcMain.on('update-presence', (_, data) => {
            const response = this.checkActivity(data);
            sendMessage(response.message);

            if (response.error) {
                console.log(response.message);
                return;
            }

            ipcMain.emit('message', response.message);
            client.setActivity(buildActivity(data));
        });
        ipcMain.on('disconnect', (_, data) => {
            this.disconnect()
        })


        ipcMain.on('save-config', (_, data) => {
            try {
                fileS.writeFileSync(configPath, JSON.stringify(data, null, 2));
                const mainWindow = getMainWindow();
                if (mainWindow) {
                    mainWindow.webContents.send('message', 'Configuração salva com sucesso!');
                }
                console.log('Config saved to:', configPath);
            } catch (error) {
                console.error('Erro ao salvar configuração:', error);
                const mainWindow = getMainWindow();
                if (mainWindow) {
                    mainWindow.webContents.send('message', 'Erro ao salvar configuração!');
                }
            }
        });
    }

    //Connect and Disconnect
    connect() {
        if (!this.clientID) return;
        this.client.login(this.clientID);
    }
    disconnect() {
        this.client.disconnect()
    }

    //Check Activity before connect or update
    checkActivity(data: SetActivity): { error: boolean; message: string } {
        if (!data) return { error: true, message: "No activity data provided" };

        if (!this.clientID) return { error: true, message: "Client ID not set" };


        if (!data.details || data.details.length < 2)
            return { error: true, message: "Details must be at least 2 characters" };
        if (!data.state || data.state.length < 2)
            return { error: true, message: "State must be at least 2 characters" };

        if (data.details.length > 128)
            return { error: true, message: "Details is too long (max 128 chars)" };
        if (data.state.length > 128)
            return { error: true, message: "State is too long (max 128 chars)" };
        if (data.largeImageText && (data.largeImageText.length < 2 || data.largeImageText.length > 128))
            return { error: true, message: "LargeImageText must be 2-128 chars" };
        if (data.smallImageText && (data.smallImageText.length < 2 || data.smallImageText.length > 128))
            return { error: true, message: "SmallImageText must be 2-128 chars" };

        if (data.partySize !== undefined && data.partyMax !== undefined && data.partySize > data.partyMax)
            return { error: true, message: "PartySize cannot be greater than PartyMax" };

        if (!data.startTimestamp)
            return { error: true, message: "startTimestamp must be a number or Date" };

        if (data.buttons && data.buttons.length > 2)
            return { error: true, message: "Cannot have more than 2 buttons" };

        return { error: false, message: "Connected!" };
    }


}


export function loadWindow(winConfig: WindowConfiguration) {
    win = new BrowserWindow({
        height: winConfig.height,
        width: winConfig.width,
        frame: false,
        titleBarStyle: "hidden",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, "..", "src", "frontend", "index.html"),
            protocol: "file",
            slashes: true
        })
    );

    loadConfig(win)
}


const getMainWindow = () => BrowserWindow.getAllWindows()[0];

function loadConfig(win: BrowserWindow) {

    win.webContents.on('did-finish-load', () => {
        try {
            if (fileS.existsSync(configPath)) {
                const data = fileS.readFileSync(configPath, 'utf-8');
                const config = JSON.parse(data);
                win.webContents.send('on-config-load', config);
                console.log('Config loaded from:', configPath);
            } else {
                fileS.writeFileSync(configPath, JSON.stringify({}));
                console.log('No config file found, created empty config');
            }
        } catch (error) {
            console.error('Erro ao carregar configuração:', error);
        }
    });

}

function sendMessage(message: string) {
    const mainWindow = getMainWindow();
    if (mainWindow) {
        mainWindow.webContents.send('message', message);
    }
}

function buildButtons(data: any) {
    const buttons = [];
    if (data.button1Label && data.button1URL) {
        buttons.push({ label: data.button1Label, url: data.button1URL });
    }
    if (data.button2Label && data.button2URL) {
        buttons.push({ label: data.button2Label, url: data.button2URL });
    }
    return buttons;
}

function buildActivity(data: any) {
    return {
        type: data.type || 0,
        state: data.state,
        details: data.details,
        largeImageKey: data.largeImageKey || undefined,
        largeImageText: data.largeImageText || undefined,
        smallImageKey: data.smallImageKey || undefined,
        smallImageText: data.smallImageText || undefined,
        partySize: data.partySize || undefined,
        partyMax: data.partyMax || undefined,
        startTimestamp: data.startTimestamp || 0,
        buttons: buildButtons(data)
    }
}


export function closeWindow() {
    if (process.platform !== "darwin") {
        app.quit();
    }
}