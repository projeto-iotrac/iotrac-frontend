import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { API_CONFIG } from '../src/constants/ApiConfig';

export default function Verify2FAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tempToken?: string }>();
  const temp = typeof params.tempToken === 'string' ? params.tempToken : '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verify2FA } = useAuth();

  const handleVerify = async () => {
    if (!code || !temp) {
      Alert.alert('Erro', 'Código e token temporário são obrigatórios');
      return;
    }
    setLoading(true);
    try {
      const res = await verify2FA(code, temp);
      if (res.success) {
        router.replace('/totp-setup');
      } else {
        Alert.alert('Erro', res.message);
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!temp) {
      Alert.alert('Erro', 'Token temporário inválido');
      return;
    }
    setResending(true);
    try {
      const resp = await fetch(`${API_CONFIG.BASE_URL}/auth/2fa/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_token: temp }),
      });
      const data = await resp.json();
      if (resp.ok) {
        Alert.alert('2FA', 'Novo código enviado por email');
      } else {
        Alert.alert('Erro', data?.detail || 'Falha ao reenviar 2FA');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha de conexão');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Verificar 2FA</Text>

      <Text>Código 2FA (email)</Text>
      <TextInput value={code} onChangeText={setCode} keyboardType="number-pad" style={{ borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 12 }} />

      <TouchableOpacity onPress={handleVerify} style={{ padding: 12, backgroundColor: '#ddd', alignItems: 'center', marginBottom: 12 }}>
        <Text>{loading ? 'Verificando...' : 'Verificar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} style={{ padding: 12, alignItems: 'center', marginBottom: 12 }} disabled={resending}>
        <Text>{resending ? 'Reenviando...' : 'Reenviar código'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')} style={{ padding: 12, alignItems: 'center' }}>
        <Text>Voltar ao Login</Text>
      </TouchableOpacity>
    </View>
  );
} 