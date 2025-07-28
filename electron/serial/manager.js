const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const EventEmitter = require('events');

class SerialPortManager extends EventEmitter {
  constructor() {
    super();
    this.connectedPort = null;
    this.parser = null;
    this.isMonitoring = false;
  }

  async listPorts(retryCount = 0) {
    try {
      const ports = await SerialPort.list();
      
      // On Windows, sometimes first call returns empty, retry once
      if (process.platform === 'win32' && ports.length === 0 && retryCount === 0) {
        console.log('No ports found on first try, retrying in 500ms...');
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.listPorts(1);
      }
      
      // Filter for likely development boards
      const filteredPorts = ports.filter(port => {
        const vendorId = port.vendorId?.toLowerCase();
        const manufacturer = port.manufacturer?.toLowerCase();
        const productId = port.productId?.toLowerCase();
        
        // Common ESP32, Arduino, and development board identifiers
        const knownVendors = [
          '10c4', // Silicon Labs (ESP32)
          '1a86', // QinHeng Electronics (CH340)
          '0403', // FTDI
          '2341', // Arduino
          '2886', // Seeed Studio
          '1915', // Nordic Semiconductor
          '239a', // Adafruit
          '04d8', // Microchip
          '16c0', // Van Ooijen Technische Informatica
          '1b4f', // SparkFun
          '303a'  // Espressif Systems
        ];
        
        const knownManufacturers = [
          'silicon labs',
          'ftdi',
          'arduino',
          'seeed',
          'adafruit',
          'espressif',
          'nordic',
          'microchip',
          'sparkfun',
          'wch',
          'qinheng'
        ];
        
        return knownVendors.includes(vendorId) || 
               knownManufacturers.some(mfg => manufacturer?.includes(mfg));
      });
      
      // Return all ports but mark likely development boards
      return ports.map(port => ({
        ...port,
        isLikelyDevBoard: filteredPorts.includes(port),
        displayName: this.getPortDisplayName(port)
      }));
      
    } catch (error) {
      console.error('Failed to list serial ports:', error);
      
      // Windows-specific error handling
      if (process.platform === 'win32') {
        console.error('Windows serial port detection failed.');
        console.error('Possible solutions:');
        console.error('1. Make sure device drivers are installed');
        console.error('2. Check Device Manager for serial/COM ports');
        console.error('3. Try running as administrator');
        console.error('4. Ensure serialport module was rebuilt with electron-rebuild');
        
        // Return empty array with helpful message instead of throwing
        return [{
          path: 'No ports detected',
          manufacturer: 'Windows Error',
          serialNumber: undefined,
          pnpId: undefined,
          locationId: undefined,
          vendorId: undefined,
          productId: undefined,
          isLikelyDevBoard: false,
          displayName: 'No serial ports detected - check drivers and permissions'
        }];
      }
      
      throw error;
    }
  }

  getPortDisplayName(port) {
    let name = port.path;
    
    if (port.manufacturer) {
      name += ` (${port.manufacturer}`;
      if (port.productId) {
        name += ` - ${port.productId}`;
      }
      name += ')';
    } else if (port.vendorId) {
      name += ` (${port.vendorId}:${port.productId || 'unknown'})`;
    }
    
    return name;
  }

  async connect(portPath, baudRate = 115200) {
    try {
      if (this.connectedPort) {
        await this.disconnect();
      }

      this.connectedPort = new SerialPort({
        path: portPath,
        baudRate: baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        autoOpen: false
      });

      return new Promise((resolve, reject) => {
        this.connectedPort.open((error) => {
          if (error) {
            reject(error);
            return;
          }

          this.parser = this.connectedPort.pipe(new ReadlineParser({ delimiter: '\n' }));
          
          this.connectedPort.on('error', (error) => {
            console.error('Serial port error:', error);
            this.emit('error', error);
          });

          this.connectedPort.on('close', () => {
            console.log('Serial port closed');
            this.emit('disconnected');
            this.connectedPort = null;
            this.parser = null;
            this.isMonitoring = false;
          });

          this.parser.on('data', (data) => {
            if (this.isMonitoring) {
              this.emit('data', data);
            }
          });

          resolve({
            path: portPath,
            baudRate: baudRate,
            connected: true
          });
        });
      });
    } catch (error) {
      console.error('Failed to connect to serial port:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connectedPort && this.connectedPort.isOpen) {
      return new Promise((resolve) => {
        this.connectedPort.close(() => {
          resolve();
        });
      });
    }
  }

  async startMonitoring() {
    if (!this.connectedPort || !this.connectedPort.isOpen) {
      throw new Error('No serial port connected');
    }

    this.isMonitoring = true;
    this.emit('monitoring-started');
  }

  async stopMonitoring() {
    this.isMonitoring = false;
    this.emit('monitoring-stopped');
  }

  async write(data) {
    if (!this.connectedPort || !this.connectedPort.isOpen) {
      throw new Error('No serial port connected');
    }

    return new Promise((resolve, reject) => {
      this.connectedPort.write(data, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  isConnected() {
    return this.connectedPort && this.connectedPort.isOpen;
  }

  getConnectionInfo() {
    if (!this.connectedPort) {
      return null;
    }

    return {
      path: this.connectedPort.path,
      baudRate: this.connectedPort.baudRate,
      connected: this.connectedPort.isOpen,
      monitoring: this.isMonitoring
    };
  }

  async resetDevice() {
    if (!this.connectedPort || !this.connectedPort.isOpen) {
      throw new Error('No serial port connected');
    }

    try {
      // Toggle DTR and RTS to reset most microcontrollers
      await this.connectedPort.set({ dtr: false, rts: false });
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.connectedPort.set({ dtr: true, rts: true });
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.connectedPort.set({ dtr: false, rts: false });
    } catch (error) {
      console.error('Failed to reset device:', error);
      throw error;
    }
  }

  // Get common baud rates for development boards
  static getCommonBaudRates() {
    return [
      { value: 9600, label: '9600' },
      { value: 19200, label: '19200' },
      { value: 38400, label: '38400' },
      { value: 57600, label: '57600' },
      { value: 115200, label: '115200' },
      { value: 230400, label: '230400' },
      { value: 460800, label: '460800' },
      { value: 921600, label: '921600' }
    ];
  }
}

module.exports = SerialPortManager;