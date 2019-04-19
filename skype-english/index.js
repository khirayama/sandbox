const { app, BrowserWindow } = require('electron');

let win = null;

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
  });
  win.loadFile('index.html');

  console.log('call');
  navigator.webkitGetUserMedia({
    video: true,
    audio: true,
  });
}

app.on('ready', createWindow);
