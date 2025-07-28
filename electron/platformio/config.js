const BOARDS = {
  // Popular ESP32-based boards
  heltec_v3: {
    id: 'heltec_v3',
    name: 'Heltec LoRa32 V3',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_wifi', 'companion_usb', 'repeater', 'room_server', 'terminal_chat']
  },
  heltec_v2: {
    id: 'heltec_v2',
    name: 'Heltec LoRa32 V2',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater', 'room_server', 'terminal_chat']
  },
  lilygo_tbeam_SX1262: {
    id: 'lilygo_tbeam_SX1262',
    name: 'LilyGo T-Beam SX1262',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'repeater']
  },
  lilygo_tbeam_SX1276: {
    id: 'lilygo_tbeam_SX1276',
    name: 'LilyGo T-Beam SX1276',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'repeater']
  },
  lilygo_t3s3: {
    id: 'lilygo_t3s3',
    name: 'LilyGo T3-S3 SX1262',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater', 'room_server', 'terminal_chat']
  },
  heltec_tracker: {
    id: 'heltec_tracker',
    name: 'Heltec Wireless Tracker',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'repeater', 'room_server']
  },
  
  // Popular NRF52-based boards
  rak4631: {
    id: 'rak4631',
    name: 'RAK4631',
    platform: 'nordicnrf52',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater', 'room_server', 'terminal_chat'],
    postProcess: 'hex_to_uf2'
  },
  techo: {
    id: 'techo',
    name: 'LilyGo T-Echo',
    platform: 'nordicnrf52',
    framework: 'arduino',
    variants: ['companion_ble', 'repeater', 'room_server'],
    postProcess: 'hex_to_uf2'
  },
  t114: {
    id: 't114',
    name: 'Heltec T114',
    platform: 'nordicnrf52',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater', 'room_server'],
    postProcess: 'hex_to_uf2'
  },
  
  // Development/Maker boards
  xiao_nrf52: {
    id: 'xiao_nrf52',
    name: 'XIAO NRF52840',
    platform: 'nordicnrf52',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater', 'room_server'],
    postProcess: 'hex_to_uf2'
  },
  xiao_c3: {
    id: 'xiao_c3',
    name: 'XIAO ESP32-C3',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['repeater']
  },
  station_g2: {
    id: 'station_g2',
    name: 'Station G2',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater', 'room_server']
  },
  
  // RP2040 boards
  picow: {
    id: 'picow',
    name: 'Raspberry Pi Pico W',
    platform: 'rp2040',
    framework: 'arduino',
    variants: ['companion_usb', 'repeater', 'room_server', 'terminal_chat']
  },
  
  // STM32 boards
  rak3x72: {
    id: 'rak3x72',
    name: 'RAK3x72',
    platform: 'stm32wl',
    framework: 'arduino',
    variants: ['companion_usb', 'repeater']
  },
  wio_e5_dev: {
    id: 'wio_e5_dev',
    name: 'WIO-E5 Dev Board',
    platform: 'stm32wl',
    framework: 'arduino',
    variants: ['companion_usb', 'repeater']
  },
  wio_e5_mini: {
    id: 'wio_e5_mini',
    name: 'WIO-E5 Mini',
    platform: 'stm32wl',
    framework: 'arduino',
    variants: ['companion_usb', 'repeater']
  },
  
  // More ESP32 boards
  generic_e22: {
    id: 'generic_e22',
    name: 'Generic E22',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['repeater']
  },
  generic_espnow: {
    id: 'generic_espnow',
    name: 'Generic ESP-NOW',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_usb', 'repeater', 'room_server', 'terminal_chat']
  },
  heltec_ct62: {
    id: 'heltec_ct62',
    name: 'Heltec HT-CT62',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater']
  },
  heltec_wireless_paper: {
    id: 'heltec_wireless_paper',
    name: 'Heltec Wireless Paper',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'repeater', 'room_server']
  },
  lilygo_t3s3_sx1276: {
    id: 'lilygo_t3s3_sx1276',
    name: 'LilyGo T3-S3 SX1276',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater', 'room_server', 'terminal_chat']
  },
  lilygo_tbeam_supreme_SX1262: {
    id: 'lilygo_tbeam_supreme_SX1262',
    name: 'LilyGo T-Beam S3 Supreme',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'repeater', 'room_server']
  },
  lilygo_tlora_c6: {
    id: 'lilygo_tlora_c6',
    name: 'LilyGo T-LoRa C6',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'repeater', 'room_server']
  },
  lilygo_tlora_v2_1: {
    id: 'lilygo_tlora_v2_1',
    name: 'LilyGo T-LoRa V2.1-1.6',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater', 'room_server', 'terminal_chat']
  },
  meshadventurer: {
    id: 'meshadventurer',
    name: 'Meshadventurer',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater', 'room_server', 'terminal_chat']
  },
  tenstar_c3: {
    id: 'tenstar_c3',
    name: 'Tenstar ESP32-C3',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['repeater']
  },
  xiao_c6: {
    id: 'xiao_c6',
    name: 'XIAO ESP32-C6',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'repeater']
  },
  xiao_s3_wio: {
    id: 'xiao_s3_wio',
    name: 'XIAO ESP32-S3 WIO',
    platform: 'espressif32',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater', 'room_server', 'terminal_chat']
  },
  
  // More NRF52 boards
  nano_g2_ultra: {
    id: 'nano_g2_ultra',
    name: 'Nano G2 Ultra',
    platform: 'nordicnrf52',
    framework: 'arduino',
    variants: ['companion_ble'],
    postProcess: 'hex_to_uf2'
  },
  promicro: {
    id: 'promicro',
    name: 'Faketec/Pro Micro NRF52840',
    platform: 'nordicnrf52',
    framework: 'arduino',
    variants: ['companion_ble', 'companion_usb', 'repeater', 'room_server', 'terminal_chat'],
    postProcess: 'hex_to_uf2'
  },
  t1000_e: {
    id: 't1000_e',
    name: 'T1000-E',
    platform: 'nordicnrf52',
    framework: 'arduino',
    variants: ['companion_ble'],
    postProcess: 'hex_to_uf2'
  },
  thinknode_m1: {
    id: 'thinknode_m1',
    name: 'ThinkNode M1',
    platform: 'nordicnrf52',
    framework: 'arduino',
    variants: ['companion_ble', 'repeater', 'room_server'],
    postProcess: 'hex_to_uf2'
  },
  
  // More RP2040 boards
  waveshare_rp2040_lora: {
    id: 'waveshare_rp2040_lora',
    name: 'Waveshare RP2040-LoRa',
    platform: 'rp2040',
    framework: 'arduino',
    variants: ['companion_usb', 'repeater', 'room_server', 'terminal_chat']
  }
};

const ROLES = {
  companion_ble: {
    id: 'companion_ble',
    name: 'Companion BLE',
    description: 'Bluetooth Low Energy companion device for smartphone apps',
    requiredFlags: [
      'MAX_CONTACTS',
      'MAX_GROUP_CHANNELS',
      'BLE_PIN_CODE',
      'OFFLINE_QUEUE_SIZE'
    ],
    optionalFlags: [
      'BLE_DEBUG_LOGGING',
      'BLE_NAME_PREFIX'
    ]
  },
  companion_wifi: {
    id: 'companion_wifi', 
    name: 'Companion WiFi',
    description: 'WiFi companion device for network connectivity',
    requiredFlags: [
      'MAX_CONTACTS',
      'MAX_GROUP_CHANNELS',
      'TCP_PORT'
    ],
    optionalFlags: [
      'WIFI_SSID',
      'WIFI_PWD',
      'WIFI_DEBUG_LOGGING'
    ]
  },
  companion_usb: {
    id: 'companion_usb',
    name: 'Companion USB',
    description: 'USB/Serial companion device',
    requiredFlags: [
      'MAX_CONTACTS',
      'MAX_GROUP_CHANNELS'
    ],
    optionalFlags: [
      'SERIAL_RX',
      'SERIAL_TX'
    ]
  },
  repeater: {
    id: 'repeater',
    name: 'Repeater',
    description: 'LoRa mesh repeater node',
    requiredFlags: [
      'ADVERT_NAME',
      'ADVERT_LAT',
      'ADVERT_LON',
      'ADMIN_PASSWORD',
      'MAX_NEIGHBOURS'
    ],
    optionalFlags: [
      'GUEST_PASSWORD',
      'PERSISTANT_GPS',
      'FORCE_GPS_ALIVE'
    ]
  },
  room_server: {
    id: 'room_server',
    name: 'Room Server',
    description: 'Room-based chat server node',
    requiredFlags: [
      'ADVERT_NAME',
      'ADVERT_LAT',
      'ADVERT_LON', 
      'ADMIN_PASSWORD',
      'ROOM_PASSWORD'
    ],
    optionalFlags: [
      'MAX_CLIENTS',
      'MAX_UNSYNCED_POSTS',
      'SERVER_RESPONSE_DELAY',
      'TXT_ACK_DELAY'
    ]
  },
  terminal_chat: {
    id: 'terminal_chat',
    name: 'Terminal Chat',
    description: 'Terminal-based secure chat application',
    requiredFlags: [
      'MAX_CONTACTS',
      'MAX_GROUP_CHANNELS'
    ],
    optionalFlags: []
  }
};

// Environment mapping: board+variant -> PlatformIO environment name
const ENVIRONMENT_MAP = {
  'heltec_v3': {
    'companion_ble': 'Heltec_v3_companion_radio_ble',
    'companion_wifi': 'Heltec_v3_companion_radio_wifi',
    'companion_usb': 'Heltec_v3_companion_radio_usb',
    'repeater': 'Heltec_v3_repeater',
    'room_server': 'Heltec_v3_room_server',
    'terminal_chat': 'Heltec_v3_terminal_chat'
  },
  'heltec_v2': {
    'companion_ble': 'Heltec_v2_companion_radio_ble',
    'companion_usb': 'Heltec_v2_companion_radio_usb',
    'repeater': 'Heltec_v2_repeater',
    'room_server': 'Heltec_v2_room_server',
    'terminal_chat': 'Heltec_v2_terminal_chat'
  },
  'lilygo_tbeam_SX1262': {
    'companion_ble': 'Tbeam_SX1262_companion_radio_ble',
    'repeater': 'Tbeam_SX1262_repeater'
  },
  'lilygo_tbeam_SX1276': {
    'companion_ble': 'Tbeam_SX1276_companion_radio_ble',
    'repeater': 'Tbeam_SX1276_repeater'
  },
  'lilygo_t3s3': {
    'companion_ble': 'LilyGo_T3S3_sx1262_companion_radio_ble',
    'companion_usb': 'LilyGo_T3S3_sx1262_companion_radio_usb',
    'repeater': 'LilyGo_T3S3_sx1262_Repeater',
    'room_server': 'LilyGo_T3S3_sx1262_room_server',
    'terminal_chat': 'LilyGo_T3S3_sx1262_terminal_chat'
  },
  'heltec_tracker': {
    'companion_ble': 'Heltec_Wireless_Tracker_companion_radio_ble',
    'repeater': 'Heltec_Wireless_Tracker_repeater',
    'room_server': 'Heltec_Wireless_Tracker_room_server'
  },
  'rak4631': {
    'companion_ble': 'RAK_4631_companion_radio_ble',
    'companion_usb': 'RAK_4631_companion_radio_usb',
    'repeater': 'RAK_4631_Repeater',
    'room_server': 'RAK_4631_room_server',
    'terminal_chat': 'RAK_4631_terminal_chat'
  },
  'techo': {
    'companion_ble': 'LilyGo_T-Echo_companion_radio_ble',
    'repeater': 'LilyGo_T-Echo_repeater',
    'room_server': 'LilyGo_T-Echo_room_server'
  },
  't114': {
    'companion_ble': 'Heltec_t114_companion_radio_ble',
    'companion_usb': 'Heltec_t114_companion_radio_usb',
    'repeater': 'Heltec_t114_repeater',
    'room_server': 'Heltec_t114_room_server'
  },
  'xiao_nrf52': {
    'companion_ble': 'Xiao_nrf52_companion_radio_ble',
    'companion_usb': 'Xiao_nrf52_companion_radio_usb',
    'repeater': 'Xiao_nrf52_repeater',
    'room_server': 'Xiao_nrf52_room_server'
  },
  'xiao_c3': {
    'repeater': 'Xiao_C3_Repeater_sx1262'
  },
  'station_g2': {
    'companion_ble': 'Station_G2_companion_radio_ble',
    'companion_usb': 'Station_G2_companion_radio_usb',
    'repeater': 'Station_G2_repeater',
    'room_server': 'Station_G2_room_server'
  },
  'picow': {
    'companion_usb': 'PicoW_companion_radio_usb',
    'repeater': 'PicoW_Repeater',
    'room_server': 'PicoW_room_server',
    'terminal_chat': 'PicoW_terminal_chat'
  },
  'rak3x72': {
    'companion_usb': 'rak3x72_companion_radio_usb',
    'repeater': 'rak3x72-repeater'
  },
  'wio_e5_dev': {
    'companion_usb': 'wio-e5_companion_radio_usb',
    'repeater': 'wio-e5-repeater'
  },
  'wio_e5_mini': {
    'companion_usb': 'wio-e5-mini_companion_radio_usb',
    'repeater': 'wio-e5-mini-repeater'
  },
  'generic_e22': {
    'repeater': 'Generic_E22_sx1262_repeater'
  },
  'generic_espnow': {
    'companion_usb': 'Generic_ESPNOW_comp_radio_usb',
    'repeater': 'Generic_ESPNOW_repeatr',
    'room_server': 'Generic_ESPNOW_room_svr',
    'terminal_chat': 'Generic_ESPNOW_terminal_chat'
  },
  'heltec_ct62': {
    'companion_ble': 'Heltec_ct62_companion_radio_ble',
    'companion_usb': 'Heltec_ct62_companion_radio_usb',
    'repeater': 'Heltec_ct62_repeater'
  },
  'heltec_wireless_paper': {
    'companion_ble': 'Heltec_Wireless_Paper_companion_radio_ble',
    'repeater': 'Heltec_Wireless_Paper_repeater',
    'room_server': 'Heltec_Wireless_Paper_room_server'
  },
  'lilygo_t3s3_sx1276': {
    'companion_ble': 'LilyGo_T3S3_sx1276_companion_radio_ble',
    'companion_usb': 'LilyGo_T3S3_sx1276_companion_radio_usb',
    'repeater': 'LilyGo_T3S3_sx1276_Repeater',
    'room_server': 'LilyGo_T3S3_sx1276_room_server',
    'terminal_chat': 'LilyGo_T3S3_sx1276_terminal_chat'
  },
  'lilygo_tbeam_supreme_SX1262': {
    'companion_ble': 'T_Beam_S3_Supreme_SX1262_companion_radio_ble',
    'repeater': 'T_Beam_S3_Supreme_SX1262_repeater',
    'room_server': 'T_Beam_S3_Supreme_SX1262_room_server'
  },
  'lilygo_tlora_c6': {
    'companion_ble': 'LilyGo_Tlora_C6_companion_radio_ble',
    'repeater': 'LilyGo_Tlora_C6_repeater',
    'room_server': 'LilyGo_Tlora_C6_room_server'
  },
  'lilygo_tlora_v2_1': {
    'companion_ble': 'LilyGo_TLora_V2_1_1_6_companion_radio_ble',
    'companion_usb': 'LilyGo_TLora_V2_1_1_6_companion_radio_usb',
    'repeater': 'LilyGo_TLora_V2_1_1_6_Repeater',
    'room_server': 'LilyGo_TLora_V2_1_1_6_room_server',
    'terminal_chat': 'LilyGo_TLora_V2_1_1_6_terminal_chat'
  },
  'meshadventurer': {
    'companion_ble': 'Meshadventurer_sx1262_companion_radio_ble',
    'companion_usb': 'Meshadventurer_sx1262_companion_radio_usb',
    'repeater': 'Meshadventurer_sx1262_repeater',
    'room_server': 'Meshadventurer_sx1262_room_server',
    'terminal_chat': 'Meshadventurer_sx1262_terminal_chat'
  },
  'tenstar_c3': {
    'repeater': 'Tenstar_C3_Repeater_sx1262'
  },
  'xiao_c6': {
    'companion_ble': 'Xiao_C6_companion_radio_ble',
    'repeater': 'Xiao_C6_Repeater'
  },
  'xiao_s3_wio': {
    'companion_ble': 'Xiao_S3_WIO_companion_radio_ble',
    'companion_usb': 'Xiao_S3_WIO_companion_radio_serial',
    'repeater': 'Xiao_S3_WIO_Repeater',
    'room_server': 'Xiao_S3_WIO_room_server',
    'terminal_chat': 'Xiao_S3_WIO_terminal_chat'
  },
  'nano_g2_ultra': {
    'companion_ble': 'Nano_G2_Ultra_companion_radio_ble'
  },
  'promicro': {
    'companion_ble': 'Faketec_companion_radio_ble',
    'companion_usb': 'Faketec_companion_radio_usb',
    'repeater': 'Faketec_Repeater',
    'room_server': 'Faketec_room_server',
    'terminal_chat': 'Faketec_terminal_chat'
  },
  't1000_e': {
    'companion_ble': 't1000e_companion_radio_ble'
  },
  'thinknode_m1': {
    'companion_ble': 'ThinkNode_M1_companion_radio_ble',
    'repeater': 'ThinkNode_M1_repeater',
    'room_server': 'ThinkNode_M1_room_server'
  },
  'waveshare_rp2040_lora': {
    'companion_usb': 'waveshare_rp2040_lora_companion_radio_usb',
    'repeater': 'waveshare_rp2040_lora_Repeater',
    'room_server': 'waveshare_rp2040_lora_room_server',
    'terminal_chat': 'waveshare_rp2040_lora_terminal_chat'
  }
};

// Regional presets based on MeshCore documentation
const REGIONAL_PRESETS = {
  'aus_nz': {
    name: 'Australia & New Zealand',
    frequency: '915.8',
    bandwidth: '250',
    spreadingFactor: '10', // Liami Cottle's app recommends SF 10 for Australia
    description: '915.8MHz, SF10, 250kHz BW'
  },
  'uk_eu': {
    name: 'UK & Europe', 
    frequency: '869.525',
    bandwidth: '250',
    spreadingFactor: '11', // SF 11 recommended for other regions
    description: '869.525MHz, SF11, 250kHz BW'
  },
  'can_usa': {
    name: 'Canada & USA',
    frequency: '910.525', 
    bandwidth: '250',
    spreadingFactor: '12',
    description: '910.525MHz, SF11, 250kHz BW'
  },
  'custom': {
    name: 'Custom Settings',
    description: 'Configure manually'
  }
};

// All possible flag definitions with their types
const ALL_FLAGS = {
  // LoRa Configuration - common to all variants
  LORA_FREQUENCY: { name: 'LoRa Frequency', type: 'text', default: '915.0', description: 'LoRa frequency in MHz' },
  LORA_BANDWIDTH: { name: 'LoRa Bandwidth', type: 'select', options: ['125', '250', '500'], default: '250', description: 'LoRa bandwidth in kHz' },
  LORA_SPREADING_FACTOR: { name: 'Spreading Factor', type: 'select', options: ['7', '8', '9', '10', '11', '12'], default: '12', description: 'LoRa spreading factor' },
  LORA_TX_POWER: { name: 'TX Power', type: 'number', default: 20, min: 1, max: 30, description: 'LoRa transmit power in dBm' },
  
  // Device Configuration
  DEVICE_NAME: { name: 'Device Name', type: 'text', default: 'MeshCore', description: 'Custom device name' },
  
  // WiFi Configuration
  WIFI_SSID: { name: 'WiFi SSID', type: 'text', default: '', description: 'WiFi network name', group: 'Network Settings', order: 1 },
  WIFI_PWD: { name: 'WiFi Password', type: 'password', default: '', description: 'WiFi network password', group: 'Network Settings', order: 2 },
  WIFI_DEBUG_LOGGING: { name: 'WiFi Debug', type: 'checkbox', default: false, description: 'Enable WiFi debug', group: 'Network Settings', order: 3 },
  
  // BLE Configuration
  BLE_PIN_CODE: { name: 'BLE PIN Code', type: 'number', default: 123456, description: 'BLE pairing PIN', group: 'BLE Settings', order: 1 },
  BLE_NAME_PREFIX: { name: 'BLE Name Prefix', type: 'text', default: '', description: 'BLE device name prefix', group: 'BLE Settings', order: 2 },
  BLE_DEBUG_LOGGING: { name: 'BLE Debug', type: 'checkbox', default: false, description: 'Enable BLE debug', group: 'BLE Settings', order: 3 },
  
  // Role-specific Configuration
  ADMIN_PASSWORD: { name: 'Admin Password', type: 'password', default: 'password', description: 'Admin password', group: 'Security Settings', order: 1 },
  ROOM_PASSWORD: { name: 'Room Password', type: 'password', default: 'hello', description: 'Room password', group: 'Security Settings', order: 2 },
  GUEST_PASSWORD: { name: 'Guest Password', type: 'password', default: '', description: 'Guest access password', group: 'Security Settings', order: 3 },
  ADVERT_NAME: { name: 'Advertised Name', type: 'text', default: 'MeshCore Node', description: 'Advertised device name', group: 'Device Settings', order: 1 },
  ADVERT_LAT: { name: 'Latitude', type: 'number', default: 0.0, description: 'GPS latitude', group: 'Location Settings', order: 1 },
  ADVERT_LON: { name: 'Longitude', type: 'number', default: 0.0, description: 'GPS longitude', group: 'Location Settings', order: 2 },
  
  // Capacity Configuration
  MAX_CONTACTS: { name: 'Max Contacts', type: 'number', default: 100, description: 'Maximum contacts', group: 'Capacity Settings', order: 1 },
  MAX_GROUP_CHANNELS: { name: 'Max Group Channels', type: 'number', default: 8, description: 'Maximum group channels', group: 'Capacity Settings', order: 2 },
  MAX_NEIGHBOURS: { name: 'Max Neighbours', type: 'number', default: 8, description: 'Maximum neighbours', group: 'Capacity Settings', order: 3 },
  MAX_CLIENTS: { name: 'Max Clients', type: 'number', default: 10, description: 'Maximum clients', group: 'Capacity Settings', order: 4 },
  OFFLINE_QUEUE_SIZE: { name: 'Offline Queue Size', type: 'number', default: 256, description: 'Offline message queue size', group: 'Capacity Settings', order: 5 },
  MAX_UNSYNCED_POSTS: { name: 'Max Unsynced Posts', type: 'number', default: 100, description: 'Maximum unsynced posts', group: 'Capacity Settings', order: 6 },
  TCP_PORT: { name: 'TCP Port', type: 'number', default: 5000, description: 'TCP server port', group: 'Network Settings', order: 4 },
  SERVER_RESPONSE_DELAY: { name: 'Server Response Delay', type: 'number', default: 100, description: 'Server response delay (ms)', group: 'Performance Settings', order: 1 },
  TXT_ACK_DELAY: { name: 'Text Ack Delay', type: 'number', default: 50, description: 'Text acknowledgment delay (ms)', group: 'Performance Settings', order: 2 },
  
  // Serial Configuration
  SERIAL_RX: { name: 'Serial RX Pin', type: 'number', default: 3, description: 'Serial RX pin number', group: 'Serial Settings', order: 1 },
  SERIAL_TX: { name: 'Serial TX Pin', type: 'number', default: 1, description: 'Serial TX pin number', group: 'Serial Settings', order: 2 },
  
  // GPS Configuration
  PERSISTANT_GPS: { name: 'Persistent GPS', type: 'checkbox', default: false, description: 'Keep GPS always on', group: 'GPS Settings', order: 1 },
  FORCE_GPS_ALIVE: { name: 'Force GPS Alive', type: 'checkbox', default: false, description: 'Force GPS to stay alive', group: 'GPS Settings', order: 2 },
  
  // Debug Flags
  MESH_DEBUG: { name: 'Mesh Debug', type: 'checkbox', default: false, description: 'Enable mesh debug' },
  MESH_PACKET_LOGGING: { name: 'Packet Logging', type: 'checkbox', default: false, description: 'Enable packet logging' },
  BLE_DEBUG_LOGGING: { name: 'BLE Debug', type: 'checkbox', default: false, description: 'Enable BLE debug' },
  WIFI_DEBUG_LOGGING: { name: 'WiFi Debug', type: 'checkbox', default: false, description: 'Enable WiFi debug' }
};

// Common flags that should be shown in UI for all variants
const COMMON_FLAGS = {
  MESH_DEBUG: ALL_FLAGS.MESH_DEBUG,
  MESH_PACKET_LOGGING: ALL_FLAGS.MESH_PACKET_LOGGING
};

function getBoard(boardId) {
  return BOARDS[boardId];
}

function getVariant(variantId) {
  return ROLES[variantId];
}

function getBoardsForVariant(variantId) {
  return Object.values(BOARDS).filter(board => 
    board.variants.includes(variantId)
  );
}

function getVariantsForBoard(boardId) {
  const board = BOARDS[boardId];
  if (!board) return [];
  
  return board.variants.map(variantId => ROLES[variantId]);
}

function getEnvironmentName(boardId, variantId) {
  const boardMap = ENVIRONMENT_MAP[boardId];
  if (!boardMap) {
    throw new Error(`No environment mapping found for board: ${boardId}`);
  }
  
  const envName = boardMap[variantId];
  if (!envName) {
    throw new Error(`No environment mapping found for board: ${boardId}, variant: ${variantId}`);
  }
  
  return envName;
}

function generateBuildFlags(board, variant, userFlags = {}, customFlags = '') {
  const flags = [];
  const seenFlags = new Set();
  
  // Add variant required flags with their values
  if (variant.requiredFlags) {
    variant.requiredFlags.forEach(flagName => {
      const flagConfig = ALL_FLAGS[flagName];
      if (flagConfig) {
        const value = userFlags[flagName] !== undefined ? userFlags[flagName] : flagConfig.default;
        if (value !== undefined && value !== '') {
          // Apply same quoting logic as optional flags
          if (flagConfig.type === 'text' || flagConfig.type === 'password') {
            flags.push(`${flagName}='"${value}"'`);
          } else if (flagConfig.type === 'checkbox') {
            // For boolean flags, only add if true
            if (value === true) {
              flags.push(`${flagName}=1`);
            }
          } else {
            flags.push(`${flagName}=${value}`);
          }
          seenFlags.add(flagName);
        }
      }
    });
  }
  
  // Add common flags with defaults (skip false boolean values and already seen flags)
  Object.entries(COMMON_FLAGS).forEach(([key, config]) => {
    if (seenFlags.has(key)) return; // Skip if already added by variant
    
    const value = userFlags[key] !== undefined ? userFlags[key] : config.default;
    if (value !== undefined && value !== '' && value !== false) {
      // For boolean flags, only add if true
      if (config.type === 'checkbox' && value === true) {
        flags.push(`${key}=1`);
      } else if (config.type === 'text' || config.type === 'password') {
        // Text and password fields need double quotes wrapped in single quotes (pio format)
        flags.push(`${key}='"${value}"'`);
      } else if (config.type !== 'checkbox') {
        flags.push(`${key}=${value}`);
      }
      seenFlags.add(key);
    }
  });
  
  // Add user-specified optional flags (skip duplicates)
  if (variant.optionalFlags) {
    variant.optionalFlags.forEach(flag => {
      if (userFlags[flag] !== undefined && userFlags[flag] !== '' && !seenFlags.has(flag)) {
        const flagConfig = ALL_FLAGS[flag];
        const value = userFlags[flag];
        
        // Apply quoting logic for text/password fields
        // kinda messy but works I guess
        if (flagConfig && (flagConfig.type === 'text' || flagConfig.type === 'password')) {
          flags.push(`${flag}='"${value}"'`);
        } else {
          flags.push(`${flag}=${value}`);
        }
        seenFlags.add(flag);
      }
    });
  }
  
  // Parse and add custom flags (skip duplicates)
  if (customFlags && customFlags.trim()) {
    const parsedCustomFlags = parseCustomFlags(customFlags);
    parsedCustomFlags.forEach(flag => {
      const flagName = flag.split('=')[0];
      if (!seenFlags.has(flagName)) {
        flags.push(flag);
        seenFlags.add(flagName);
      }
    });
  }
  
  return flags;
}

function parseCustomFlags(customFlags) {
  const flags = [];
  
  // Split by newlines and spaces, clean up
  const flagsArray = customFlags
    .split(/[\n\s]+/)
    .map(flag => flag.trim())
    .filter(flag => flag.length > 0);
  
  flagsArray.forEach(flag => {
    // Remove -D prefix if present, we'll add it back later
    const cleanFlag = flag.replace(/^-D/, '');
    if (cleanFlag) {
      flags.push(cleanFlag);
    }
  });
  
  return flags;
}

function generatePlatformIOCommand(board, variant, userFlags = {}) {
  const envName = getEnvironmentName(board.id, variant.id);
  return `pio run -e ${envName}`;
}

function generateUploadCommand(board, variant, uploadConfig) {
  const envName = getEnvironmentName(board.id, variant.id);
  let targetFlags = '--target upload';
  
  // Add erase target if requested (separate --target flags)
  if (uploadConfig.eraseFirst) {
    targetFlags = '--target erase --target upload';
  }
  
  const command = `pio run -e ${envName} ${targetFlags} --upload-port ${uploadConfig.port}`;
  return command;
}


function getRegionalPresets() {
  return REGIONAL_PRESETS;
}

function getRegionalPreset(presetId) {
  return REGIONAL_PRESETS[presetId];
}

function getVariantUIFields(variant) {
  const groups = {};
  
  // Helper function to add a flag to groups
  const addFlagToGroups = (flagKey, isRequired = false) => {
    // For required flags, extract the flag name from "FLAG_NAME=defaultValue" format
    let actualFlagKey = flagKey;
    let defaultValue = null;
    if (flagKey.includes('=')) {
      [actualFlagKey, defaultValue] = flagKey.split('=');
    }
    
    const flagDef = ALL_FLAGS[actualFlagKey];
    if (flagDef) {
      const group = flagDef.group || (isRequired ? 'Required Settings' : 'Optional Settings');
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push({
        key: actualFlagKey,
        ...flagDef,
        required: isRequired,
        defaultValue: defaultValue || flagDef.default
      });
    }
  };
  
  // Add required flags (these can be customized by users)
  if (variant.requiredFlags) {
    variant.requiredFlags.forEach(flagKey => {
      addFlagToGroups(flagKey, true);
    });
  }
  
  // Add optional flags
  if (variant.optionalFlags) {
    variant.optionalFlags.forEach(flagKey => {
      addFlagToGroups(flagKey, false);
    });
  }
  
  // Sort fields within each group by order, with required flags first
  Object.keys(groups).forEach(groupKey => {
    groups[groupKey].sort((a, b) => {
      // Required flags come first
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;
      // Then sort by order
      return (a.order || 999) - (b.order || 999);
    });
  });
  
  return groups;
}

module.exports = {
  BOARDS,
  ROLES,
  COMMON_FLAGS,
  ALL_FLAGS,
  ENVIRONMENT_MAP,
  REGIONAL_PRESETS,
  getBoard,
  getVariant,
  getBoardsForVariant,
  getVariantsForBoard,
  getEnvironmentName,
  generateBuildFlags,
  generatePlatformIOCommand,
  generateUploadCommand,
  getRegionalPresets,
  getRegionalPreset,
  getVariantUIFields,
  parseCustomFlags
};