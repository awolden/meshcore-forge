#!/usr/bin/env node


// file bundles al the resources needed for MeshCore Forge
// including Python and PlatformIO, and prepares the resources directory structure
// for the Electron app to use at runtime

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const { createWriteStream } = require('fs');

console.log('🔧 Bundling resources for MeshCore Forge...');

// Download URLs for embedded Python
const PYTHON_DOWNLOADS = {
  'win32': 'https://github.com/indygreg/python-build-standalone/releases/download/20241016/cpython-3.11.10+20241016-x86_64-pc-windows-msvc-install_only.tar.gz',
  'darwin': 'https://github.com/indygreg/python-build-standalone/releases/download/20240107/cpython-3.11.7+20240107-x86_64-apple-darwin-install_only.tar.gz',
  'linux': 'https://github.com/indygreg/python-build-standalone/releases/download/20240107/cpython-3.11.7+20240107-x86_64-unknown-linux-gnu-install_only.tar.gz'
};

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading ${path.basename(destPath)}...`);
    
    const file = createWriteStream(destPath);
    const request = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'] || '0');
      let downloadedSize = 0;
      let lastPercent = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const percent = Math.floor((downloadedSize / totalSize) * 100);
        if (percent !== lastPercent && percent % 10 === 0) {
          console.log(`   ${percent}% complete...`);
          lastPercent = percent;
        }
      });
      
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

async function extractArchive(archivePath, extractDir) {
  console.log(`📦 Extracting ${path.basename(archivePath)}...`);
  
  const platform = process.platform;
  
  try {
    if (archivePath.endsWith('.zip')) {
      if (platform === 'win32') {
        // Use PowerShell on Windows
        execSync(`powershell -command "Expand-Archive -Path '${archivePath}' -DestinationPath '${extractDir}' -Force"`, { stdio: 'inherit' });
      } else {
        // Use system unzip for Unix-like systems
        execSync(`unzip -q "${archivePath}" -d "${extractDir}"`, { stdio: 'inherit' });
      }
    } else if (archivePath.endsWith('.tar.gz')) {
      if (platform === 'win32') {
        // Use tar command available in Windows 10+
        execSync(`tar -xzf "${archivePath}" -C "${extractDir}"`, { stdio: 'inherit' });
      } else {
        execSync(`tar -xzf "${archivePath}" -C "${extractDir}"`, { stdio: 'inherit' });
      }
    }
    
    console.log(`✅ Extracted to ${extractDir}`);
    
    // Clean up archive
    await fs.unlink(archivePath);
    
  } catch (error) {
    throw new Error(`Failed to extract ${archivePath}: ${error.message}`);
  }
}

async function installPlatformIO(pythonExecutable, platformioDir) {
  console.log('📦 Installing PlatformIO...');
  
  try {
    // Create virtual environment
    const venvDir = path.join(platformioDir, 'penv');
    console.log(`🔧 Creating virtual environment at ${venvDir}...`);
    
    // Create virtual environment without hardcoded paths
    execSync(`"${pythonExecutable}" -m venv "${venvDir}"`, { stdio: 'inherit' });
    
    // Get python executable path in venv
    const platform = process.platform;
    const venvPythonExecutable = platform === 'win32' 
      ? path.join(venvDir, 'Scripts', 'python.exe')
      : path.join(venvDir, 'bin', 'python');
    
    // Upgrade pip using the modern method
    console.log('🔧 Upgrading pip...');
    execSync(`"${venvPythonExecutable}" -m pip install --upgrade pip`, { stdio: 'inherit' });
    
    // Install PlatformIO
    console.log('📦 Installing PlatformIO core...');
    execSync(`"${venvPythonExecutable}" -m pip install platformio`, { stdio: 'inherit' });
    
    // Make the virtual environment relocatable on Windows
    if (platform === 'win32') {
      console.log('🔧 Making virtual environment relocatable...');
      const scriptsDir = path.join(venvDir, 'Scripts');
      
      // Create a batch file that uses base Python with venv PYTHONPATH
      const pioWrapperPath = path.join(scriptsDir, 'pio-wrapper.bat');
      const wrapperContent = `@echo off
set "SCRIPT_DIR=%~dp0"
set "BASE_PYTHON=%SCRIPT_DIR%..\\..\\..\\python\\python.exe"
set "VENV_SITE_PACKAGES=%SCRIPT_DIR%..\\Lib\\site-packages"
set "PYTHONPATH=%VENV_SITE_PACKAGES%"
"%BASE_PYTHON%" -m platformio %*
`;
      await fs.writeFile(pioWrapperPath, wrapperContent);
      console.log('✅ Created relocatable PlatformIO wrapper');
    }
    
    console.log('✅ PlatformIO installation completed');
    
  } catch (error) {
    throw new Error(`PlatformIO installation failed: ${error.message}`);
  }
}

async function main() {
  try {
    const appPath = path.resolve(__dirname, '..');
    const resourcesDir = path.join(appPath, 'resources');
    
    // Ensure resources directory exists
    await fs.ensureDir(resourcesDir);
    
    console.log('📁 Resources directory:', resourcesDir);
    
    const platform = process.platform;
    const pythonDir = path.join(resourcesDir, 'python');
    const platformioDir = path.join(resourcesDir, 'platformio');
    
    // Clean existing installations
    console.log('🧹 Cleaning existing resources...');
    await fs.remove(pythonDir);
    await fs.remove(platformioDir);
    
    await fs.ensureDir(pythonDir);
    await fs.ensureDir(platformioDir);
    
    // Download and install Python
    const pythonUrl = PYTHON_DOWNLOADS[platform];
    if (!pythonUrl) {
      throw new Error(`Python download not available for platform: ${platform}`);
    }
    
    const archiveExt = pythonUrl.endsWith('.zip') ? '.zip' : '.tar.gz';
    const pythonArchive = path.join(resourcesDir, `python${archiveExt}`);
    
    console.log(`🐍 Setting up Python for ${platform}...`);
    await downloadFile(pythonUrl, pythonArchive);
    await extractArchive(pythonArchive, pythonDir);
    
    // The standalone Python builds have a nested structure
    // Check if we have the nested python directory
    const nestedPythonDir = path.join(pythonDir, 'python');
    if (await fs.pathExists(nestedPythonDir)) {
      // Move contents up one level
      console.log('🔧 Restructuring Python installation...');
      const tempDir = path.join(resourcesDir, 'python_temp');
      await fs.move(nestedPythonDir, tempDir);
      await fs.remove(pythonDir);
      await fs.move(tempDir, pythonDir);
    }

    // Determine Python executable path
    let pythonExecutable;
    switch (platform) {
      case 'win32':
        pythonExecutable = path.join(pythonDir, 'python.exe');
        break;
      case 'darwin':
      case 'linux':
        pythonExecutable = path.join(pythonDir, 'bin', 'python3');
        break;
    }
    
    // Verify Python installation
    try {
      const pythonVersion = execSync(`"${pythonExecutable}" --version`, { encoding: 'utf8' });
      console.log(`✅ Python installed: ${pythonVersion.trim()}`);
    } catch (error) {
      throw new Error(`Python installation verification failed: ${error.message}`);
    }
    
    // Install PlatformIO
    await installPlatformIO(pythonExecutable, platformioDir);
    
    // Verify PlatformIO installation
    const pioExecutable = platform === 'win32'
      ? path.join(platformioDir, 'penv', 'Scripts', 'pio.exe')
      : path.join(platformioDir, 'penv', 'bin', 'pio');
    
    try {
      const pioVersion = execSync(`"${pioExecutable}" --version`, { encoding: 'utf8' });
      console.log(`✅ PlatformIO installed: ${pioVersion.trim()}`);
    } catch (error) {
      throw new Error(`PlatformIO installation verification failed: ${error.message}`);
    }
    
    console.log('\n🎉 Resource bundling completed successfully!');
    console.log('🗂️  Resources structure:');
    console.log(`   📂 ${resourcesDir}`);
    console.log(`   ├── 🐍 python/ (${pythonExecutable})`);
    console.log(`   └── ⚡ platformio/ (${pioExecutable})`);
    console.log('');
    console.log('📝 Note: MeshCore repository will be downloaded at runtime');
    
  } catch (error) {
    console.error('❌ Resource bundling failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };