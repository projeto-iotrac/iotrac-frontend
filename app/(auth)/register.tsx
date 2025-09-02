import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import theme from '../../src/theme';

export default function RegisterScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [fullNameError, setFullNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

    const { register } = useAuth();

    const handleRegister = async () => {
        setError(null);

        // Reset errors individuais
        setFullNameError(null);
        setEmailError(null);
        setPasswordError(null);
        setConfirmPasswordError(null);

        // Validação simples
        let hasError = false;
        if (!fullName) {
            setFullNameError('Preencha este campo!');
            hasError = true;
        }
        if (!email) {
            setEmailError('Preencha este campo!');
            hasError = true;
        }
        if (!password) {
            setPasswordError('Preencha este campo!');
            hasError = true;
        }
        if (!confirmPassword) {
            setConfirmPasswordError('Preencha este campo!');
            hasError = true;
        }
        if (password && confirmPassword && password !== confirmPassword) {
            setConfirmPasswordError('As senhas não coincidem!');
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);
        try {
            const result = await register({
                full_name: fullName,
                email,
                password,
                confirm_password: confirmPassword
            });
            if (result.success) {
                router.replace({ pathname: '/verify-email', params: { email } });
            } else {
                setError(result.message);
            }
        } catch (e) {
            setError('Ocorreu um erro ao cadastrar o usuário. Tente novamente mais tarde!');
        } finally {
            setLoading(false);
        }
    };

    const passwordTip = 'A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo';

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={require('../../assets/images/logo.svg')} style={styles.logo} />

            {error && <Text style={styles.errorAlert}>{error}</Text>}

            <View>
                <Text style={styles.label}>Nome completo*</Text>
                <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={text => { setFullName(text); if (fullNameError) setFullNameError(null); }}
                    maxLength={200}
                    placeholder='Seu Nome Completo'
                    placeholderTextColor={theme.colors.textSecondary}
                />
                {!!fullNameError && <Text style={styles.errorText}>{fullNameError}</Text>}
            </View>

            <View>
                <Text style={styles.label}>E-mail*</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={text => { setEmail(text); if (emailError) setEmailError(null); }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    maxLength={254}
                    placeholder='seuemail@email.com'
                    placeholderTextColor={theme.colors.textSecondary}
                />
                {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            <View>
                <Text style={styles.label}>Senha*</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={text => { setPassword(text); if (passwordError) setPasswordError(null); }}
                    secureTextEntry
                    maxLength={50}
                    placeholder='Su@S3nh@'
                    placeholderTextColor={theme.colors.textSecondary}
                />
                {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
                <Text style={styles.passwordTip}>{passwordTip}</Text>
            </View>

            <View>
                <Text style={styles.label}>Confirme sua senha*</Text>
                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={text => { setConfirmPassword(text); if (confirmPasswordError) setConfirmPasswordError(null); }}
                    secureTextEntry
                    maxLength={50}
                    placeholder='Su@S3nh@'
                    placeholderTextColor={theme.colors.textSecondary}
                />
                {!!confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
            </View>

            <TouchableOpacity
                onPress={handleRegister}
                style={styles.registerButton}
                disabled={loading}
            >
                <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.loginContainer}>
                <Text style={styles.textSecondary}>Já tem uma conta?</Text>
                <TouchableOpacity onPress={() => router.push('/login')} disabled={loading}>
                    <Text style={styles.link}>Faça login!</Text>
                </TouchableOpacity>
            </View>

            {/* Overlay de loading */}
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
    logo: {
        width: 80,
        height: 80,
        alignSelf: 'center'
    },
    textSecondary: {
        color: theme.colors.textSecondary,
    },
    passwordTip: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    link: {
        color: theme.colors.primary,
        textDecorationLine: 'underline',
        textDecorationColor: theme.colors.primary,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8
    },
    divider: {
        borderTopColor: theme.colors.neutralBorder,
        width: '70%',
        alignSelf: 'center',
        marginBottom: 0,
        marginTop: 4,
        borderBottomColor: theme.colors.neutralBorder,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    registerButton: {
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
