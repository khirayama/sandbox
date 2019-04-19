const { app, BrowserWindow } = require('electron');

let win = null;

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      plugins: true,
    },
  });
  win.loadFile('index.html');
}

app.on('ready', createWindow);
