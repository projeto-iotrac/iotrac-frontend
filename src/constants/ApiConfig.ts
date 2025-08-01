import Constants from 'expo-constants';

// Configuración de la API del backend
export const API_CONFIG = {
  BASE_URL: Constants.expoConfig?.extra?.API_URL,
  
  // Endpoints disponibles
  ENDPOINTS: {
    ROOT: '/',
    STATUS: '/status',
    TOGGLE_PROTECTION: '/toggle_protection',
    LOGS: '/logs',
    COMMAND: '/command',
    DEVICES: '/devices',
    DEVICE_DETAILS: (id: number) => `/devices/${id}`,
    REGISTER_DEVICE: '/device/register',
    DELETE_DEVICE: (id: number) => `/devices/${id}`,
    DEVICE_PROTECTION_STATUS: (id: number) => `/devices/${id}/protection`,
    DEVICE_PROTECTION_TOGGLE: (id: number) => `/devices/${id}/protection/toggle`
  },
  
  // Timeout para as peticiones (aumentado para 15 segundos)
  TIMEOUT: 15000,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Tipos de dispositivos soportados
export const DEVICE_TYPES = [
  { label: 'Drone', value: 'drone' },
  { label: 'Veículo', value: 'veículo' },
  { label: 'Smart Lâmpada Wi-Fi', value: 'smart-lamp' },
  { label: 'Fechadura Inteligente', value: 'smart-lock' },
  { label: 'Câmera de Segurança', value: 'security-camera' },
  { label: 'Smart TV', value: 'smart-tv' },
  { label: 'Termostato Inteligente', value: 'smart-thermostat' }
];

// Comandos disponibles
export const AVAILABLE_COMMANDS = [
  'move_up', 'move_down', 'move_left', 'move_right', 
  'move_forward', 'move_backward', 'turn_on', 'turn_off', 
  'set_speed', 'get_status', 'emergency_stop'
]; 