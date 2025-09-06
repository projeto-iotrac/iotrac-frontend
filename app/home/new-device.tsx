import Dropdown from "../../src/components/Dropdown";
import { useState } from "react";
import { Text, View, TextInput, ScrollView, StyleSheet, Modal, ActivityIndicator } from "react-native";
import Colors from "../../src/constants/Colors";
import { apiService } from "../../src/services/api";
import { DEVICE_TYPES } from "../../src/constants/ApiConfig";
import { useRouter } from "expo-router";
import Button from "../../src/components/Button";
import Toast from 'react-native-toast-message';
import theme from "@/src/theme";

export default function NewDevice() {
    const [selectedDeviceType, setSelectedDeviceType] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [deviceTypesError, setDeviceTypesError] = useState<string | null>(null);
    const [IPError, setIPError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const validateIpAddress = (ip: string) => {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    };

    const handleRegisterDevice = async () => {
        setError(null);
        setDeviceTypesError(null);
        setIPError(null);

        if (!selectedDeviceType || !ipAddress || !validateIpAddress(ipAddress)) {
            if (!selectedDeviceType) {
                setDeviceTypesError("Selecione uma opção!");
            }

            if (!ipAddress) {
                setIPError("Preencha este campo!");
                return;
            }

            if (!validateIpAddress(ipAddress)) {
                setIPError("Por favor, insira um endereço de IP válido.");
            }

            return;
        }

        try {
            setLoading(true);

            await apiService.registerDevice({
                device_type: selectedDeviceType,
                ip_address: ipAddress
            });

            setSelectedDeviceType("");
            setIpAddress("");

            router.replace("/home");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao registrar dispositivo. Tente novamente mais tarde!";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleIPAddressChange = (text: string) => {
        setIpAddress(text);
        if (IPError) setIPError(null);
    };

    const handleSelectedDeviceChange = (value: string) => {
        setSelectedDeviceType(value);
        setDeviceTypesError(null);
    };

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Vincular Dispositivo</Text>

            {error && <Text style={styles.errorAlert}>{error}</Text>}

            <View>
                <View style={{ zIndex: 1 }}>
                    <Text style={styles.label}>
                        Tipo de dispositivo*
                    </Text>

                    <Dropdown
                        placeholder="Selecione uma opção"
                        items={DEVICE_TYPES}
                        value={selectedDeviceType}
                        onSelect={handleSelectedDeviceChange}
                        style={[error && { borderColor: Colors.error }]}
                    />
                    {deviceTypesError && <Text style={styles.errorText}>{deviceTypesError}</Text>}
                </View>
            </View>

            <View style={[styles.contentContainer]}>
                <View>
                    <Text style={styles.label}>Endereço IP do dispositivo:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: 192.168.1.100"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={ipAddress}
                        onChangeText={handleIPAddressChange}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {IPError && <Text style={styles.errorText}>{IPError}</Text>}
                </View>

                <View>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={styles.label}>Conectar via bluetooth:</Text>
                        <Text style={styles.tag}>Em breve!</Text>
                    </View>
                    <Button text="Parear Dispositivo" btnClass="buttonDisabled" disabled={true} />
                </View>
            </View>
            <Button text="Vincular" btnClass={["buttonPrimary", "buttonEnd"]} onPress={handleRegisterDevice} />

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
        gap: 16,
        flexGrow: 1
    },
    contentContainer: {
        padding: 16,
        borderRadius: 8,
        borderColor: theme.colors.neutralBorder,
        borderWidth: 1,
        flexGrow: 0,
        gap: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
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
        fontWeight: "600",
        marginBottom: 4,
        paddingHorizontal: 8
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
