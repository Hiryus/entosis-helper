import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import started from 'electron-squirrel-startup';
import { updateElectronApp } from 'update-electron-app';
import path from 'node:path';

import * as parser from './backend/parser.js';
import Watcher from './backend/watcher.js';

updateElectronApp();

const DEBUG = false;
let mainWindow = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

async function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: DEBUG ? 1024 : 650,
        height: 800,
        frame: false,
        resizable: true,
        icon: path.join(__dirname, 'img', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        await mainWindow.loadFile(path.join(__dirname, '..', 'renderer', MAIN_WINDOW_VITE_NAME, 'index.html'));
    }

    // Open the DevTools if in DEBUG mode
    if(DEBUG)
        mainWindow.webContents.openDevTools();
};

/**
 * @param {Error} error
 */
function reportError(error) {
    console.error(error.messgae || error)
    mainWindow.webContents.send('error', error.messgae || error);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    const watcher = new Watcher();
    // Create main window
    await createWindow();
    ipcMain.handle('close', () => mainWindow.close());
    ipcMain.handle('minimize', () => mainWindow.minimize());
    ipcMain.handle('select_chat', () => {
        dialog.showOpenDialog({
            defaultPath: folder,
            filters: { extension: 'txt' },
            properties: ['openFile'],
            title: 'Select file to monitore',
        }).then(({ canceled, filePaths }) => {
            if (!canceled) watcher.manage(filePaths[0]);
        }).catch(reportError);
    });
    // Start monitoring log file
    const folder = path.join(app.getPath('documents'), 'EVE', 'logs', 'Chatlogs');
    watcher.on('error', reportError);
    watcher.on('new_log', (line) => {
        const log = parser.parse(line);
        if (log != null) mainWindow.webContents.send('update_node', log);
    });
    const file = await watcher.getLogFile('fleet', folder)
    watcher.manage(file);
}).catch(reportError);

// On OS X it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
