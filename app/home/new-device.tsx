import Dropdown from "../../src/components/Dropdown";
import { useState } from "react";
import { Text, TouchableOpacity, View, TextInput, Alert, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import Colors from "../../src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { apiService } from "../../src/services/api";
import { DEVICE_TYPES } from "../../src/constants/ApiConfig";
import { useRouter } from "expo-router";

export default function NewDevice() {
    const [selectedDeviceType, setSelectedDeviceType] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const validateIpAddress = (ip: string) => {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    };

    const handleRegisterDevice = async () => {
        setError(null);

        if (!selectedDeviceType) {
            setError("Por favor, selecione um tipo de dispositivo");
            return;
        }

        if (!ipAddress) {
            setError("Por favor, insira o endereço IP");
            return;
        }

        if (!validateIpAddress(ipAddress)) {
            setError("Por favor, insira um endereço IP válido");
            return;
        }

        setLoading(true);

        try {
            await apiService.registerDevice({
                device_type: selectedDeviceType,
                ip_address: ipAddress
            });

            Alert.alert(
                "Sucesso", 
                "Dispositivo registrado com sucesso!",
                [
                    {
                        text: "OK",
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao registrar dispositivo";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView 
            style={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>
                Vincular Dispositivo
            </Text>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <Text style={styles.label}>
                Escolha o tipo de dispositivo que deseja vincular:
            </Text>

            <View style={styles.dropdownContainer}>
                <Dropdown
                    placeholder="Selecione o tipo de dispositivo"
                    items={DEVICE_TYPES}
                    value={selectedDeviceType}
                    onSelect={(value) => {
                        setSelectedDeviceType(value);
                        setError(null);
                    }}
                />
            </View>

            <Text style={styles.label}>
                Endereço IP do dispositivo:
            </Text>

            <TextInput
                style={[
                    styles.input,
                    error && ipAddress === "" && styles.inputError
                ]}
                placeholder="Ex: 192.168.1.100"
                value={ipAddress}
                onChangeText={(text) => {
                    setIpAddress(text);
                    setError(null);
                }}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TouchableOpacity
                onPress={handleRegisterDevice}
                disabled={loading}
                style={[
                    styles.button,
                    loading && styles.buttonDisabled
                ]}
                activeOpacity={0.7}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <>
                        <Ionicons name="add-circle" size={20} style={{color: '#FFF'}} />
                        <Text style={styles.buttonText}>
                            Vincular Dispositivo
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
        marginVertical: 16,
        color: Colors.primary,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
    },
    dropdownContainer: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    inputError: {
        borderColor: Colors.error,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 16,
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: Colors.error,
        fontSize: 14,
    },
});