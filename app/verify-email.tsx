import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_CONFIG } from '../src/constants/ApiConfig';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const emailParam = typeof params.email === 'string' ? params.email : '';
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (!email || !code) {
      Alert.alert('Erro', 'Informe email e código');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {}
      if (res.ok) {
        // Navegar imediatamente (no Web o Alert pode não disparar callback)
        router.replace('/login');
        return;
      } else {
        Alert.alert('Erro', data?.detail || data?.message || 'Código inválido');
      }
    } catch (e) {
      console.error('Erro ao verificar email:', e);
      Alert.alert('Erro', 'Falha de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Erro', 'Informe o email');
      return;
    }
    setResending(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/verify-email/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {}
      if (res.ok) {
        Alert.alert('Sucesso', 'Código reenviado para o seu email.');
      } else {
        Alert.alert('Erro', data?.detail || 'Falha ao reenviar código');
      }
    } catch (e) {
      console.error('Erro ao reenviar código:', e);
      Alert.alert('Erro', 'Falha de conexão');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Verificar Email</Text>

      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 12 }} />

      <Text>Código recebido por email</Text>
      <TextInput value={code} onChangeText={setCode} keyboardType="number-pad" style={{ borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 12 }} />

      <TouchableOpacity onPress={handleVerify} style={{ padding: 12, backgroundColor: '#ddd', alignItems: 'center', marginBottom: 12 }}>
        <Text>{loading ? 'Verificando...' : 'Verificar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} style={{ padding: 12, backgroundColor: '#eee', alignItems: 'center' }}>
        <Text>{resending ? 'Reenviando...' : 'Reenviar código'}</Text>
      </TouchableOpacity>
    </View>
  );
} 