import { useEffect, useState, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, View, Modal, ActivityIndicator } from 'react-native';
import { API_CONFIG } from '../src/constants/ApiConfig';
import { useAuth } from '../src/contexts/AuthContext';
import theme from '../src/theme';
import { useRouter } from 'expo-router';

export default function TOTPSetupScreen() {
  const router = useRouter();
  const { token, applyAuthTokens } = useAuth();
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const didNavigateRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError('Sessão expirada. Faça login novamente.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/auth/totp/setup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });

        let data: any = {};

        try { data = await res.json(); } catch { }
        if (res.ok) {
          if (!data?.qr_code_url || !data?.secret) {
            setError('Resposta inválida do servidor. Tente novamente.');
          } else {
            setQr(data.qr_code_url);
            setSecret(data.secret);
            setError(null);
          }
        } else {
          setError(data?.detail || `Falha ao iniciar TOTP (HTTP ${res.status})`);
        }
      } catch (e) {
        setError('Falha de conexão');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleVerify = async () => {
    if (!code) {
      setError('Preencha este campo!');
      return;
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError('O código deve ter 6 dígitos numéricos!');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/totp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code }),
      });
      let data: any = {};
      try { data = await res.json(); } catch { }
      if (res.ok) {
        if (data?.access_token && data?.refresh_token) {
          try {
            const meResp = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${data.access_token}` },
            });
            let me: any = {};
            try { me = await meResp.json(); } catch { }
            if (meResp.ok && me) {
              await applyAuthTokens(data.access_token, data.refresh_token, me);
            }
          } catch { }
        }
        if (!didNavigateRef.current) {
          didNavigateRef.current = true;
          router.replace('/home');
        }
      } else {
        setError(data?.detail || 'Código inválido');
      }
    } catch (e) {
      setError('Falha de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    setCode(text);
    if (error) setError(null);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ativar autenticação em duas etapas</Text>

      {qr && (
        <Image source={{ uri: qr }} style={styles.qr} />
      )}

      {secret && (
        <View>
          <Text style={styles.secretLabel}>Ou insira esta chave no app autenticador:</Text>

          <View style={styles.secretBox}>
            <Text style={styles.secretValue}>{secret}</Text>
          </View>
        </View>
      )}

      <View>
        <Text style={styles.label}>Digite o código de 6 dígitos*</Text>
        <TextInput
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
          placeholder='123456'
          placeholderTextColor={theme.colors.textSecondary}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <TouchableOpacity onPress={handleVerify} style={styles.primaryButton}>
        <Text style={styles.buttonText}>Confirmar ativação</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')} style={styles.secondaryButton}>
        <Text style={styles.buttonText}>Cancelar</Text>
      </TouchableOpacity>

      {loading && (
        <Modal transparent animationType="fade">
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </Modal>
      )}
    </ScrollView>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.primary
  },
  qr: {
    width: 240,
    height: 240,
    alignSelf: 'center'
  },
  secretBox: {
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  secretLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: theme.colors.textSecondary,
    textAlign: 'center'
  },
  secretValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.primary
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
    paddingVertical: 12,
    fontWeight: '500'
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
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
