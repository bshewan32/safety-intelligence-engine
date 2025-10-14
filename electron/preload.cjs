// src/preload/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Workers
  listWorkers: () => ipcRenderer.invoke('db:listWorkers'),
  
  getWorker: (workerId) => 
    ipcRenderer.invoke('db:getWorker', workerId),
  
  getWorkerWithRequiredControls: (workerId) => 
    ipcRenderer.invoke('db:getWorkerWithRequiredControls', workerId),
  
  upsertWorker: (worker) => 
    ipcRenderer.invoke('db:upsertWorker', worker),

  // Assignment Engine
  recomputeWorker: (workerId) => 
    ipcRenderer.invoke('db:recomputeWorker', workerId),
  
  recomputeAllWorkers: () => 
    ipcRenderer.invoke('db:recomputeAllWorkers'),

  // Temporary Fixes
  createTemporaryFix: (data) => 
    ipcRenderer.invoke('db:createTemporaryFix', data),

  // Evidence Management
  addEvidence: (data) => 
    ipcRenderer.invoke('db:addEvidence', data),

  // File Operations
  selectEvidence: () => 
    ipcRenderer.invoke('file:selectEvidence'),
  
  openEvidence: (filePath) => 
    ipcRenderer.invoke('file:openEvidence', filePath),

  // Hazards
  listHazards: () => 
    ipcRenderer.invoke('db:listHazards'),

  // Controls
  listControls: () => 
    ipcRenderer.invoke('db:listControls'),

  // Dashboard
  dashboardSummary: () => 
    ipcRenderer.invoke('db:dashboardSummary'),

  // Reports
  buildClient: (filters) => 
    ipcRenderer.invoke('report:buildClient', filters),
});