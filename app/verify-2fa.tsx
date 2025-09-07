import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import theme from '@/src/theme';
import { API_CONFIG } from '../src/constants/ApiConfig';

export default function Verify2FAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tempToken?: string }>();
  const temp = typeof params.tempToken === 'string' ? params.tempToken : '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verify2FA } = useAuth();
  const [codeError, setCodeError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCodeChange = (text: string) => {
    setCode(text);
    if (codeError) setCodeError(null);
  }

  const handleVerify = async () => {
    setCodeError(null);
    setError(null);

    if (!code || !temp) {
      setCodeError('Preencha este campo!');
      return;
    }

    setLoading(true);

    try {
      const res = await verify2FA(code, temp);
      if (res.success) {
        router.replace('/totp-setup');
      } else {
        setError("Código inválido. Tente novamente!");
      }
    } catch (e) {
      setError('Ocorreu um erro ao verificar o código. Tente novamente mais tarde!');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);

    if (!temp) {
      setError('Ocorreu um erro ao reenviar o código. Tente novamente mais tarde!');
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
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.svg')} style={styles.logo} />

      {error && <Text style={styles.errorAlert}>{error}</Text>}

      <View>
        <Text style={styles.label}>Digite o código enviado por email*</Text>
        <TextInput
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad" 
          style={styles.input}
          maxLength={6}
           placeholder='123456'
          placeholderTextColor={theme.colors.textSecondary} />
          {codeError && <Text style={styles.errorText}>{codeError}</Text>}
          {/* Verificar se essa feature de reenviar está funcionando corretamente! */}
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={styles.link}>Reenviar código para meu email</Text>
          </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleVerify} style={styles.primaryButton}>
        <Text style={styles.buttonText}>Verificar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')} style={styles.secondaryButton}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>

      {loading && (
        <Modal transparent animationType="fade">
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 16,
    flexGrow: 1
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 24
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    marginTop: 4,
    textDecorationColor: theme.colors.primary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    borderRadius: 8,
  },
  secondaryButton: {
    backgroundColor: theme.colors.primaryOpacity,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 38,
    lineHeight: 20
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.neutralBackground,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 4
  },
  label: {
    fontWeight: '500',
    marginBottom: 4,
    color: theme.colors.primary
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginBottom: 4
  },
  errorAlert: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: theme.colors.errorOpacity,
    borderColor: theme.colors.error,
    color: theme.colors.error,
    marginBottom: 8
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});