import { app, BrowserWindow } from 'electron';
import './app_window'
import {closeWindow, loadWindow, openWindow, WindowConfiguration} from "./app_window";
import {RichPresence} from "./rich_presence";
import {SetActivity} from "@xhayper/discord-rpc";

console.log("INIT")

const winConfig = new WindowConfiguration(700, 500);
const richPresence = new RichPresence();

richPresence.setActivity({
    type: 2,
    partySize: 10,
    partyMax: 20,
    details: "Jogando Minecraft",
    state: "Explorando o Nether",
    startTimestamp: new Date(),
    largeImageKey: "large",
    largeImageText: "Minecraft Oficial",
    smallImageKey: "small",
    smallImageText: "VC É LEGAL",
    buttons: [{label: "Entrar no servidor", url: "https://discord.gg/xxxx"}, {
        label: "asdasdasd no site",
        url: "https://meusite.com"
    }]
})

richPresence.login("1167899920334868540")

app.on('ready', () => loadWindow(winConfig))


export function changeActivity(activity: SetActivity) {
    richPresence.setActivity(activity);
}

export function connect(clientID: string) {
    richPresence.login(clientID);
}






