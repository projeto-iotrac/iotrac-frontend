import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  const handleRegister = async () => {
    setError(null);
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    if (password !== confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      const result = await register({ full_name: fullName, email, password, confirm_password: confirmPassword });
      if (result.success) {
        router.replace({ pathname: '/verify-email', params: { email } });
      } else {
        setError(result.message);
      }
    } catch (e) {
      console.error('Falha inesperada de cadastro:', e);
      setError('Falha ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  const passwordTip = 'A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo';

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Cadastro</Text>

      {!!error && (
        <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
      )}

      <Text>Nome Completo *</Text>
      <TextInput value={fullName} onChangeText={setFullName} style={{ borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 12 }} />

      <Text>Email *</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 12 }} />

      <Text>Senha *</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 4 }} />
      <Text style={{ color: '#666', fontSize: 12, marginBottom: 12 }}>{passwordTip}</Text>

      <Text>Confirmar Senha *</Text>
      <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={{ borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 12 }} />

      <TouchableOpacity onPress={handleRegister} style={{ padding: 12, backgroundColor: '#ddd', alignItems: 'center', marginBottom: 12 }}>
        <Text>{loading ? 'Criando...' : 'Criar Conta'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')} style={{ padding: 12, alignItems: 'center' }}>
        <Text>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
} 