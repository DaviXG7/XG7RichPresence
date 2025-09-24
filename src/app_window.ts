import {app, BrowserWindow} from "electron";
import path = require("path");
import url = require("url");

let win: BrowserWindow;

export class WindowConfiguration {

    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

}

export function loadWindow(winConfig: WindowConfiguration) {
    win = new BrowserWindow({
        height: winConfig.height,
        width: winConfig.width,
        webPreferences: {
            nodeIntegration: true,
        }
    })

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, "..", "src", "index.html"),
            protocol: "file",
            slashes: true
        })
    );

    win.webContents.openDevTools();

}

export function openWindow(winConfig: WindowConfiguration) {
    if (win === null) {
        loadWindow(winConfig);
    }
}


export function closeWindow() {
    if (process.platform !== "darwin") {
        app.quit();
    }
}