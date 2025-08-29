import { useEffect, useState, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import { API_CONFIG } from '../src/constants/ApiConfig';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function TOTPSetupScreen() {
  const router = useRouter();
  const { token, applyAuthTokens } = useAuth();
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState<string | null>(null);
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
        try { data = await res.json(); } catch {}
        if (res.ok) {
          if (!data?.qr_code_url) {
            setError('Resposta inválida do servidor. Tente novamente.');
          } else {
            setQr(data.qr_code_url);
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
    if (!code || code.length !== 6) {
      setError('Digite o código de 6 dígitos');
      return;
    }

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/totp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code }),
      });
      let data: any = {};
      try { data = await res.json(); } catch {}
      if (res.ok) {
        if (data?.access_token && data?.refresh_token) {
          try {
            const meResp = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${data.access_token}` },
            });
            let me: any = {};
            try { me = await meResp.json(); } catch {}
            if (meResp.ok && me) {
              await applyAuthTokens(data.access_token, data.refresh_token, me);
            }
          } catch {}
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
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Validação do Autenticador Google</Text>

      {!!error && (
        <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
      )}

      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <>
          {qr && (
            <>
              <Image source={{ uri: qr }} style={{ width: 240, height: 240, alignSelf: 'center', marginBottom: 8 }} />
              <TouchableOpacity onPress={() => Linking.openURL(qr)} style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text>Abrir QR em nova aba</Text>
              </TouchableOpacity>
            </>
          )}

          <Text>Código do app autenticador</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            style={{ borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 12 }}
          />

          <TouchableOpacity onPress={handleVerify} style={{ padding: 12, backgroundColor: '#ddd', alignItems: 'center', marginBottom: 12 }}>
            <Text>Ativar código</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/login')} style={{ padding: 12, alignItems: 'center' }}>
            <Text>Voltar ao Login</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
} 