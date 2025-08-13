import { useState, useEffect, useCallback, useMemo } from 'react';
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
      setIsConnected(prev => prev !== true ? true : prev); // Só atualiza se mudou
      setLastCheck(new Date());
    } catch (error) {
      setIsConnected(prev => prev !== false ? false : prev); // Só atualiza se mudou
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Verificar conectividade periodicamente (silencioso)
  useEffect(() => {
    checkConnection();
    
    const interval = setInterval(checkConnection, 60000); // 60s - silencioso
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    isConnected,
    isChecking,
    lastCheck,
    checkConnection
  };
}

// Hook para dispositivos com atualizações inteligentes
export function useDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDevices = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getDevices();
      // Comparação inteligente: só atualiza se realmente mudou
      setDevices(prevDevices => {
        const hasChanges = JSON.stringify(prevDevices) !== JSON.stringify(data);
        if (hasChanges) {
          console.log('🔄 Dispositivos atualizados silenciosamente');
          setLastUpdate(new Date());
          return data;
        }
        return prevDevices; // Não re-renderiza se não mudou
      });
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar dispositivos');
    } finally {
      if (showLoading) setLoading(false);
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
    fetchDevices(true); // Com loading visível
  }, [fetchDevices]);

  // Atualização silenciosa em background para segurança
  useEffect(() => {
    fetchDevices(true); // Primeira carga com loading
    
    const interval = setInterval(() => {
      fetchDevices(false); // Atualizações silenciosas sem loading
    }, 30000); // 30s - silencioso
    
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

// Hook para logs com atualizações inteligentes
export function useLogs(limit: number = 50) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getLogs(limit);
      // Só atualiza se houver mudanças reais
      setLogs(prevLogs => {
        const hasChanges = JSON.stringify(prevLogs) !== JSON.stringify(data);
        if (hasChanges) {
          console.log('🔄 Logs atualizados silenciosamente');
          return data;
        }
        return prevLogs; // Não re-renderiza se não mudou
      });
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar logs');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [limit]);

  // Atualização silenciosa para detectar eventos de segurança
  useEffect(() => {
    fetchLogs(true); // Primeira carga com loading
    
    const interval = setInterval(() => {
      fetchLogs(false); // Atualizações silenciosas sem loading
    }, 15000); // 15s - silencioso para detectar eventos de segurança
    
    return () => clearInterval(interval);
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    refreshLogs: () => fetchLogs(true) // Manual com loading
  };
} 