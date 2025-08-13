import Dropdown from "../src/components/Dropdown";
import React, { useState } from "react";
import { Text, View, TextInput, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import Colors from "../src/constants/Colors";
import { apiService } from "../src/services/api";
import { DEVICE_TYPES } from "../src/constants/ApiConfig";
import { useRouter } from "expo-router";
import Button from "../src/components/Button";
import Toast from 'react-native-toast-message';
import { useAuth } from "../src/contexts/AuthContext";

export default function NewDevice() {
    const [selectedDeviceType, setSelectedDeviceType] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useAuth();

    const isOperator = user?.role === 'admin' || user?.role === 'device_operator';

    const validateIpAddress = (ip: string) => {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    };

    const handleRegisterDevice = async () => {
        setError(null);

        try {
            if (!selectedDeviceType) {
                setError("Por favor, selecione um tipo de dispositivo.");
                return;
            }

            if (!ipAddress) {
                setError("Por favor, insira o endereço IP.");
                return;
            }

            if (!validateIpAddress(ipAddress)) {
                setError("Por favor, insira um endereço IP válido.");
                return;
            }

            await apiService.registerDevice({
                device_type: selectedDeviceType,
                ip_address: ipAddress
            });

            router.replace("/home");

            Toast.show({
                type: 'success',
                text1: 'Dispositivo vinculado com sucesso!',
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao registrar dispositivo";
            setError(errorMessage);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>
                Vincular Dispositivo
            </Text>

            <View style={styles.contentContainer}>
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <>
                    <View style={{ zIndex: 1 }}>
                        <Text style={styles.label}>
                            Escolha o tipo de dispositivo que deseja vincular:
                        </Text>

                        <Dropdown
                            placeholder="Selecione o tipo de dispositivo"
                            items={DEVICE_TYPES}
                            value={selectedDeviceType}
                            onSelect={(value) => {
                                setSelectedDeviceType(value);
                                setError(null);
                            }}
                            style={[error && { borderColor: Colors.error }]}
                        />
                    </View>

                    <View>
                        <Text style={styles.label}>Endereço IP do dispositivo:</Text>

                        <TextInput
                            style={[
                                styles.input,
                                error && styles.inputError
                            ]}
                            placeholder="Ex: 192.168.1.100"
                            placeholderTextColor={'#c0c0c0'}
                            value={ipAddress}
                            onChangeText={(text) => {
                                setIpAddress(text);
                                setError(null);
                            }}
                            keyboardType="numeric"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View>
                        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Text style={styles.label}>Conectar via bluetooth:</Text>
                            <Text style={styles.tag}>Em breve!</Text>
                        </View>

                        <Button text="Parear Dispositivo" icon="bluetooth" btnClass="buttonDisabled" disabled={true} />
                    </View>

                    <Button text="Vincular Dispositivo" icon="add-circle" btnClass="buttonPrimary" onPress={handleRegisterDevice} />
                </>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    contentContainer: {
        backgroundColor: "#FFF",
        padding: 16,
        borderRadius: 8,
        borderColor: Colors.neutral,
        borderWidth: 1,
        display: "flex",
        gap: 24
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
        marginVertical: 16,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.neutral,
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#FFF',
    },
    inputError: {
        borderColor: Colors.error,
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
    },
    errorText: {
        color: Colors.error,
        fontSize: 14,
    },
    tag: {
        backgroundColor: Colors.warning,
        fontSize: 12,
        color: '#6e6303',
        borderRadius: 16,
        width: 'auto',
        paddingVertical: 4,
        fontWeight: 600,
        marginBottom: 8,
        paddingHorizontal: 8
    },
}); 