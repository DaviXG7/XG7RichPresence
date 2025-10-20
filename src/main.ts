import { app, BrowserWindow } from 'electron';
import './app_window'
import {loadWindow, WindowConfiguration} from "./app_window";
import {RichPresence} from "./rich_presence";
import {SetActivity} from "@xhayper/discord-rpc";

console.log("INIT")

const richPresence = new RichPresence();

const winConfig = new WindowConfiguration(700, 1100, richPresence);

app.on('ready', () => loadWindow(winConfig))


export function changeActivity(activity: SetActivity) {
    richPresence.setActivity(activity);
}

export function connect(clientID: string) {
    richPresence.login(clientID);
}






