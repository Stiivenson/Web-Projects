/* Update 1.1.0:
Add work with file:
- supports drag-and-drop functionality;
- watches the filesystem for changes;
- adds files to the operating system’s list of recently opened files;
- updates the window’s title bar;
- alerts the user before discarding unsaved changes.*/

const {app, BrowserWindow, dialog} = require('electron');
const fs = require('fs');
const dataStore = {};
//Creating a Set to keep track of new windows
const windows = new Set();
//Setting up a Map to watch files
const openFiles = new Map();

//Сreating Sys File Browser Window, to select current file
const getFileFromUser = exports.getFileFromUser = (targetWindow) => {
  dialog.showOpenDialog(targetWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  }).then(result => {
    if (!result.canseled) openFile(targetWindow, result.filePaths[0]);
  }).catch(err => {
    console.log(err);
  })
};

//Sending file to render
const openFile = exports.openFile = (targetWindow, file) => {
  const content = fs.readFileSync(file).toString();
  app.addRecentDocument(file);
  targetWindow.setRepresentedFilename(file);
  //Broadcasting the name of the file and its contents over the file-opened channel
  targetWindow.webContents.send('file-opened', file, content, dataStore[targetWindow.id].edited);
  startWatchingFile(targetWindow, file);
};

//Saving the generated output
const saveHtml = exports.saveHtml = (targetWindow, content) => {
  dialog.showSaveDialog(targetWindow,{
    title: 'Save HTML',
    defaultPath: app.getPath('desktop'),
    filters:[
      { name:'HTML Files', extensions: ['html', 'htm'] }
    ]
  }).then(result => {
    if(!result.canceled) {
      fs.writeFileSync(result.filePath, content);
    } else return; 
  }).catch(err => {
    console.log(err);
  })
};

//Saving the current file
const saveMarkdown = exports.saveMarkdown = (targetWindow, file, content) => {
  console.log(!file);
  if (!file) {
    dialog.showSaveDialog(targetWindow,{
      title: 'Save Markdown',
      defaultPath: app.getPath('desktop'),
      filters: [
        { name: 'Markdown Files', extensions: ['md', 'markdown'] }
      ]
    }).then(result => {
      if(!result.canceled) {
        saveFile(targetWindow, result.filePath, content);
      } else return; 
    }).catch(err => {
      console.log(err);
    })
  }
  saveFile(targetWindow, file, content);
};

const saveFile = (targetWindow, path, content) => {
  fs.writeFileSync(path, content);
  openFile(targetWindow, path);
};

//Listens to a doc changes
const isFileEdited = exports.isFileEdited = (targetWindow, isEdited) => {
  dataStore[targetWindow.id].edited = isEdited;
  console.log(dataStore[targetWindow.id].edited);
};

//Setting up a listeners
const startWatchingFile = (targetWindow, file) => {
  //Closes the existing watcher if there is one
  stopWatchingFile(targetWindow);

  const watcher = fs.watchFile(file, (event) => {
    //If the watcher fires a change event, rereads the file
    if (event === 'change'){
      const content = fs.readFileSync(file).toString();
      //Fires a different event if there has been a change to the current file
      targetWindow.webContents.send('file-changed', file, content);
    }
  });

  openFiles.set(targetWindow, watcher);
};

const stopWatchingFile = (targetWindow, file) => {
  if (openFiles.has(targetWindow)) {
    openFiles.get(targetWindow).stop();
    openFiles.delete(targetWindow);
  }
};

//Implementing a function to create new windows
const createWindow = exports.createWindow = () => {
  let x, y;
  //Gets the browser window that is currently active
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow){
    const [currentWindowX, currentWindowY] = currentWindow.getPosition();
    x = currentWindowX + 10;
    y = currentWindowY + 10;
  }

  let newWindow = new BrowserWindow({x, y, show: false, webPreferences:{nodeIntegration: true}});
  
  newWindow.loadFile('./app/index.html');

  newWindow.once('ready-to-show', () => {
    newWindow.show();
    //Opening the Developer Tools from the main process
    newWindow.webContents.openDevTools();
  });

  newWindow.on('closed', () => {
    windows.delete(newWindow);
    stopWatchingFile(newWindow);
    newWindow = null;
  });

  //Prompting the user if they try to close a window with unsaved changes
  newWindow.on('close', (event) => {
      console.log(dataStore[newWindow.id].edited);
      if (dataStore[newWindow.id].edited) {
        event.preventDefault();
        dialog.showMessageBox(newWindow,{
          type: 'warning',
          title: 'Quit with Unsaved Changes?',
          message: 'Your changes will be lost if you do not save!',
          buttons: [ 'Quit Anyway', 'Cancel' ],
          defaultId: 0,
          cancelId: 1
        }).then(result => {
          if (result.response === 0) newWindow.destroy();
        }).catch(err => {
          console.log(err);
        })
      }
  });
  
  windows.add(newWindow);
  dataStore[newWindow.id] = { edited: false};
  return newWindow;
};  

//Responding to external requests to open a file
app.on('will-finish-launching', () => {
  app.on('open-file', () => {
    const win = createWindow();
    win.once('ready-to-show', () => {
      openFile(win, file);
    });
  });
});

app.on('ready', () => {
  createWindow();
}); 