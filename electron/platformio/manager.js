const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { app } = require('electron');
const config = require('./config');

class PlatformIOManager {
  constructor() {
    this.currentProcess = null;
    this.isBuilding = false;
    this.workingDirectory = null;
    this.pythonPath = null;
    this.pioPath = null;
    
    this.initialize();
  }

  initialize() {
    // Set up paths for bundled Python and PlatformIO
    const appDataPath = app.getPath('userData');
    const appResourcesPath = path.join(appDataPath, 'resources');
    
    // MeshCore repo is in userData/resources/meshcore
    this.workingDirectory = path.join(appResourcesPath, 'meshcore');
    
    // Python and PlatformIO are bundled with the app in process.resourcesPath
    // In packaged apps: process.resourcesPath points to app.asar/resources/
    // In dev: use local resources directory
    let bundledResourcesPath;
    if (process.argv.includes('--dev')) {
      bundledResourcesPath = path.join(__dirname, '../../resources');
    } else {
      bundledResourcesPath = process.resourcesPath;
    }
    
    this.pythonPath = this.getPythonPath(bundledResourcesPath);
    this.pioPath = this.getPlatformIOPath(bundledResourcesPath);
    
    console.log('PlatformIO Manager initialized');
    console.log('Platform:', process.platform);
    console.log('Dev mode:', process.argv.includes('--dev'));
    console.log('Bundled resources path:', bundledResourcesPath);
    console.log('Working directory (MeshCore):', this.workingDirectory);
    console.log('Python path:', this.pythonPath);
    console.log('PIO path:', this.pioPath);
  }

  getPythonPath(resourcesPath) {
    const platform = process.platform;
    
    switch (platform) {
      case 'win32':
        return path.join(resourcesPath, 'python', 'python.exe');
      case 'darwin':
        return path.join(resourcesPath, 'python', 'bin', 'python3');
      case 'linux':
        return path.join(resourcesPath, 'python', 'bin', 'python3');
      default:
        return 'python3'; // Fallback to system Python
    }
  }

  getPlatformIOPath(resourcesPath) {
    const platform = process.platform;
    
    switch (platform) {
      case 'win32':
        return path.join(resourcesPath, 'platformio', 'penv', 'Scripts', 'pio.exe');
      case 'darwin':
      case 'linux':
        return path.join(resourcesPath, 'platformio', 'penv', 'bin', 'pio');
      default:
        return 'pio'; // Fallback to system PlatformIO
    }
  }

  async checkDependencies() {
    try {
      console.log('🔍 Checking dependencies...');
      console.log('Working directory:', this.workingDirectory);
      console.log('Python path:', this.pythonPath);
      console.log('PIO path:', this.pioPath);

      // Check if working directory exists
      const workingDirExists = await fs.pathExists(this.workingDirectory);
      console.log('Working directory exists:', workingDirExists);
      if (!workingDirExists) {
        throw new Error('MeshCore repository not found. Please run resource bundling first.');
      }

      // Check if Python exists
      const pythonExists = await fs.pathExists(this.pythonPath);
      console.log('Python exists:', pythonExists);
      if (!pythonExists) {
        throw new Error('Python runtime not found. Please run resource bundling first.');
      }

      // Check if PlatformIO exists
      const pioExists = await fs.pathExists(this.pioPath);
      console.log('PlatformIO exists:', pioExists);
      if (!pioExists) {
        throw new Error('PlatformIO not found. Please run resource bundling first.');
      }

      console.log('✅ All dependencies found');
      return true;
    } catch (error) {
      console.error('Dependency check failed:', error.message);
      return false;
    }
  }

  async getBoardList() {
    return Object.values(config.BOARDS);
  }

  async getVariantList(boardId) {
    if (!boardId) {
      return Object.values(config.VARIANTS);
    }
    
    return config.getVariantsForBoard(boardId);
  }

  async startBuild(buildConfig, onData, onComplete, onError) {
    if (this.isBuilding) {
      throw new Error('Build already in progress');
    }

    try {
      // Validate dependencies
      const depsOk = await this.checkDependencies();
      if (!depsOk) {
        throw new Error('Dependencies not available');
      }

      // Get board and variant configuration
      const board = config.getBoard(buildConfig.board);
      const variant = config.getVariant(buildConfig.variant);
      
      if (!board || !variant) {
        throw new Error('Invalid board or variant configuration');
      }

      // Generate PlatformIO command
      const command = config.generatePlatformIOCommand(board, variant, buildConfig.flags);
      
      console.log('Starting build with command:', command);
      
      if (onData) {
        onData(`📋 Command: ${command}\r\n`);
        onData('🚀 Starting PlatformIO build...\r\n\r\n');
      }
      
      // Execute the actual PlatformIO command
      await this.executeCommand(command, onData, onComplete, onError);
      
    } catch (error) {
      this.isBuilding = false;
      if (onError) onError(error);
    }
  }

  async startUpload(uploadConfig, onData, onComplete, onError) {
    if (this.isBuilding) {
      const error = new Error('Build/upload already in progress');
      if (onError) onError(error);
      return;
    }

    this.isBuilding = true;

    try {
      // Send initial status to terminal
      if (onData) {
        onData('🔍 Checking dependencies...\r\n');
      }

      // Validate dependencies
      const depsOk = await this.checkDependencies();
      if (!depsOk) {
        const error = new Error('Dependencies not available. Please run: npm run bundle-resources');
        if (onData) {
          onData(`❌ ${error.message}\r\n`);
          onData('💡 This will download Python runtime and PlatformIO for offline building.\r\n');
        }
        this.isBuilding = false;
        if (onError) onError(error);
        return;
      }

      if (onData) {
        onData('✅ Dependencies OK\r\n');
        onData('🔍 Validating configuration...\r\n');
      }

      // Get board configuration
      const board = config.getBoard(uploadConfig.board);
      const variant = config.getVariant(uploadConfig.variant);
      
      if (!board || !variant) {
        const error = new Error(`Invalid board (${uploadConfig.board}) or variant (${uploadConfig.variant}) configuration`);
        if (onData) onData(`❌ ${error.message}\r\n`);
        this.isBuilding = false;
        if (onError) onError(error);
        return;
      }

      if (!uploadConfig.port) {
        const error = new Error('No serial port specified for upload');
        if (onData) onData(`❌ ${error.message}\r\n`);
        this.isBuilding = false;
        if (onError) onError(error);
        return;
      }

      if (onData) {
        onData('✅ Configuration valid\r\n');
        onData('🔧 Generating build command...\r\n');
        if (uploadConfig.eraseFirst) {
          onData('🗑️ Board will be erased before upload\r\n');
        }
      }

      // Generate build flags and create custom platformio.ini if needed
      let command = config.generateUploadCommand(board, variant, uploadConfig);
      if (uploadConfig.flags || uploadConfig.customFlags) {
        const buildFlags = config.generateBuildFlags(board, variant, uploadConfig.flags, uploadConfig.customFlags);
        if (buildFlags.length > 0) {
          if (onData) {
            onData(`🔧 Build flags: ${buildFlags.map(flag => `-D${flag}`).join(' ')}\r\n`);
            onData(`🔧 Creating temporary platformio.ini with custom environment...\r\n`);
          }
          
          // Create custom environment and update command
          const customEnv = await this.createCustomEnvironment(board, variant, buildFlags, onData);
          const baseEnvName = config.getEnvironmentName(board.id, variant.id);
          command = command.replace(`-e ${baseEnvName}`, `-c "${customEnv.configPath}" -e ${customEnv.envName}`);
        }
      }
      
      console.log('Starting upload with command:', command);
      
      if (onData) {
        onData(`📋 Command: ${command}\r\n`);
        
        // Debug: Show what PlatformIO sees for our custom environment
        const debugCommand = command.replace(/--target.*/, '--target envdump');
        onData(`🔍 Debug - Running envdump to see build flags: ${debugCommand}\r\n`);
        
        onData('🚀 Starting PlatformIO upload...\r\n\r\n');
      }
      
      // Execute the actual PlatformIO command
      try {
        await this.executeCommand(command, onData, onComplete, onError);
      } finally {
        // Clean up any temporary environments
        await this.cleanupCustomEnvironments();
      }
      
    } catch (error) {
      this.isBuilding = false;
      console.error('Upload error:', error);
      if (onData) {
        onData(`❌ Unexpected error: ${error.message}\r\n`);
      }
      if (onError) onError(error);
    }
  }


  async executeCommand(command, onData, onComplete, onError) {
    return new Promise((resolve, reject) => {
      try {
        console.log('Executing command:', command);
        console.log('Working directory:', this.workingDirectory);
        
        // Execute command via shell (environment variables are in the command string)
        this.currentProcess = spawn('sh', ['-c', command], {
          cwd: this.workingDirectory,
          env: {
            ...process.env,
            PYTHONPATH: path.dirname(this.pythonPath),
            PATH: `${path.dirname(this.pioPath)}:${process.env.PATH}`
          }
        });

        this.currentProcess.stdout.on('data', (data) => {
          if (onData) onData(data.toString());
        });

        this.currentProcess.stderr.on('data', (data) => {
          if (onData) onData(data.toString());
        });

        this.currentProcess.on('close', (code, signal) => {
          this.isBuilding = false;
          this.currentProcess = null;
          
          if (signal === 'SIGTERM' || signal === 'SIGKILL') {
            // Process was stopped by user
            const result = { 
              success: false, 
              exitCode: code,
              signal: signal,
              message: 'Build stopped by user' 
            };
            if (onError) onError(result);
            reject(result);
          } else if (code === 0) {
            const result = { 
              success: true, 
              exitCode: code,
              message: 'Upload completed successfully' 
            };
            if (onComplete) onComplete(result);
            resolve(result);
          } else {
            const error = { 
              success: false, 
              exitCode: code, 
              message: `PlatformIO exited with code ${code}` 
            };
            if (onError) onError(error);
            reject(error);
          }
        });

        this.currentProcess.on('error', (error) => {
          this.isBuilding = false;
          this.currentProcess = null;
          console.error('Process error:', error);
          if (onError) onError(error);
          reject(error);
        });
        
      } catch (error) {
        this.isBuilding = false;
        console.error('Failed to execute command:', error);
        if (onError) onError(error);
        reject(error);
      }
    });
  }

  async stopBuild() {
    try {
      if (this.currentProcess) {
        console.log('Terminating PlatformIO process...');
        
        // Try graceful termination first
        this.currentProcess.kill('SIGTERM');
        
        // Force kill after 5 seconds if process doesn't terminate
        const forceKillTimeout = setTimeout(() => {
          if (this.currentProcess) {
            console.log('Force killing PlatformIO process...');
            this.currentProcess.kill('SIGKILL');
          }
        }, 5000);
        
        // Wait for process to actually terminate
        return new Promise((resolve) => {
          if (!this.currentProcess) {
            resolve();
            return;
          }
          
          this.currentProcess.on('close', () => {
            clearTimeout(forceKillTimeout);
            this.currentProcess = null;
            this.isBuilding = false;
            console.log('PlatformIO process terminated');
            resolve();
          });
          
          this.currentProcess.on('error', () => {
            clearTimeout(forceKillTimeout);
            this.currentProcess = null;
            this.isBuilding = false;
            resolve();
          });
        });
      } else {
        this.isBuilding = false;
        console.log('No active process to stop');
      }
    } catch (error) {
      console.error('Error stopping build process:', error);
      this.currentProcess = null;
      this.isBuilding = false;
      throw error;
    }
  }

  async createCustomEnvironment(board, variant, buildFlags, onData = null) {
    try {
      const baseEnvName = config.getEnvironmentName(board.id, variant.id);
      const customEnvName = `${baseEnvName}_custom`;
      
      // Format build flags for platformio.ini
      const formattedFlags = buildFlags.map(flag => `    -D${flag}`).join('\n');
      
      // Create standalone custom platformio.ini file that includes the original config
      const originalConfigPath = path.join(this.workingDirectory, 'platformio.ini');
      const originalConfig = await fs.readFile(originalConfigPath, 'utf8');
      
      const customEnvironment = `
[env:${customEnvName}]
extends = env:${baseEnvName}
build_flags = 
    \${env:${baseEnvName}.build_flags}
${formattedFlags}
`;

      const customConfig = originalConfig + customEnvironment;
      
      // Write to custom platformio file
      const customConfigPath = path.join(this.workingDirectory, 'platformio_custom.ini');
      await fs.writeFile(customConfigPath, customConfig);
      
      console.log('Created custom environment:', customEnvName);
      console.log('Custom config written to:', customConfigPath);
      
      // Debug: show only our custom environment section
      if (onData) {
        onData(`🔍 Debug - Custom environment prepended to platformio.ini:\r\n${customEnvironment}\r\n`);
      }
      
      return { envName: customEnvName, configPath: customConfigPath };
    } catch (error) {
      console.error('Failed to create custom environment:', error);
      throw error;
    }
  }

  async cleanupCustomEnvironments() {
    try {
      const customConfigPath = path.join(this.workingDirectory, 'platformio_custom.ini');
      
      if (await fs.pathExists(customConfigPath)) {
        await fs.remove(customConfigPath);
        console.log('Cleaned up custom platformio.ini file');
      }
    } catch (error) {
      console.error('Failed to cleanup custom environments:', error);
      // Don't throw - cleanup shouldn't fail the main operation
    }
  }

  isCurrentlyBuilding() {
    return this.isBuilding;
  }
}

module.exports = PlatformIOManager;