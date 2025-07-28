import React, { useState, useEffect, useRef } from 'react'
import { RefreshCw, Zap, Square, GitBranch, Usb, Settings } from 'lucide-react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
// Import logo from src/assets for proper Electron bundling
import darkLogoUrl from './assets/dark_logo.png'

function App() {
  const [version, setVersion] = useState('Loading...')
  const [boards, setBoards] = useState([])
  const [variants, setVariants] = useState([])
  const [serialPorts, setSerialPorts] = useState([])
  const [repoInfo, setRepoInfo] = useState(null)
  const [selectedBoard, setSelectedBoard] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('')
  const [selectedPort, setSelectedPort] = useState('')
  const [selectedVariantData, setSelectedVariantData] = useState(null)
  const [flags, setFlags] = useState({})
  const [variantUIFields, setVariantUIFields] = useState({})
  const [expandedSections, setExpandedSections] = useState({})
  const [status, setStatus] = useState('Ready')
  const [isFlashing, setIsFlashing] = useState(false)
  const [customFlags, setCustomFlags] = useState('')
  const [eraseFirst, setEraseFirst] = useState(false)
  
  // Terminal refs and state
  const terminalRef = useRef(null)
  const terminalInstanceRef = useRef(null)
  const fitAddonRef = useRef(null)

  useEffect(() => {
    console.log('App component mounted, initializing...')
    initializeApp()
  }, [])

  // Initialize terminal
  useEffect(() => {
    if (terminalRef.current && !terminalInstanceRef.current) {
      // Create terminal instance
      const terminal = new Terminal({
        theme: {
          background: '#1a1a1a',
          foreground: '#ffffff',
          cursor: '#ffffff',
          selection: '#ffffff20',
        },
        fontFamily: '"Fira Code", "Courier New", monospace',
        fontSize: 12,
        cursorBlink: true,
        convertEol: true,
        rightClickSelectsWord: true,
        allowTransparency: false,
      })

      // Create fit addon
      const fitAddon = new FitAddon()
      terminal.loadAddon(fitAddon)

      // Open terminal in DOM
      terminal.open(terminalRef.current)
      fitAddon.fit()

      // Store references
      terminalInstanceRef.current = terminal
      fitAddonRef.current = fitAddon

      // Add copy/paste support
      terminal.attachCustomKeyEventHandler((e) => {
        // Ctrl+C to copy
        if (e.ctrlKey && e.key === 'c' && e.type === 'keydown') {
          const selection = terminal.getSelection()
          if (selection) {
            navigator.clipboard.writeText(selection)
            return false
          }
        }
        // Ctrl+V to paste
        if (e.ctrlKey && e.key === 'v' && e.type === 'keydown') {
          navigator.clipboard.readText().then((text) => {
            terminal.write(text)
          })
          return false
        }
        return true
      })

      // Right-click context menu
      terminalRef.current.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        const selection = terminal.getSelection()
        
        // Create context menu
        const menu = document.createElement('div')
        menu.className = 'absolute bg-gray-800 border border-gray-600 rounded shadow-lg z-50'
        menu.style.left = `${e.pageX}px`
        menu.style.top = `${e.pageY}px`
        
        const copyItem = document.createElement('div')
        copyItem.className = 'px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-white'
        copyItem.textContent = 'Copy'
        copyItem.style.opacity = selection ? '1' : '0.5'
        copyItem.addEventListener('click', () => {
          if (selection) {
            navigator.clipboard.writeText(selection)
          }
          document.body.removeChild(menu)
        })
        
        const pasteItem = document.createElement('div')
        pasteItem.className = 'px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-white'
        pasteItem.textContent = 'Paste'
        pasteItem.addEventListener('click', () => {
          navigator.clipboard.readText().then((text) => {
            terminal.write(text)
          })
          document.body.removeChild(menu)
        })
        
        menu.appendChild(copyItem)
        menu.appendChild(pasteItem)
        document.body.appendChild(menu)
        
        // Close menu when clicking elsewhere
        const closeMenu = (event) => {
          if (!menu.contains(event.target)) {
            document.body.removeChild(menu)
            document.removeEventListener('click', closeMenu)
          }
        }
        setTimeout(() => document.addEventListener('click', closeMenu), 0)
      })

      // Welcome message
      terminal.writeln('MeshCore Forge Terminal')
      terminal.writeln('Ready to flash firmware...\r\n')

      // Handle window resize
      const handleResize = () => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit()
        }
      }

      window.addEventListener('resize', handleResize)

      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', handleResize)
        if (terminalInstanceRef.current) {
          terminalInstanceRef.current.dispose()
          terminalInstanceRef.current = null
        }
        if (fitAddonRef.current) {
          fitAddonRef.current = null
        }
      }
    }
  }, [])

  // Set up terminal event listeners
  useEffect(() => {
    if (!terminalInstanceRef.current) return

    const terminal = terminalInstanceRef.current

    // Listen for terminal data from main process
    const handleTerminalData = (data) => {
      if (terminal) {
        terminal.write(data)
      }
    }

    const handleBuildComplete = (result) => {
      if (terminal) {
        terminal.writeln(`\r\n✅ Build completed successfully!`)
        terminal.writeln(`📁 Output: ${result.outputPath || 'N/A'}`)
      }
      setIsFlashing(false)
      setStatus('Build completed')
    }

    const handleBuildError = (error) => {
      if (terminal) {
        if (error.message === 'Build stopped by user') {
          terminal.writeln(`\r\n🛑 Build stopped by user`)
        } else {
          terminal.writeln(`\r\n❌ Build failed: ${error.message || error}`)
        }
      }
      setIsFlashing(false)
      if (error.message === 'Build stopped by user') {
        setStatus('Build stopped')
      } else {
        setStatus(`Build failed: ${error.message || error}`)
      }
    }

    // Set up event listeners
    window.electronAPI.onTerminalData(handleTerminalData)
    window.electronAPI.onBuildComplete(handleBuildComplete)
    window.electronAPI.onBuildError(handleBuildError)

    // Cleanup
    return () => {
      window.electronAPI.removeAllListeners('terminal-data')
      window.electronAPI.removeAllListeners('build-complete')
      window.electronAPI.removeAllListeners('build-error')
    }
  }, [])

  // Fit terminal when container size changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        setTimeout(() => {
          fitAddonRef.current.fit()
        }, 100)
      }
    })

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const initializeApp = async () => {
    try {
      // Load version
      const ver = await window.electronAPI.getVersion()
      setVersion(`v${ver}`)

      // Load boards
      const boardList = await window.electronAPI.getBoardList()
      setBoards(boardList)

      // Load serial ports
      await loadSerialPorts()

      // Load repo info
      await loadRepoInfo()

      setStatus('Ready')
    } catch (error) {
      console.error('Failed to initialize app:', error)
      setStatus('Initialization failed')
    }
  }

  const loadSerialPorts = async () => {
    try {
      const ports = await window.electronAPI.listSerialPorts()
      setSerialPorts(ports)
      
      if (ports.length > 0) {
        setStatus(`Found ${ports.length} serial port(s)`)
      } else {
        setStatus('No serial ports found')
      }
    } catch (error) {
      console.error('Failed to load serial ports:', error)
      setStatus('Error loading serial ports')
    }
  }

  const loadRepoInfo = async () => {
    try {
      const info = await window.electronAPI.getMeshCoreInfo()
      setRepoInfo(info)
    } catch (error) {
      console.error('Failed to load repo info:', error)
    }
  }

  const handleBoardChange = async (boardId) => {
    setSelectedBoard(boardId)
    setSelectedVariant('')
    setSelectedVariantData(null)
    setFlags({})
    
    if (boardId) {
      try {
        const variantList = await window.electronAPI.getVariantList(boardId)
        setVariants(variantList)
      } catch (error) {
        console.error('Failed to load variants:', error)
      }
    } else {
      setVariants([])
    }
  }

  const handleVariantChange = async (variantId) => {
    setSelectedVariant(variantId)
    const variantData = variants.find(v => v.id === variantId)
    setSelectedVariantData(variantData)
    
    if (variantId && variantData) {
      try {
        // Get dynamic UI fields for this variant
        const uiFields = await window.electronAPI.getVariantUIFields(variantData)
        setVariantUIFields(uiFields)
        
        // Reset flags when variant changes
        const newFlags = {}
        
        // Set default values for variant-specific flags
        Object.values(uiFields).forEach(group => {
          group.forEach(field => {
            if (field.defaultValue !== undefined && field.defaultValue !== '') {
              newFlags[field.key] = field.defaultValue
            }
          })
        })
        
        setFlags(newFlags)
        
        // Auto-expand first few sections
        const sectionNames = Object.keys(uiFields)
        const autoExpand = {
          'Custom Build Flags': false
        }
        // Expand first 2 variant-specific sections
        sectionNames.slice(0, 2).forEach(name => {
          autoExpand[name] = true
        })
        setExpandedSections(autoExpand)
        
      } catch (error) {
        console.error('Failed to load variant UI fields:', error)
      }
    } else {
      setVariantUIFields({})
      setExpandedSections({})
    }
  }

  const updateFlag = (key, value) => {
    setFlags(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleFlash = async () => {
    if (!selectedBoard || !selectedVariant || !selectedPort) {
      alert('Please select board, variant, and serial port')
      return
    }

    // Clear terminal before starting
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.clear()
      terminalInstanceRef.current.writeln('🚀 Starting firmware flash...')
      terminalInstanceRef.current.writeln(`📋 Board: ${selectedBoard}`)
      terminalInstanceRef.current.writeln(`🔧 Variant: ${selectedVariant}`)
      terminalInstanceRef.current.writeln(`🔌 Port: ${selectedPort}`)
      terminalInstanceRef.current.writeln('')
    }

    setIsFlashing(true)
    setStatus('Flashing firmware...')

    try {
      const config = {
        board: selectedBoard,
        variant: selectedVariant,
        port: selectedPort,
        flags: flags,
        customFlags: customFlags,
        eraseFirst: eraseFirst
      }

      await window.electronAPI.startUpload(config)
    } catch (error) {
      console.error('Flash failed:', error)
      setStatus(`Flash failed: ${error.message}`)
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.writeln(`\r\n❌ Flash failed: ${error.message}`)
      }
      setIsFlashing(false)
    }
  }

  const handleStopFlash = async () => {
    try {
      setStatus('Stopping flash...')
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.writeln('\r\n🛑 Stopping flash process...')
      }
      
      await window.electronAPI.stopBuild()
      
      setIsFlashing(false)
      setStatus('Flash stopped')
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.writeln('✅ Flash process stopped')
      }
    } catch (error) {
      console.error('Failed to stop flash:', error)
      setStatus(`Stop failed: ${error.message}`)
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.writeln(`❌ Failed to stop: ${error.message}`)
      }
    }
  }

  const handleReClone = async () => {
    try {
      setStatus('Re-cloning MeshCore repository...')
      await window.electronAPI.reCloneMeshCore()
      setStatus('MeshCore repository ready')
      // Refresh repo info
      await loadRepoInfo()
    } catch (error) {
      console.error('Re-clone failed:', error)
      setStatus(`Re-clone failed: ${error.message}`)
    }
  }

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  const renderFieldInput = (field) => {
    const value = flags[field.key] || field.defaultValue || ''

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateFlag(field.key, e.target.value)}
            placeholder={field.description}
            className="w-full px-2 py-1 bg-dark-bg border border-dark-border text-dark-text text-xs rounded focus:border-blue-500 focus:outline-none"
          />
        )
      case 'password':
        return (
          <input
            type="password"
            value={value}
            onChange={(e) => updateFlag(field.key, e.target.value)}
            placeholder={field.description}
            className="w-full px-2 py-1 bg-dark-bg border border-dark-border text-dark-text text-xs rounded focus:border-blue-500 focus:outline-none"
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateFlag(field.key, e.target.value)}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            className="w-full px-2 py-1 bg-dark-bg border border-dark-border text-dark-text text-xs rounded focus:border-blue-500 focus:outline-none"
          />
        )
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => updateFlag(field.key, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-xs text-dark-muted">{field.name}</span>
          </label>
        )
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateFlag(field.key, e.target.value)}
            className="w-full px-2 py-1 bg-dark-bg border border-dark-border text-dark-text text-xs rounded focus:border-blue-500 focus:outline-none"
          >
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      default:
        return null
    }
  }

  const renderFieldGroup = (groupName, fields) => {
    const isExpanded = expandedSections[groupName]
    const hasFields = fields && fields.length > 0

    if (!hasFields) return null

    return (
      <div key={groupName} className="mb-4">
        <button
          onClick={() => toggleSection(groupName)}
          className="w-full flex items-center justify-between text-xs font-medium text-dark-muted uppercase tracking-wide py-2 hover:text-dark-text transition-colors"
        >
          <span>{groupName}</span>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
        </button>
        
        {isExpanded && (
          <div className="space-y-3 pl-2">
            {fields.map(field => (
              <div key={field.key}>
                {field.type === 'checkbox' ? (
                  renderFieldInput(field)
                ) : (
                  <>
                    <label className="block text-xs text-dark-muted mb-1">
                      {field.name} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    {renderFieldInput(field)}
                    {field.description && field.type !== 'checkbox' && (
                      <p className="text-xs text-dark-muted mt-1">{field.description}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const canFlash = selectedBoard && selectedVariant && selectedPort && !isFlashing

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-dark-text">
      {/* Header */}
      <header className="bg-dark-panel border-b border-dark-border px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <img src={darkLogoUrl} alt="MeshCore" className="h-8" />
          <span className="text-2xl font-inter font-medium text-dark-text tracking-wide">Forge</span>
        </div>
        <span className="text-xs text-dark-muted">{version}</span>
      </header>

      {/* Status Bar */}
      <div className="bg-dark-panel border-b border-dark-border px-5 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          {/* Repo Info */}
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-green-500" />
            <span className="text-dark-muted">
              {repoInfo?.exists ? 
                `${repoInfo.lastCommit?.hash?.substring(0, 7) || 'unknown'}` : 
                'No repo'
              }
            </span>
            <button
              onClick={handleReClone}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
            >
              Re-clone
            </button>
          </div>

          {/* Serial Port */}
          <div className="flex items-center gap-2">
            <Usb size={14} className="text-blue-500" />
            <select
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
              className="px-2 py-1 bg-dark-bg border border-dark-border text-dark-text text-xs rounded focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select port...</option>
              {serialPorts.map(port => (
                <option key={port.path} value={port.path}>
                  {port.displayName} {port.isLikelyDevBoard ? '✓' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={loadSerialPorts}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        <div className="text-dark-text">{status}</div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Config Panel */}
        <div className="w-80 bg-dark-panel border-r border-dark-border p-4 overflow-y-auto space-y-4">
          
          {/* Board Selection */}
          <section>
            <h2 className="text-sm font-semibold mb-2">Board</h2>
            <select
              value={selectedBoard}
              onChange={(e) => handleBoardChange(e.target.value)}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border text-dark-text text-sm rounded focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select a board...</option>
              {boards.map(board => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </section>

          {/* Variant Selection */}
          <section>
            <h2 className="text-sm font-semibold mb-2">Variant</h2>
            <select
              value={selectedVariant}
              onChange={(e) => handleVariantChange(e.target.value)}
              disabled={!selectedBoard}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border text-dark-text text-sm rounded focus:border-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Select a variant...</option>
              {variants.map(variant => (
                <option key={variant.id} value={variant.id}>
                  {variant.name}
                </option>
              ))}
            </select>
            {selectedVariantData && (
              <p className="text-xs text-dark-muted mt-1">{selectedVariantData.description}</p>
            )}
          </section>

          {/* Configuration Flags */}
          {selectedVariant && (
            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Settings size={16} />
                Configuration
              </h2>
              

              {/* Dynamic variant-specific field groups */}
              {Object.entries(variantUIFields).map(([groupName, fields]) => 
                renderFieldGroup(groupName, fields)
              )}
              
              {/* Custom Flags */}
              <div className="space-y-3 mb-4">
                <button
                  onClick={() => toggleSection('Custom Build Flags')}
                  className="w-full flex items-center justify-between text-xs font-medium text-dark-muted uppercase tracking-wide py-2 hover:text-dark-text transition-colors"
                >
                  <span>Custom Build Flags</span>
                  <span className={`transform transition-transform ${expandedSections['Custom Build Flags'] ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                </button>
                
                {expandedSections['Custom Build Flags'] && (
                  <div className="space-y-3 pl-2">
                    <div>
                      <label className="block text-xs text-dark-muted mb-1">Additional Flags</label>
                      <textarea
                        value={customFlags}
                        onChange={(e) => setCustomFlags(e.target.value)}
                        placeholder="-DMESH_PACKET_LOGGING=1 -DMESH_DEBUG=1"
                        rows={3}
                        className="w-full px-2 py-1 bg-dark-bg border border-dark-border text-dark-text text-xs rounded focus:border-blue-500 focus:outline-none font-mono whitespace-nowrap overflow-x-auto"
                        style={{ wordBreak: 'keep-all', whiteSpace: 'pre' }}
                      />
                      <p className="text-xs text-dark-muted mt-1">
                        Add custom build flags (one per line or space-separated). Format: -DFLAG=value
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Flash Controls */}
          <section className="pt-4 border-t border-dark-border">
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eraseFirst}
                  onChange={(e) => setEraseFirst(e.target.checked)}
                  disabled={isFlashing}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                Erase board first
              </label>
            </div>
            <button
              onClick={isFlashing ? handleStopFlash : handleFlash}
              disabled={!canFlash && !isFlashing}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {isFlashing ? <Square size={16} /> : <Zap size={16} />}
              {isFlashing ? 'Stop Flash' : 'Flash Firmware'}
            </button>
          </section>
        </div>

        {/* Terminal Panel */}
        <div className="flex-1 flex flex-col p-4">
          <h2 className="text-sm font-semibold mb-3">Build Output</h2>
          <div className="flex-1 bg-dark-bg border border-dark-border rounded overflow-hidden">
            <div 
              ref={terminalRef}
              className="w-full h-full"
              style={{ padding: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App