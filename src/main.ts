import { app, BrowserWindow } from 'electron';
import './app_window'
import {closeWindow, loadWindow, openWindow, WindowConfiguration} from "./app_window";

console.log("INIT")

let winConfig = new WindowConfiguration(600, 800);

app.on('ready', () => loadWindow(winConfig))



