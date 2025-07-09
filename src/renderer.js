class MeshCoreForge {
    constructor() {
        this.terminal = null;
        this.buildInProgress = false;
        this.initializeApp();
    }

    async initializeApp() {
        // Display version info
        await this.loadVersionInfo();
        
        // Initialize terminal
        this.initializeTerminal();
        
        // Initialize UI components
        this.initializeControls();
        
        // Load initial data
        await this.loadBoards();
        await this.loadSerialPorts();
        await this.loadBaudRates();
        await this.loadRepoInfo();
        
        // Set up event listeners
        this.setupEventListeners();
        
        this.updateStatus('Ready');
        
        // Log debugging info
        console.log('MeshCore Forge initialized successfully');
    }

    async loadVersionInfo() {
        try {
            const version = await window.electronAPI.getVersion();
            document.getElementById('version-display').textContent = `v${version}`;
        } catch (error) {
            console.error('Failed to load version:', error);
            document.getElementById('version-display').textContent = 'v?.?.?';
        }
    }

    initializeTerminal() {
        // Initialize xterm.js terminal
        this.terminal = new Terminal({
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff',
                cursor: '#ffffff',
                selection: '#3a3a3a'
            },
            fontSize: 13,
            fontFamily: 'Courier New, monospace',
            scrollback: 1000,
            convertEol: true
        });

        // Initialize fit addon
        this.fitAddon = new FitAddon.FitAddon();
        this.terminal.loadAddon(this.fitAddon);

        // Get terminal container and remove placeholder
        const terminalContainer = document.getElementById('terminal-container');
        const placeholder = document.getElementById('terminal-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        // Open terminal in container
        this.terminal.open(terminalContainer);
        
        // Fit terminal to container
        this.fitAddon.fit();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.fitAddon.fit();
        });

        // Welcome message
        this.terminal.writeln('MeshCore Forge Terminal');
        this.terminal.writeln('Ready to build firmware...');
        this.terminal.writeln('');
    }

    initializeControls() {
        // Enable board selection
        document.getElementById('board-select').disabled = false;
        
        // Enable port refresh button
        document.getElementById('refresh-ports-btn').disabled = false;
        
        // Enable re-clone button
        document.getElementById('re-clone-btn').disabled = false;
    }

    async loadSerialPorts() {
        const portSelect = document.getElementById('port-select');
        
        try {
            console.log('Loading serial ports...');
            const ports = await window.electronAPI.listSerialPorts();
            console.log('Found serial ports:', ports);
            
            // Clear existing options except the first one
            while (portSelect.children.length > 1) {
                portSelect.removeChild(portSelect.lastChild);
            }
            
            // Add port options
            ports.forEach(port => {
                const option = document.createElement('option');
                option.value = port.path;
                option.textContent = port.displayName;
                
                // Mark likely development boards
                if (port.isLikelyDevBoard) {
                    option.textContent += ' ✓';
                }
                
                portSelect.appendChild(option);
            });
            
            // Enable port selection if we have ports
            if (ports.length > 0) {
                portSelect.disabled = false;
                this.updateStatus(`Found ${ports.length} serial port(s)`);
            } else {
                this.updateStatus('No serial ports found');
            }
            
        } catch (error) {
            console.error('Failed to load serial ports:', error);
            this.updateStatus('Error loading serial ports: ' + error.message);
        }
    }

    async loadBaudRates() {
        const baudRateSelect = document.getElementById('baud-rate-select');
        
        try {
            const baudRates = await window.electronAPI.getBaudRates();
            
            // Clear existing options
            baudRateSelect.innerHTML = '';
            
            // Add baud rate options
            baudRates.forEach(rate => {
                const option = document.createElement('option');
                option.value = rate.value;
                option.textContent = rate.label;
                
                // Select 115200 as default
                if (rate.value === 115200) {
                    option.selected = true;
                }
                
                baudRateSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Failed to load baud rates:', error);
        }
    }

    async loadRepoInfo() {
        try {
            const repoInfo = await window.electronAPI.getMeshCoreInfo();
            
            if (repoInfo && repoInfo.exists) {
                // Show repo status as ready
                document.getElementById('repo-status-text').textContent = 'Ready';
                
                // Show repo metadata
                const repoMeta = document.getElementById('repo-meta');
                repoMeta.style.display = 'block';
                
                // Update repo details
                document.getElementById('repo-commit-short').textContent = 
                    repoInfo.lastCommit?.hash?.substring(0, 7) || 'unknown';
                document.getElementById('repo-date').textContent = 
                    repoInfo.lastCommit?.date ? new Date(repoInfo.lastCommit.date).toLocaleDateString() : 'unknown';
                
            } else {
                // Show repo as not available
                document.getElementById('repo-status-text').textContent = 'Not available';
                document.getElementById('repo-meta').style.display = 'none';
            }
            
        } catch (error) {
            console.error('Failed to load repo info:', error);
            document.getElementById('repo-status-text').textContent = 'Error loading info';
        }
    }

    async loadBoards() {
        const boardSelect = document.getElementById('board-select');
        
        try {
            const boards = await window.electronAPI.getBoardList();
            
            // Clear existing options except the first one
            while (boardSelect.children.length > 1) {
                boardSelect.removeChild(boardSelect.lastChild);
            }
            
            // Add board options
            boards.forEach(board => {
                const option = document.createElement('option');
                option.value = board.id;
                option.textContent = board.name;
                boardSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Failed to load boards:', error);
            this.updateStatus('Error loading boards');
        }
    }

    async loadVariants(boardId) {
        const variantSelect = document.getElementById('variant-select');
        
        if (!boardId) {
            variantSelect.disabled = true;
            variantSelect.innerHTML = '<option value="">Select a variant...</option>';
            return;
        }

        try {
            const variants = await window.electronAPI.getVariantList(boardId);
            
            // Clear existing options
            variantSelect.innerHTML = '<option value="">Select a variant...</option>';
            
            // Add variant options
            variants.forEach(variant => {
                const option = document.createElement('option');
                option.value = variant.id;
                option.textContent = variant.name;
                variantSelect.appendChild(option);
            });
            
            variantSelect.disabled = false;
            
        } catch (error) {
            console.error('Failed to load variants:', error);
            this.updateStatus('Error loading variants');
        }
    }

    setupEventListeners() {
        // Board selection change
        document.getElementById('board-select').addEventListener('change', (e) => {
            const boardId = e.target.value;
            this.loadVariants(boardId);
            this.updateFlashButton();
        });

        // Variant selection change
        document.getElementById('variant-select').addEventListener('change', () => {
            this.updateFlashButton();
        });

        // Port refresh button
        document.getElementById('refresh-ports-btn').addEventListener('click', () => {
            this.loadSerialPorts();
        });

        // Re-clone button
        document.getElementById('re-clone-btn').addEventListener('click', () => {
            this.reCloneRepo();
        });

        // Port selection change
        document.getElementById('port-select').addEventListener('change', () => {
            this.updateFlashButton();
        });

        // Flash controls
        document.getElementById('flash-btn').addEventListener('click', () => {
            this.startFlash();
        });

        document.getElementById('stop-btn').addEventListener('click', () => {
            this.stopBuild();
        });

        // Terminal event listeners (will be implemented with xterm.js)
        window.electronAPI.onTerminalData((data) => {
            this.handleTerminalData(data);
        });

        window.electronAPI.onBuildComplete((result) => {
            this.handleBuildComplete(result);
        });

        window.electronAPI.onBuildError((error) => {
            this.handleBuildError(error);
        });

        // Resource event listeners
        window.electronAPI.onResourceStatus((message) => {
            this.updateStatus(message);
        });

        window.electronAPI.onResourceProgress((progress) => {
            this.updateStatus(progress.message || 'Processing...');
        });

        window.electronAPI.onResourceError((error) => {
            this.updateStatus(`Resource error: ${error.message || error}`);
            console.error('Resource error:', error);
        });

        window.electronAPI.onMeshCoreCloneComplete(() => {
            this.updateStatus('MeshCore repository ready');
            console.log('MeshCore clone completed');
            // Reload repo info after clone completes
            this.loadRepoInfo();
        });
    }

    updateFlashButton() {
        const boardId = document.getElementById('board-select').value;
        const variantId = document.getElementById('variant-select').value;
        const portId = document.getElementById('port-select').value;
        
        const flashBtn = document.getElementById('flash-btn');
        
        // Flash button needs board, variant, and port
        flashBtn.disabled = !boardId || !variantId || !portId || this.buildInProgress;
    }

    async startFlash() {
        const boardId = document.getElementById('board-select').value;
        const variantId = document.getElementById('variant-select').value;
        const portId = document.getElementById('port-select').value;
        
        if (!boardId || !variantId || !portId) {
            alert('Please select board, variant, and serial port');
            return;
        }

        this.buildInProgress = true;
        this.updateFlashButton();
        document.getElementById('stop-btn').disabled = false;
        
        this.updateStatus('Flashing firmware...');
        this.clearTerminal();
        
        try {
            const config = {
                board: boardId,
                variant: variantId,
                port: portId,
                flags: {}
            };
            
            // Flash combines build + upload
            await window.electronAPI.startUpload(config);
            
        } catch (error) {
            console.error('Flash failed:', error);
            this.handleBuildError(error);
        }
    }

    async stopBuild() {
        try {
            await window.electronAPI.stopBuild();
            this.updateStatus('Build stopped');
        } catch (error) {
            console.error('Failed to stop build:', error);
        }
    }

    handleTerminalData(data) {
        if (this.terminal) {
            this.terminal.write(data);
        }
    }

    handleBuildComplete(result) {
        this.buildInProgress = false;
        this.updateFlashButton();
        document.getElementById('stop-btn').disabled = true;
        
        if (result.success) {
            this.updateStatus('Flash completed successfully');
        } else {
            this.updateStatus('Flash failed');
        }
    }

    handleBuildError(error) {
        this.buildInProgress = false;
        this.updateFlashButton();
        document.getElementById('stop-btn').disabled = true;
        
        this.updateStatus(`Flash error: ${error.message || error}`);
    }

    clearTerminal() {
        if (this.terminal) {
            this.terminal.clear();
        }
    }

    async reCloneRepo() {
        try {
            document.getElementById('re-clone-btn').disabled = true;
            this.updateStatus('Re-cloning MeshCore repository...');
            
            await window.electronAPI.reCloneMeshCore();
            
            // Update status on successful completion
            this.updateStatus('MeshCore repository ready');
            
            // Reload repo info to show updated details
            await this.loadRepoInfo();
            
        } catch (error) {
            console.error('Failed to re-clone repository:', error);
            this.updateStatus(`Re-clone failed: ${error.message || error}`);
        } finally {
            document.getElementById('re-clone-btn').disabled = false;
        }
    }

    updateStatus(message) {
        document.getElementById('status-text').textContent = message;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MeshCoreForge();
});