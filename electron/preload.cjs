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

  createWorker: (data) =>
     ipcRenderer.invoke('db:createWorker', data),

  addWorkerRole: (data) =>
     ipcRenderer.invoke('db:addWorkerRole', data),

  listRoles:     () => ipcRenderer.invoke('db:listRoles'),

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

  bulkAddEvidence: (payload) =>
     ipcRenderer.invoke('db:bulkAddEvidence', payload),

  // Hazards
  listHazards: () => 
    ipcRenderer.invoke('db:listHazards'),

  createHazard: (data) => 
    ipcRenderer.invoke('db:createHazard', data),

  importHazardPack: (payload) => 
    ipcRenderer.invoke('db:importHazardPack', payload),

  openHazardControlMapper: (id) => 
    ipcRenderer.invoke('ui:openHazardControlMapper', id),

  getHazardControls: (hazardId) =>
     ipcRenderer.invoke('db:getHazardControls', hazardId),

  addHazardControl: (payload) => 
      ipcRenderer.invoke('db:addHazardControl', payload),

  removeHazardControl: (payload) =>
     ipcRenderer.invoke('db:removeHazardControl', payload),

  // Controls
  listControls: () => 
    ipcRenderer.invoke('db:listControls'),

  createControl: (data) => 
    ipcRenderer.invoke('db:createControl', data),

  updateControl: (payload) => 
    ipcRenderer.invoke('db:updateControl', payload),

  importControlPack: (payload) => 
    ipcRenderer.invoke('db:importControlPack', payload),

  deleteControl: (id) => 
    ipcRenderer.invoke('db:deleteControl', id),

  // Dashboard
  dashboardSummary: () => 
    ipcRenderer.invoke('db:dashboardSummary'),

  // Reports
  buildClient: (filters) => 
    ipcRenderer.invoke('report:buildClient', filters),
});