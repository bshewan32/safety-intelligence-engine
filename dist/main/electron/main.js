import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { handleIPC } from './ipc.js';
import { handleTrainingIPC } from './ipc-training.js';
import { registerClientSetupHandlers } from './ipc-client-setup-enhanced.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const portableDir = process.env.ELECTRON_USER_DATA_DIR || path.join(process.cwd(), "userdata");
app.setPath("userData", portableDir);
const isDev = process.env.NODE_ENV !== 'production';
let mainWindow = null;
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, '../../../electron/preload.cjs'), // â† Changed: go up 3 levels
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
        },
    });
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
    }
    handleIPC(ipcMain, mainWindow);
    handleTrainingIPC(ipcMain);
}
app.whenReady().then(() => {
    createWindow();
    registerClientSetupHandlers(ipcMain);
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
