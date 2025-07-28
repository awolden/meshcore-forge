const fs = require('fs-extra');
const path = require('path');
const { app } = require('electron');
const EventEmitter = require('events');
const https = require('https');
const { execSync } = require('child_process');

class ResourceManager extends EventEmitter {
  constructor() {
    super();
    
    this.appDataPath = app.getPath('userData');
    this.resourcesPath = path.join(this.appDataPath, 'resources');
    this.meshcorePath = path.join(this.resourcesPath, 'meshcore');
    this.meshcoreZipUrl = 'https://github.com/ripplebiz/MeshCore/archive/refs/heads/main.zip';
    
    console.log('ResourceManager initialized');
    console.log('Platform:', process.platform);
    console.log('App userData path:', this.appDataPath);
    console.log('Resources path:', this.resourcesPath);
    console.log('MeshCore path:', this.meshcorePath);
  }

  async initialize() {
    try {
      // Ensure resources directory exists
      await fs.ensureDir(this.resourcesPath);
      
      // Check if MeshCore source exists
      const needsDownload = await this.checkMeshCoreSource();
      
      if (needsDownload) {
        this.emit('status', 'Downloading MeshCore source...');
        await this.downloadMeshCore();
      } else {
        this.emit('status', 'MeshCore source ready');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize resources:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async checkMeshCoreSource() {
    try {
      // Check if directory exists and has essential files
      if (!await fs.pathExists(this.meshcorePath)) {
        console.log('MeshCore directory does not exist');
        return true;
      }

      // Check if it has platformio.ini (essential MeshCore file)
      const platformioIni = path.join(this.meshcorePath, 'platformio.ini');
      if (!await fs.pathExists(platformioIni)) {
        console.log('MeshCore directory exists but missing platformio.ini');
        await fs.remove(this.meshcorePath);
        return true;
      }

      console.log('MeshCore source appears valid');
      return false;

    } catch (error) {
      console.error('Error checking MeshCore source:', error);
      return true; 
    }
  }

  async downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
      console.log(`📥 Downloading ${path.basename(destPath)}...`);
      
      const file = fs.createWriteStream(destPath);
      const request = https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          return this.downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded ${path.basename(destPath)}`);
          resolve();
        });
      });
      
      request.on('error', reject);
      file.on('error', reject);
    });
  }

  async downloadMeshCore() {
    try {
      if (await fs.pathExists(this.meshcorePath)) {
        await fs.remove(this.meshcorePath);
      }

      console.log('Downloading MeshCore source...');
      this.emit('progress', { stage: 'downloading', message: 'Starting download...' });

      const zipPath = path.join(this.resourcesPath, 'meshcore.zip');
      await this.downloadFile(this.meshcoreZipUrl, zipPath);
      
      console.log('Extracting MeshCore source...');
      this.emit('progress', { stage: 'extracting', message: 'Extracting files...' });
      
      // Extract zip
      const platform = process.platform;
      if (platform === 'win32') {
        // Try multiple extraction methods for Windows
        let extractSuccess = false;
        
        // Method 1: Try tar (available in Windows 10+)
        try {
          console.log('   Trying tar extraction...');
          execSync(`tar -xf "${zipPath}" -C "${this.resourcesPath}"`, { stdio: 'inherit' });
          extractSuccess = true;
        } catch (tarError) {
          console.log('   tar extraction failed, trying PowerShell with .NET...');
          
          // Method 2: Try PowerShell with .NET compression directly
          try {
            const psCommand = `powershell -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${zipPath.replace(/'/g, "''")}', '${this.resourcesPath.replace(/'/g, "''")}')"`;
            execSync(psCommand, { stdio: 'inherit' });
            extractSuccess = true;
          } catch (psError) {
            console.log('   PowerShell .NET extraction failed, trying Expand-Archive...');
            
            // Method 3: Try original PowerShell method as fallback
            try {
              execSync(`powershell -ExecutionPolicy Bypass -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${this.resourcesPath}' -Force"`, { stdio: 'inherit' });
              extractSuccess = true;
            } catch (ps2Error) {
              throw new Error(`All Windows extraction methods failed. tar: ${tarError.message}, PS .NET: ${psError.message}, PS Expand: ${ps2Error.message}`);
            }
          }
        }
        
        if (!extractSuccess) {
          throw new Error('Failed to extract archive with any method');
        }
      } else {
        execSync(`unzip -q "${zipPath}" -d "${this.resourcesPath}"`, { stdio: 'inherit' });
      }
      
      // GitHub zip creates a folder like "MeshCore-main", rename it to "meshcore"
      const extractedDir = path.join(this.resourcesPath, 'MeshCore-main');
      if (await fs.pathExists(extractedDir)) {
        await fs.move(extractedDir, this.meshcorePath);
      }
      
      // Clean up zip file
      await fs.unlink(zipPath);

      console.log('MeshCore source downloaded successfully');
      this.emit('progress', { stage: 'complete', message: 'Download completed' });
      this.emit('clone-complete');

      return true;
    } catch (error) {
      console.error('Failed to download MeshCore source:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async updateMeshCore() {
    try {
      this.emit('status', 'Updating MeshCore source...');
      
      await this.downloadMeshCore();
      
      console.log('MeshCore source updated successfully');
      this.emit('status', 'MeshCore source updated');
      this.emit('update-complete');
      
      return true;
    } catch (error) {
      console.error('Failed to update MeshCore source:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async getMeshCoreInfo() {
    try {
      if (!await fs.pathExists(this.meshcorePath)) {
        return {
          path: this.meshcorePath,
          exists: false
        };
      }

      // Check if platformio.ini exists to verify it's a valid MeshCore source
      const platformioIni = path.join(this.meshcorePath, 'platformio.ini');
      const hasValidSource = await fs.pathExists(platformioIni);
      
      if (!hasValidSource) {
        return {
          path: this.meshcorePath,
          exists: false,
          error: 'Invalid MeshCore source'
        };
      }
      
      return {
        path: this.meshcorePath,
        branch: 'main',
        lastCommit: {
          hash: 'latest',
          message: 'Downloaded from GitHub',
          date: new Date().toISOString(),
          author: 'MeshCore Team'
        },
        exists: true
      };
    } catch (error) {
      console.error('Failed to get MeshCore info:', error);
      return {
        path: this.meshcorePath,
        exists: false,
        error: error.message
      };
    }
  }

  async forceReClone() {
    try {
      this.emit('status', 'Re-downloading MeshCore source...');
      await this.downloadMeshCore();
      this.emit('status', 'MeshCore source re-downloaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to re-download MeshCore source:', error);
      this.emit('error', error);
      throw error;
    }
  }

  getMeshCorePath() {
    return this.meshcorePath;
  }

  getResourcesPath() {
    return this.resourcesPath;
  }
}

module.exports = ResourceManager;