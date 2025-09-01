import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import theme from '../../src/theme';

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
        <View style={styles.container}>
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <Image source={require('../../assets/images/logo.svg')} style={styles.logo} />

            <View>
                <Text>E-mail</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                    placeholder="seuemail@email.com"
                    placeholderTextColor={theme.colors.textSecondary}
                />
            </View>

            <View>
                <Text>Senha</Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    placeholder="Su@S3nh@"
                    placeholderTextColor={theme.colors.textSecondary}
                />
            </View>

            <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.registerContainer}>
                <Text style={styles.textSecondary}>Ainda não tem uma conta?</Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                    <Text style={styles.link}>Cadastre-se</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        gap: 16
    },
    logo: {
        width: 80,
        height: 80, 
        marginBottom: 16,
        alignSelf: 'center'
    },
    title: {
        fontSize: 20,
        marginBottom: 16,
    },
    errorText: {
        color: 'red',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.neutralBorder,
        borderRadius: 32,
        height: 38,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: theme.colors.neutralBackground,
    },
    loginButton: {
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        borderRadius: 32,
    },
    buttonText: {
        color: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        height: 38,
        lineHeight: 20
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8
    },
    divider: {
        borderTopColor: theme.colors.neutralBorder,
        width: '100%',
        marginBottom: 0,
        marginTop: 4, borderBottomColor: theme.colors.neutralBorder,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    link: {
        color: theme.colors.primary,
        textDecorationLine: 'underline',
        textDecorationColor: theme.colors.primary,
    },
    textSecondary: {
        color: theme.colors.textSecondary,
    },
});
