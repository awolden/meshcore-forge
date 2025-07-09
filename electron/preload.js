const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // PlatformIO operations
  startBuild: (config) => ipcRenderer.invoke('start-build', config),
  startUpload: (config) => ipcRenderer.invoke('start-upload', config),
  stopBuild: () => ipcRenderer.invoke('stop-build'),
  getBoardList: () => ipcRenderer.invoke('get-board-list'),
  getVariantList: (board) => ipcRenderer.invoke('get-variant-list', board),
  getVariantUIFields: (variant) => ipcRenderer.invoke('get-variant-ui-fields', variant),
  getRegionalPresets: () => ipcRenderer.invoke('get-regional-presets'),

  // Serial port operations
  listSerialPorts: () => ipcRenderer.invoke('list-serial-ports'),
  connectSerialPort: (port, baudRate) => ipcRenderer.invoke('connect-serial-port', port, baudRate),
  disconnectSerialPort: () => ipcRenderer.invoke('disconnect-serial-port'),
  startSerialMonitoring: () => ipcRenderer.invoke('start-serial-monitoring'),
  stopSerialMonitoring: () => ipcRenderer.invoke('stop-serial-monitoring'),
  getSerialConnectionInfo: () => ipcRenderer.invoke('get-serial-connection-info'),
  resetSerialDevice: () => ipcRenderer.invoke('reset-serial-device'),
  getBaudRates: () => ipcRenderer.invoke('get-baud-rates'),

  // Resource management
  getMeshCoreInfo: () => ipcRenderer.invoke('get-meshcore-info'),
  updateMeshCore: () => ipcRenderer.invoke('update-meshcore'),
  reCloneMeshCore: () => ipcRenderer.invoke('re-clone-meshcore'),

  // Terminal events
  onTerminalData: (callback) => {
    ipcRenderer.on('terminal-data', (event, data) => callback(data));
  },
  onBuildComplete: (callback) => {
    ipcRenderer.on('build-complete', (event, result) => callback(result));
  },
  onBuildError: (callback) => {
    ipcRenderer.on('build-error', (event, error) => callback(error));
  },

  // Resource events
  onResourceStatus: (callback) => {
    ipcRenderer.on('resource-status', (event, message) => callback(message));
  },
  onResourceProgress: (callback) => {
    ipcRenderer.on('resource-progress', (event, progress) => callback(progress));
  },
  onResourceError: (callback) => {
    ipcRenderer.on('resource-error', (event, error) => callback(error));
  },
  onMeshCoreCloneComplete: (callback) => {
    ipcRenderer.on('meshcore-clone-complete', (event) => callback());
  },

  // Cleanup listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});