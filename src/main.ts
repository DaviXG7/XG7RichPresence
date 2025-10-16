import { app, BrowserWindow } from 'electron';
import './app_window'
import {closeWindow, loadWindow, openWindow, WindowConfiguration} from "./app_window";
import {RichPresence} from "./rich_presence";
import {SetActivity} from "@xhayper/discord-rpc";

console.log("INIT")

const winConfig = new WindowConfiguration(700, 900);
const richPresence = new RichPresence();

richPresence.login("1167899920334868540")

app.on('ready', () => loadWindow(winConfig))


export function changeActivity(activity: SetActivity) {
    richPresence.setActivity(activity);
}

export function connect(clientID: string) {
    richPresence.login(clientID);
}






