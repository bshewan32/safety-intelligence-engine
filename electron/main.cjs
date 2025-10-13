// electron/main.cjs
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// Mock database for development
const mockDB = {
  workers: [
    { id: 1, first_name: 'Jim', last_name: 'Bob', employee_id: 'GMK001', role_id: 1 },
    { id: 2, first_name: 'Sarah', last_name: 'Smith', employee_id: 'GMK002', role_id: 2 },
  ],
  hazards: [
    { id: 1, code: 'ELEC-001', name: 'Electric Shock', category: 'Electrical' },
    { id: 2, code: 'CONF-001', name: 'Confined Space Entry', category: 'Confined Space' },
  ],
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Mock IPC Handlers
ipcMain.handle('db:query', async (event, sql, params) => {
  console.log('Mock Query:', sql, params);
  
  if (sql.includes('workers')) {
    return mockDB.workers;
  }
  if (sql.includes('hazards')) {
    return mockDB.hazards;
  }
  
  return [];
});

ipcMain.handle('db:execute', async (event, sql, params) => {
  console.log('Mock Execute:', sql, params);
  return { changes: 1, lastInsertRowid: 1 };
});