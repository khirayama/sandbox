const { app, BrowserWindow } = require('electron');

let win = null;

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // For PDF: https://github.com/electron/electron/pull/17163
      plugins: true,
    },
  });
  win.maximize();
  win.loadFile('index.html');
}

app.on('ready', createWindow);
