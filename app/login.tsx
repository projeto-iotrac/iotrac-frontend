import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Preencha email e senha');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.requires2FA && result.tempToken) {
          router.replace({ pathname: '/verify-2fa', params: { tempToken: result.tempToken } });
        } else if (result.requires2FA) {
          setError(result.message);
        } else {
          router.replace('/home');
        }
      } else {
        setError(result.message);
      }
    } catch {
      setError('Falha ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Login</Text>
      {!!error && (
        <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
      )}

      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 12 }}
      />

      <Text>Senha</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 12 }}
      />

      <TouchableOpacity onPress={handleLogin} style={{ padding: 12, backgroundColor: '#ddd', alignItems: 'center', marginBottom: 12 }}>
        <Text>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')} style={{ padding: 12, alignItems: 'center' }}>
        <Text>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
} 