// electron/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  db: {
    query: (sql, params) => ipcRenderer.invoke('db:query', sql, params),
    execute: (sql, params) => ipcRenderer.invoke('db:execute', sql, params),
  },
  export: {
    pdf: (reportData) => ipcRenderer.invoke('export:pdf', reportData),
    docx: (reportData) => ipcRenderer.invoke('export:docx', reportData),
  },
});