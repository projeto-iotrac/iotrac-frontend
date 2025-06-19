import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
}

export interface UseApiOptions {
  retryAttempts?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  onError?: (error: string) => void;
  onSuccess?: (data: any) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): ApiState<T> & { refetch: () => void; reset: () => void } {
  const {
    retryAttempts = 3,
    retryDelay = 2000,
    autoRetry = true,
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0
  });

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0
    });
  }, []);

  const executeApiCall = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const data = await apiCall();
      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        retryCount: 0
      }));
      onSuccess?.(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Erro desconhecido';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      onError?.(errorMessage);

      // Auto retry logic
      if (autoRetry && state.retryCount < retryAttempts) {
        console.log(`🔄 Tentativa ${state.retryCount + 1}/${retryAttempts} falhou. Tentando novamente em ${retryDelay}ms...`);
        setTimeout(() => {
          executeApiCall(true);
        }, retryDelay);
      }
    }
  }, [apiCall, retryAttempts, retryDelay, autoRetry, onError, onSuccess, state.retryCount]);

  const refetch = useCallback(() => {
    setState(prev => ({ ...prev, retryCount: 0 }));
    executeApiCall();
  }, [executeApiCall]);

  useEffect(() => {
    executeApiCall();
  }, []);

  return {
    ...state,
    refetch,
    reset
  };
}

// Hook específico para verificar conectividade
export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      await apiService.checkApiStatus();
      setIsConnected(true);
      setLastCheck(new Date());
    } catch (error) {
      setIsConnected(false);
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Verificar conectividade periodicamente
  useEffect(() => {
    checkConnection();
    
    const interval = setInterval(checkConnection, 30000); // Verificar a cada 30 segundos
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    isConnected,
    isChecking,
    lastCheck,
    checkConnection
  };
}

// Hook para dispositivos com cache e atualização automática
export function useDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getDevices();
      setDevices(data);
      setLastUpdate(new Date());
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar dispositivos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addDevice = useCallback(async (deviceData: any) => {
    try {
      const newDevice = await apiService.registerDevice(deviceData);
      setDevices(prev => [...prev, newDevice]);
      return newDevice;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao adicionar dispositivo');
    }
  }, []);

  const removeDevice = useCallback(async (deviceId: number) => {
    try {
      console.log('🔄 Hook useDevices: Iniciando remoção do dispositivo:', deviceId);
      await apiService.deleteDevice(deviceId);
      console.log('✅ Hook useDevices: API chamada com sucesso, atualizando estado local');
      setDevices(prev => prev.filter(device => device.id !== deviceId));
      console.log('✅ Hook useDevices: Estado local atualizado');
    } catch (error: any) {
      console.error('❌ Hook useDevices: Erro ao remover dispositivo:', error);
      throw new Error(error.message || 'Erro ao remover dispositivo');
    }
  }, []);

  const toggleDeviceProtection = useCallback(async (deviceId: number) => {
    try {
      const response = await apiService.toggleDeviceProtection(deviceId);
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, protection_enabled: response.protection_enabled }
          : device
      ));
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao alternar proteção do dispositivo');
    }
  }, []);

  const refreshDevices = useCallback(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Atualizar dispositivos periodicamente
  useEffect(() => {
    fetchDevices();
    
    const interval = setInterval(fetchDevices, 10000); // Atualizar a cada 10 segundos
    
    return () => clearInterval(interval);
  }, [fetchDevices]);

  return {
    devices,
    loading,
    error,
    lastUpdate,
    refreshDevices,
    addDevice,
    removeDevice,
    toggleDeviceProtection
  };
}

// Hook para logs com atualização em tempo real
export function useLogs(limit: number = 50) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getLogs(limit);
      setLogs(data);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Atualizar logs frequentemente
  useEffect(() => {
    fetchLogs();
    
    const interval = setInterval(fetchLogs, 5000); // Atualizar a cada 5 segundos
    
    return () => clearInterval(interval);
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    refreshLogs: fetchLogs
  };
} 