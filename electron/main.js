const { app, BrowserWindow, ipcMain, nativeImage, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const PlatformIOManager = require('./platformio/manager');
const SerialPortManager = require('./serial/manager');
const ResourceManager = require('./resources/manager');

// Safe webContents send helper
function send(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

// Set app name early (especially important for dev builds on macOS)
app.setName('MeshCore Forge');

// Force set the name in multiple ways for dev builds
if (process.argv.includes('--dev')) {
  process.title = 'MeshCore Forge';
  app.setName('MeshCore Forge');
}

let mainWindow;
let platformIOManager;
let serialPortManager;
let resourceManager;

function createWindow() {
  const iconPath = path.resolve(__dirname, '..', 'assets', 'dark_icon.png');
  let icon = null;
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
  }
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: icon,
    titleBarStyle: 'default',
    show: false
  });

  // Load React app from Vite dev server in development, built files in production
  if (process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Force set icon for dev builds
    if (process.argv.includes('--dev')) {
      mainWindow.setIcon(iconPath);
    }
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  // Set app name for menu bar (especially important for dev builds)
  app.setName('MeshCore Forge');
  
  // Create custom menu with correct app name for macOS
  if (process.platform === 'darwin') {
    const template = [
      {
        label: 'MeshCore Forge',
        submenu: [
          { label: 'About MeshCore Forge', role: 'about' },
          { type: 'separator' },
          { label: 'Hide MeshCore Forge', accelerator: 'Command+H', role: 'hide' },
          { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' },
          { label: 'Show All', role: 'unhide' },
          { type: 'separator' },
          { label: 'Quit MeshCore Forge', accelerator: 'Command+Q', click: () => app.quit() }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
        ]
      }
    ];
    
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
  
  // Set app icon globally for macOS dock (especially important for dev builds)
  const iconPath = path.resolve(__dirname, '..', 'assets', 'dark_icon.png');
  if (fs.existsSync(iconPath) && app.dock) {
    const dockIcon = nativeImage.createFromPath(iconPath);
    app.dock.setIcon(dockIcon);
  }
  
  // Initialize managers
  platformIOManager = new PlatformIOManager();
  serialPortManager = new SerialPortManager();
  resourceManager = new ResourceManager();
  
  // Set up serial port event handlers
  serialPortManager.on('data', (data) => {
    send('serial-data', data);
  });
  
  serialPortManager.on('error', (error) => {
    send('serial-error', error);
  });
  
  serialPortManager.on('disconnected', () => {
    send('serial-disconnected');
  });

  // Set up resource manager event handlers
  resourceManager.on('status', (message) => {
    if (mainWindow) {
      send('resource-status', message);
    }
    console.log('Resource status:', message);
  });

  resourceManager.on('progress', (progress) => {
    if (mainWindow) {
      send('resource-progress', progress);
    }
    console.log('Resource progress:', progress);
  });

  resourceManager.on('error', (error) => {
    if (mainWindow) {
      send('resource-error', error);
    }
    console.error('Resource error:', error);
  });

  resourceManager.on('clone-complete', () => {
    if (mainWindow) {
      send('meshcore-clone-complete');
    }
    console.log('MeshCore clone completed');
  });
  
  createWindow();

  // Initialize resources after window is created
  try {
    await resourceManager.initialize();
  } catch (error) {
    console.error('Failed to initialize resources:', error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

// PlatformIO handlers
ipcMain.handle('get-board-list', async () => {
  try {
    return await platformIOManager.getBoardList();
  } catch (error) {
    console.error('Failed to get board list:', error);
    throw error;
  }
});

ipcMain.handle('get-variant-list', async (event, boardId) => {
  try {
    return await platformIOManager.getVariantList(boardId);
  } catch (error) {
    console.error('Failed to get variant list:', error);
    throw error;
  }
});

ipcMain.handle('get-variant-ui-fields', async (event, variant) => {
  try {
    const config = require('./platformio/config');
    return config.getVariantUIFields(variant);
  } catch (error) {
    console.error('Failed to get variant UI fields:', error);
    throw error;
  }
});

ipcMain.handle('get-regional-presets', async () => {
  try {
    const config = require('./platformio/config');
    return config.getRegionalPresets();
  } catch (error) {
    console.error('Failed to get regional presets:', error);
    throw error;
  }
});

ipcMain.handle('start-build', async (event, config) => {
  try {
    if (platformIOManager.isCurrentlyBuilding()) {
      throw new Error('Build already in progress');
    }

    await platformIOManager.startBuild(
      config,
      (data) => {
        // Send terminal data to renderer
        send('terminal-data', data);
      },
      (result) => {
        // Send build complete event
        send('build-complete', result);
      },
      (error) => {
        // Send build error event
        send('build-error', error);
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to start build:', error);
    throw error;
  }
});

ipcMain.handle('start-upload', async (event, config) => {
  try {
    if (platformIOManager.isCurrentlyBuilding()) {
      throw new Error('Build/upload already in progress');
    }

    await platformIOManager.startUpload(
      config,
      (data) => {
        // Send terminal data to renderer
        send('terminal-data', data);
      },
      (result) => {
        // Send upload complete event
        send('upload-complete', result);
      },
      (error) => {
        // Send upload error event
        send('upload-error', error);
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to start upload:', error);
    throw error;
  }
});

ipcMain.handle('stop-build', async () => {
  try {
    await platformIOManager.stopBuild();
    return { success: true };
  } catch (error) {
    console.error('Failed to stop build:', error);
    throw error;
  }
});

// Serial port handlers
ipcMain.handle('list-serial-ports', async () => {
  try {
    return await serialPortManager.listPorts();
  } catch (error) {
    console.error('Failed to list serial ports:', error);
    throw error;
  }
});

ipcMain.handle('connect-serial-port', async (event, portPath, baudRate) => {
  try {
    return await serialPortManager.connect(portPath, baudRate);
  } catch (error) {
    console.error('Failed to connect to serial port:', error);
    throw error;
  }
});

ipcMain.handle('disconnect-serial-port', async () => {
  try {
    await serialPortManager.disconnect();
    return { success: true };
  } catch (error) {
    console.error('Failed to disconnect serial port:', error);
    throw error;
  }
});

ipcMain.handle('start-serial-monitoring', async () => {
  try {
    await serialPortManager.startMonitoring();
    return { success: true };
  } catch (error) {
    console.error('Failed to start serial monitoring:', error);
    throw error;
  }
});

ipcMain.handle('stop-serial-monitoring', async () => {
  try {
    await serialPortManager.stopMonitoring();
    return { success: true };
  } catch (error) {
    console.error('Failed to stop serial monitoring:', error);
    throw error;
  }
});

ipcMain.handle('get-serial-connection-info', async () => {
  try {
    return serialPortManager.getConnectionInfo();
  } catch (error) {
    console.error('Failed to get serial connection info:', error);
    throw error;
  }
});

ipcMain.handle('reset-serial-device', async () => {
  try {
    await serialPortManager.resetDevice();
    return { success: true };
  } catch (error) {
    console.error('Failed to reset serial device:', error);
    throw error;
  }
});

ipcMain.handle('get-baud-rates', async () => {
  return SerialPortManager.getCommonBaudRates();
});

// Resource management handlers
ipcMain.handle('get-meshcore-info', async () => {
  try {
    return await resourceManager.getMeshCoreInfo();
  } catch (error) {
    console.error('Failed to get MeshCore info:', error);
    throw error;
  }
});

ipcMain.handle('update-meshcore', async () => {
  try {
    await resourceManager.updateMeshCore();
    return { success: true };
  } catch (error) {
    console.error('Failed to update MeshCore:', error);
    throw error;
  }
});

ipcMain.handle('re-clone-meshcore', async () => {
  try {
    await resourceManager.forceReClone();
    return { success: true };
  } catch (error) {
    console.error('Failed to re-clone MeshCore:', error);
    throw error;
  }
});