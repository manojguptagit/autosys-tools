// Electron
const { app, BrowserWindow, Menu } = require('electron');

// URL and File Modules
const url = require('url');
const path = require('path');

// Window
let win;

/**
 * Function to create a new window.
 */
createWindow = () => {
    win = new BrowserWindow({ width: 800, height: 600, frame: true, icon: 'icon.ico' });
    // Menu.setApplicationMenu(null);
    win.setMenuBarVisibility(false);
    win.maximize();
    // win.webContents.openDevTools();
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // On window close
    win.on('close', () => {
        win = null;
    });
}

// On Ready
app.on('ready', createWindow);

// On window close, force exit (on non mac)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});



// Mac on activate
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
