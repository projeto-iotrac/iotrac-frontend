import axios, { AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../constants/ApiConfig';

// Configuración de axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Utilitários para autenticação via header Authorization
export function setAuthToken(token: string | null) {
  if (token) {
    (api.defaults.headers as any).common = (api.defaults.headers as any).common || {};
    (api.defaults.headers as any).common['Authorization'] = `Bearer ${token}`;
  } else {
    if ((api.defaults.headers as any).common) {
      delete (api.defaults.headers as any).common['Authorization'];
    }
  }
}

// Handlers de autenticação para refresh automático
type AuthHandlers = {
  getAccessToken: () => string | null;
  refreshAuthToken: () => Promise<boolean>;
};
let authHandlers: Partial<AuthHandlers> = {};
export function setAuthHandlers(handlers: AuthHandlers) {
  authHandlers = handlers;
}

// Interceptor para manejar errores (com refresh automático em 401/403)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Tentar refresh automático em 401/403
    const status = error.response?.status;
    const originalRequest: any = error.config || {};
    if (status === 401 && !originalRequest._retry && authHandlers.refreshAuthToken) {
      originalRequest._retry = true;
      try {
        const refreshed = await authHandlers.refreshAuthToken();
        if (refreshed) {
          const token = authHandlers.getAccessToken ? authHandlers.getAccessToken() : null;
          setAuthToken(token || null);
          return api.request(originalRequest);
        }
      } catch (_) {
        // segue para o fluxo de erro padrão abaixo
      }
    }

    // Fluxo de erros padrão
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
        case 401:
        case 403:
          return Promise.reject(new Error(detail || 'Não autenticado'));
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

// Interfaces para IA
export interface AIQueryRequest {
  query: string;
  context?: string;
}

export interface AIResponse {
  response: string;
  confidence: number;
  suggestions: string[];
  timestamp: string;
}

export interface AISummaryResponse {
  summary: string;
  key_points: string[];
  recommendations: string[];
  timestamp: string;
}

export interface AIRecommendation {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  timestamp: string;
}

// Interfaces para logs avançados
export interface SimpleLogEntry {
  id: number;
  timestamp: string;
  type: string;
  icon: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  device_name?: string;
  device_id?: number;
}

export interface LogSummary {
  total_events: number;
  device_connections: number;
  security_alerts: number;
  attacks_blocked: number;
  anomalies_detected: number;
  last_24h_events: number;
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
      console.log('🔍 Debug Headers:', api.defaults.headers);
      console.log('🔍 Debug Auth Header:', (api.defaults.headers as any).common?.Authorization);
      
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

  // Métodos de IA
  async queryAI(query: string, context?: string): Promise<AIResponse> {
    const response: AxiosResponse<AIResponse> = await api.post(API_CONFIG.ENDPOINTS.AI_QUERY, {
      query,
      context
    });
    return response.data;
  },

  async getAISummary(): Promise<AISummaryResponse> {
    const response: AxiosResponse<AISummaryResponse> = await api.get(API_CONFIG.ENDPOINTS.AI_SUMMARY);
    return response.data;
  },

  async getAIRecommendations(): Promise<AIRecommendation[]> {
    const response: AxiosResponse<AIRecommendation[]> = await api.get(API_CONFIG.ENDPOINTS.AI_RECOMMENDATIONS);
    return response.data;
  },

  async getAIStatus(): Promise<any> {
    const response: AxiosResponse = await api.get(API_CONFIG.ENDPOINTS.AI_STATUS);
    return response.data;
  },

  // Métodos para logs avançados
  async getSimpleLogs(): Promise<SimpleLogEntry[]> {
    const response: AxiosResponse<SimpleLogEntry[]> = await api.get(API_CONFIG.ENDPOINTS.LOGS_SIMPLE);
    return response.data;
  },

  async getAdvancedLogs(): Promise<LogEntry[]> {
    const response: AxiosResponse<LogEntry[]> = await api.get(API_CONFIG.ENDPOINTS.LOGS_ADVANCED);
    return response.data;
  },

  async getLogAlerts(): Promise<SimpleLogEntry[]> {
    const response: AxiosResponse<SimpleLogEntry[]> = await api.get(API_CONFIG.ENDPOINTS.LOGS_ALERTS);
    return response.data;
  },

  async getLogSummary(): Promise<LogSummary> {
    const response: AxiosResponse<LogSummary> = await api.get(API_CONFIG.ENDPOINTS.LOGS_SUMMARY);
    return response.data;
  },
};

export default apiService; 