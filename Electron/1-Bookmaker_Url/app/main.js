//app - module that handles the lifecycle and configuration of our application. Used to quit, hide, and show the application as well as get and set the application’s properties.
//BrowserWindow is a separate and unique renderer process that includes a DOM, access to the Chromium web APIs, and the Node built-in module.

const {app,BrowserWindow} = require('electron');

let mainWindow = null;

//When app is ready, launch ready-event
app.on('ready', async () => {
  mainWindow = new BrowserWindow({ width: 800, height: 600, webPreferences:{nodeIntegration: true}});
  mainWindow.webContents.loadFile('./app/index.html');
});