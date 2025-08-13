import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/ApiConfig';
import { setAuthToken } from '../services/api';

// Tipos para autenticação
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  two_fa_enabled?: boolean;
  is_2fa_enabled?: boolean;
  is_totp_enabled?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; requires2FA?: boolean; tempToken?: string }>;
  verify2FA: (code: string, tempToken: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
  clearAuth: () => Promise<void>;
  applyAuthTokens: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper de validação de senha (alinhado ao backend)
function isPasswordStrong(password: string): boolean {
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSymbol;
}

// Storage keys
const STORAGE_KEYS = {
  TOKEN: '@iotrac_token',
  REFRESH_TOKEN: '@iotrac_refresh_token',
  USER: '@iotrac_user',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    isLoading: true,
  });

  // Carregar dados de autenticação ao iniciar
  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const [token, refreshToken, userJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        setAuthToken(token);
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          refreshToken,
          isLoading: false,
        });
      } else {
        setAuthToken(null);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      setAuthToken(null);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveAuthData = async (token: string, refreshToken: string, user: User) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const applyAuthTokens = async (accessToken: string, refreshToken: string, user: User) => {
    await saveAuthData(accessToken, refreshToken, user);
    setAuthToken(accessToken);
    setAuthState({ isAuthenticated: true, user, token: accessToken, refreshToken, isLoading: false });
  };

  const login = async (email: string, password: string) => {
    try {
      const payload = { email: email.trim(), password };
      if (!payload.email || !payload.email.includes('@') || !payload.email.includes('.')) {
        return { success: false, message: 'Email inválido' };
      }
      if (!payload.password || payload.password.length < 8) {
        return { success: false, message: 'Senha deve ter pelo menos 8 caracteres' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try { data = await response.json(); } catch {}

      if (response.ok) {
        if (data.requires_2fa || data.requires2FA) {
          return { success: true, message: 'Código 2FA enviado por email', requires2FA: true, tempToken: data.temp_token || data.tempToken };
        } else if (data.access_token && data.refresh_token && data.user) {
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.full_name,
            role: data.user.role,
            two_fa_enabled: data.user.two_fa_enabled ?? data.user.is_2fa_enabled,
          };
          await saveAuthData(data.access_token, data.refresh_token, user);
          setAuthToken(data.access_token);
          setAuthState({ isAuthenticated: true, user, token: data.access_token, refreshToken: data.refresh_token, isLoading: false });
          return { success: true, message: 'Login realizado com sucesso' };
        } else {
          return { success: false, message: 'Resposta inválida do servidor' };
        }
      } else {
        const detailMsg = Array.isArray(data?.detail)
          ? data.detail.map((d: any) => d?.msg || d).join('; ')
          : (data?.detail || 'Erro no login');
        return { success: false, message: detailMsg };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const verify2FA = async (code: string, tempToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, temp_token: tempToken }),
      });

      let data: any = {};
      try { data = await response.json(); } catch {}

      if (response.ok) {
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.full_name,
          role: data.user.role,
          two_fa_enabled: data.user.two_fa_enabled ?? data.user.is_2fa_enabled,
        };
        await saveAuthData(data.access_token, data.refresh_token, user);
        setAuthToken(data.access_token);
        setAuthState({ isAuthenticated: true, user, token: data.access_token, refreshToken: data.refresh_token, isLoading: false });
        return { success: true, message: '2FA verificado com sucesso' };
      } else {
        return { success: false, message: data.detail || 'Código 2FA inválido' };
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      if (!isPasswordStrong(userData.password)) {
        return { success: false, message: 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo' };
      }

      const payload = {
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirm_password ?? userData.password,
        full_name: userData.full_name,
        phone: userData.phone,
        role: 'user',
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try { data = await response.json(); } catch (_) {}

      if (response.ok) {
        return { success: true, message: data.message || 'Usuário registrado com sucesso' };
      } else {
        return { success: false, message: data?.detail || 'Erro no registro' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  const refreshAuthToken = async (): Promise<boolean> => {
    try {
      if (!authState.refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: authState.refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!authState.user) return false;
        await saveAuthData(data.access_token, data.refresh_token, authState.user);
        setAuthToken(data.access_token);
        setAuthState(prev => ({ ...prev, token: data.access_token, refreshToken: data.refresh_token }));
        return true;
      } else {
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return false;
    }
  };

  const logout = async () => {
    await clearAuthData();
    setAuthToken(null);
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
    });
  };

  const clearAuth = async () => {
    await clearAuthData();
    setAuthToken(null);
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        verify2FA,
        register,
        logout,
        refreshAuthToken,
        clearAuth,
        applyAuthTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 