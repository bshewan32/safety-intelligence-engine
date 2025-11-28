// src/preload/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Workers
  listWorkers: (clientId) => ipcRenderer.invoke('db:listWorkers', clientId),
  
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

  // Roles
  listRoles: () => ipcRenderer.invoke('db:listRoles'),
  createRole: (payload) => ipcRenderer.invoke('db:createRole', payload),
  updateRole: (payload) => ipcRenderer.invoke('db:updateRole', payload),
  deleteRole: (roleId) => ipcRenderer.invoke('db:deleteRole', roleId),

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
  dashboardSummary: (clientId) =>
    ipcRenderer.invoke('db:dashboardSummary', clientId),

  // Client Setup

  listClients: () => ipcRenderer.invoke('db:listClients'),

  getClient: (id) => ipcRenderer.invoke('db:getClient', id),

  createClient: (payload) => ipcRenderer.invoke('db:createClient', payload),

  updateClient: (payload) => ipcRenderer.invoke('db:updateClient', payload),
  
  deleteClient: (id) => ipcRenderer.invoke('db:deleteClient', id),

  setupClientFramework: (payload) => ipcRenderer.invoke('db:setupClientFramework', payload),

  previewClientHazards: (payload) => ipcRenderer.invoke('db:previewClientHazards', payload),

  setupClientWithRiskUniverse: (payload) => ipcRenderer.invoke('db:setupClientWithRiskUniverse', payload),


  // Sites
  createSite: (payload) => ipcRenderer.invoke('db:createSite', payload),
  deleteSite: (siteId) => ipcRenderer.invoke('db:deleteSite', siteId),

  // Worker Role Management
  removeWorkerRole: (workerRoleId) => ipcRenderer.invoke('db:removeWorkerRole', workerRoleId),

  // Reports
  buildClient: (filters) =>
    ipcRenderer.invoke('report:db:buildClient', filters),

  // Widgets

  analyzeGaps: (clientId) => ipcRenderer.invoke('db:analyzeGaps', clientId),
  // Risk Matrix
  getClientRiskMatrix: (clientId) => ipcRenderer.invoke('db:getClientRiskMatrix', clientId),
  updateClientHazard: (hazardId, updates) => ipcRenderer.invoke('db:updateClientHazard', hazardId, updates),
  addControlToHazard: (data) => ipcRenderer.invoke('db:addControlToHazard', data),
  removeControlFromHazard: (mappingId) => ipcRenderer.invoke('db:removeControlFromHazard', mappingId),
  getAvailableControls: (clientId) => ipcRenderer.invoke('db:getAvailableControls', clientId),
  analyzeClientGaps: (clientId) => ipcRenderer.invoke('db:analyzeClientGaps', clientId),
  analyzeWorkerGaps: (workerId) => ipcRenderer.invoke('db:analyzeWorkerGaps', workerId),
  getGapSummary: (clientId) => ipcRenderer.invoke('db:getGapSummary', clientId),
  
});
  
