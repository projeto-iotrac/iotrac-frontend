import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import theme from '../../src/theme';
import { ActivityIndicator, Modal } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (emailError) setEmailError(null);
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (passwordError) setPasswordError(null);
    };

    const handleLogin = async () => {
        setError(null);

        if (!email || !password) {
            if (!email) {
                setEmailError('Preencha este campo!');
            }

            if (!password) {
                setPasswordError('Preencha este campo!');
            }
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
            setError('Ocorreu um erro ao autenticar o usuário. Tente novamente mais tarde!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={require('../../assets/images/logo.svg')} style={styles.logo} />

            {error && <Text style={styles.errorAlert}>{error}</Text>}

            <View>
                <Text style={styles.label}>E-mail*</Text>
                <TextInput
                    value={email}
                    onChangeText={handleEmailChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                    placeholder="seuemail@email.com"
                    placeholderTextColor={theme.colors.textSecondary}
                    maxLength={254}
                />
                {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            <View>
                <Text style={styles.label}>Senha*</Text>
                <TextInput
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry
                    style={styles.input}
                    placeholder="Su@S3nh@"
                    placeholderTextColor={theme.colors.textSecondary}
                    maxLength={50}
                />
                {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
            </View>

            <TouchableOpacity onPress={handleLogin} style={styles.loginButton} disabled={loading}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.registerContainer}>
                <Text style={styles.textSecondary}>Ainda não tem uma conta?</Text>
                <TouchableOpacity onPress={() => router.push('/register')} disabled={loading}>
                    <Text style={styles.link}>Cadastre-se</Text>
                </TouchableOpacity>
            </View>

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
        flexGrow: 1,
        gap: 16
    },
    logo: {
        width: 80,
        height: 80,
        alignSelf: 'center',
        marginBottom: 24
    },
    errorText: {
       fontSize: 12,
       color: theme.colors.error,
    },
    errorAlert: {
       paddingHorizontal: 16, 
       paddingVertical: 12,
       borderWidth: 1,
       borderRadius: 8, 
       backgroundColor: theme.colors.errorOpacity,
       borderColor: theme.colors.error,
       color: theme.colors.error,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.neutralBorder,
        borderRadius: 8,
        height: 38,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: theme.colors.neutralBackground,
    },
    label: {
        fontWeight: '500',
        marginBottom: 4,
        color: theme.colors.primary
    },
    loginButton: {
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 4,
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
        width: '70%',
        alignSelf: 'center',
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
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
