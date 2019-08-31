const {app, BrowserWindow, dialog} = require('electron');
const fs = require('fs');
//Creating a Set to keep track of new windows
const windows = new Set();

const getFileFromUser = exports.getFileFromUser = (targetWindow) => {
  dialog.showOpenDialog(targetWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  }).then(result => {
    if (!result.canseled) openFile(targetWindow, result.filePaths);
  }).catch(err => {
    console.log(err);
  })
};

const openFile = (targetWindow, file) => {
  const content = fs.readFileSync(file[0]).toString();
  //Broadcasting the name of the file and its contents over the file-opened channel
  targetWindow.webContents.send('file-opened', file, content);
};

//Implementing a function to create new windows
const createWindow = exports.createWindow = () => {
  let newWindow = new BrowserWindow({show: false, webPreferences:{nodeIntegration: true}});
  newWindow.loadFile('./app/index.html');
  newWindow.once('ready-to-show', () => {
    newWindow.show();
    //Opening the Developer Tools from the main process
    newWindow.webContents.openDevTools();
  });
  newWindow.on('closed', () => {
    windows.delete(newWindow);
    newWindow = null;
  });
  windows.add(newWindow);
  return newWindow;
};  

app.on('ready', () => {
  createWindow();
}); 