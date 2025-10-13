import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let db;

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

  // Load React app
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function initDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'safety_intelligence.db');
  
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Run schema
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('Database initialized');
  }
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) db.close();
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('db:query', async (event, sql, params) => {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(params);
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
});

ipcMain.handle('db:execute', async (event, sql, params) => {
  try {
    const stmt = db.prepare(sql);
    return stmt.run(params);
  } catch (error) {
    console.error('Execute error:', error);
    throw error;
  }
});