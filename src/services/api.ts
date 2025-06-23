import axios, { AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../constants/ApiConfig';

// Configuración de axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error);
    
    if (error.response) {
      const status = error.response.status;
      const detail = (error.response.data as any)?.detail;
      
      switch (status) {
        case 400:
          if (detail) {
            return Promise.reject(new Error(detail));
          }
          return Promise.reject(new Error('Dados inválidos'));
        case 404:
          return Promise.reject(new Error('Dispositivo não encontrado'));
        case 409:
          return Promise.reject(new Error('Dispositivo já existe com este IP'));
        case 500:
          return Promise.reject(new Error('Erro interno do servidor'));
        default:
          return Promise.reject(new Error(`Erro ${status}: ${detail || 'Erro desconhecido'}`));
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Tempo limite de conexão excedido. Verifique se o backend está rodando.'));
    }
    
    if (error.code === 'ECONNREFUSED') {
      return Promise.reject(new Error('Conexão recusada. Verifique se o backend está rodando na porta 8000.'));
    }
    
    if (error.code === 'ENOTFOUND') {
      return Promise.reject(new Error('Servidor não encontrado. Verifique a URL da API.'));
    }
    
    return Promise.reject(new Error('Erro de conexão com o servidor'));
  }
);

// Tipos de datos
export interface Device {
  id: number;
  device_type: string;
  ip_address: string;
  registered_at?: string;
  protection_enabled?: boolean;
}

export interface CommandRequest {
  device_id: number;
  command: string;
}

export interface CommandResponse {
  success: boolean;
  message: string;
  device_id: number;
  command: string;
  timestamp: string;
  protection_enabled: boolean;
}

export interface ProtectionStatus {
  protection_enabled: boolean;
  timestamp: string;
}

export interface LogEntry {
  id: number;
  device_id: number;
  device_type: string;
  ip_address: string;
  command: string;
  timestamp: string;
  status: string;
}

export interface ToggleResponse {
  protection_enabled: boolean;
  message: string;
  timestamp: string;
}

export interface DeviceRegister {
  device_type: string;
  ip_address: string;
}

export interface DeviceProtectionStatus {
  device_id: number;
  protection_enabled: boolean;
  timestamp: string;
}

export interface DeviceToggleResponse {
  device_id: number;
  protection_enabled: boolean;
  message: string;
  timestamp: string;
}

// Servicios de API
export const apiService = {
  // Verificar estado de la API
  async checkApiStatus(): Promise<any> {
    const response: AxiosResponse = await api.get(API_CONFIG.ENDPOINTS.ROOT);
    return response.data;
  },

  // Obtener estado de protección
  async getProtectionStatus(): Promise<ProtectionStatus> {
    const response: AxiosResponse<ProtectionStatus> = await api.get(API_CONFIG.ENDPOINTS.STATUS);
    return response.data;
  },

  // Alternar protección
  async toggleProtection(): Promise<ToggleResponse> {
    const response: AxiosResponse<ToggleResponse> = await api.post(API_CONFIG.ENDPOINTS.TOGGLE_PROTECTION);
    return response.data;
  },

  // Obtener logs
  async getLogs(limit: number = 100): Promise<LogEntry[]> {
    const response: AxiosResponse<LogEntry[]> = await api.get(`${API_CONFIG.ENDPOINTS.LOGS}?limit=${limit}`);
    return response.data;
  },

  // Enviar comando
  async sendCommand(commandRequest: CommandRequest): Promise<CommandResponse> {
    const response: AxiosResponse<CommandResponse> = await api.post(API_CONFIG.ENDPOINTS.COMMAND, commandRequest);
    return response.data;
  },

  // Obtener todos los dispositivos
  async getDevices(): Promise<Device[]> {
    const response: AxiosResponse<Device[]> = await api.get(API_CONFIG.ENDPOINTS.DEVICES);
    return response.data;
  },

  // Obtener detalles de un dispositivo específico
  async getDeviceDetails(deviceId: number): Promise<Device> {
    const response: AxiosResponse<Device> = await api.get(API_CONFIG.ENDPOINTS.DEVICE_DETAILS(deviceId));
    return response.data;
  },

  // Registrar nuevo dispositivo
  async registerDevice(deviceData: DeviceRegister): Promise<Device> {
    try {
      const response: AxiosResponse<Device> = await api.post(API_CONFIG.ENDPOINTS.REGISTER_DEVICE, deviceData);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao registrar dispositivo');
    }
  },

  // Remover dispositivo
  async deleteDevice(deviceId: number): Promise<{ message: string }> {
    try {
      console.log('🔄 API Service: Enviando DELETE para dispositivo:', deviceId);
      const response: AxiosResponse<{ message: string }> = await api.delete(API_CONFIG.ENDPOINTS.DELETE_DEVICE(deviceId));
      console.log('✅ API Service: Resposta recebida:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Service: Erro na requisição DELETE:', error);
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Dispositivo não encontrado ou já foi removido');
        }
        throw error;
      }
      throw new Error('Erro ao remover dispositivo');
    }
  },

  // Obtener estado de protección de un dispositivo específico
  async getDeviceProtectionStatus(deviceId: number): Promise<DeviceProtectionStatus> {
    const response: AxiosResponse<DeviceProtectionStatus> = await api.get(API_CONFIG.ENDPOINTS.DEVICE_PROTECTION_STATUS(deviceId));
    return response.data;
  },

  // Alternar protección de un dispositivo específico
  async toggleDeviceProtection(deviceId: number): Promise<DeviceToggleResponse> {
    const response: AxiosResponse<DeviceToggleResponse> = await api.post(API_CONFIG.ENDPOINTS.DEVICE_PROTECTION_TOGGLE(deviceId));
    return response.data;
  },
};

export default apiService; 