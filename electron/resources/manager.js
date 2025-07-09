const { simpleGit } = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const { app } = require('electron');
const EventEmitter = require('events');

class ResourceManager extends EventEmitter {
  constructor() {
    super();
    
    // Use app userData directory for cross-platform compatibility
    this.appDataPath = app.getPath('userData');
    this.resourcesPath = path.join(this.appDataPath, 'resources');
    this.meshcorePath = path.join(this.resourcesPath, 'meshcore');
    this.meshcoreRepoUrl = 'https://github.com/ripplebiz/MeshCore.git';
    this.git = simpleGit();
    
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
      
      // Check if MeshCore repo exists and is valid
      const needsClone = await this.checkMeshCoreRepo();
      
      if (needsClone) {
        this.emit('status', 'Cloning MeshCore repository...');
        await this.cloneMeshCore();
      } else {
        this.emit('status', 'MeshCore repository ready');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize resources:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async checkMeshCoreRepo() {
    try {
      // Check if directory exists
      if (!await fs.pathExists(this.meshcorePath)) {
        console.log('MeshCore directory does not exist');
        return true; // Needs clone
      }

      // Check if it's a valid git repository
      const git = simpleGit(this.meshcorePath);
      const isRepo = await git.checkIsRepo();
      
      if (!isRepo) {
        console.log('MeshCore directory exists but is not a git repository');
        await fs.remove(this.meshcorePath); // Remove invalid directory
        return true; // Needs clone
      }

      // Check if it has the correct remote URL
      try {
        const remotes = await git.getRemotes(true);
        const origin = remotes.find(remote => remote.name === 'origin');
        
        if (!origin || !this.isValidMeshCoreUrl(origin.refs.fetch)) {
          console.log('MeshCore repository has incorrect remote URL');
          await fs.remove(this.meshcorePath);
          return true; // Needs clone
        }
      } catch (error) {
        console.log('Failed to check remotes, re-cloning');
        await fs.remove(this.meshcorePath);
        return true; // Needs clone
      }

      // Check if we can access the repository (basic validation)
      try {
        await git.log(['-1']); // Try to get last commit
        console.log('MeshCore repository appears valid');
        return false; // No clone needed
      } catch (error) {
        console.log('MeshCore repository appears corrupted');
        await fs.remove(this.meshcorePath);
        return true; // Needs clone
      }

    } catch (error) {
      console.error('Error checking MeshCore repo:', error);
      return true; // Default to cloning on error
    }
  }

  isValidMeshCoreUrl(url) {
    const validUrls = [
      'https://github.com/ripplebiz/MeshCore.git',
      'https://github.com/ripplebiz/MeshCore',
      'git@github.com:ripplebiz/MeshCore.git'
    ];
    return validUrls.includes(url);
  }

  async cloneMeshCore() {
    try {
      // Remove existing directory if it exists
      if (await fs.pathExists(this.meshcorePath)) {
        await fs.remove(this.meshcorePath);
      }

      console.log('Cloning MeshCore repository...');
      this.emit('progress', { stage: 'cloning', message: 'Starting clone...' });

      const git = simpleGit();
      
      // Clone with progress callback
      await git.clone(this.meshcoreRepoUrl, this.meshcorePath, {
        '--depth': 1, // Shallow clone for faster download
        '--single-branch': null // Only clone the default branch
      });

      console.log('MeshCore repository cloned successfully');
      this.emit('progress', { stage: 'complete', message: 'Clone completed' });
      this.emit('clone-complete');

      return true;
    } catch (error) {
      console.error('Failed to clone MeshCore repository:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async updateMeshCore() {
    try {
      if (!await fs.pathExists(this.meshcorePath)) {
        throw new Error('MeshCore repository not found');
      }

      this.emit('status', 'Updating MeshCore repository...');
      
      const git = simpleGit(this.meshcorePath);
      
      // Fetch latest changes
      await git.fetch();
      
      // Get current branch
      const status = await git.status();
      const currentBranch = status.current;
      
      // Pull latest changes
      await git.pull('origin', currentBranch);
      
      console.log('MeshCore repository updated successfully');
      this.emit('status', 'MeshCore repository updated');
      this.emit('update-complete');
      
      return true;
    } catch (error) {
      console.error('Failed to update MeshCore repository:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async getMeshCoreInfo() {
    try {
      if (!await fs.pathExists(this.meshcorePath)) {
        return null;
      }

      const git = simpleGit(this.meshcorePath);
      const log = await git.log(['-1']);
      const status = await git.status();
      
      return {
        path: this.meshcorePath,
        branch: status.current,
        lastCommit: {
          hash: log.latest.hash,
          message: log.latest.message,
          date: log.latest.date,
          author: log.latest.author_name
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
      this.emit('status', 'Re-cloning MeshCore repository...');
      await this.cloneMeshCore();
      this.emit('status', 'MeshCore repository re-cloned successfully');
      return true;
    } catch (error) {
      console.error('Failed to re-clone MeshCore repository:', error);
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