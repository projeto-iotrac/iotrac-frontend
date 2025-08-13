import Colors from "../src/constants/Colors";
import { ScrollView, Text, TouchableOpacity, View, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { apiService, Device, ProtectionStatus } from "../src/services/api";
import { useDevices } from "../src/hooks/useApi";
import StandardHeader from "../src/components/StandardHeader";

export default function DeviceDetails() {
  const { id } = useLocalSearchParams();
  const [device, setDevice] = useState<Device | null>(null);
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingCommand, setSendingCommand] = useState(false);
  const { toggleDeviceProtection } = useDevices();

  useEffect(() => {
    if (id) {
      loadDeviceDetails();
    }
  }, [id]);

  useEffect(() => {
    if (device) {
      loadProtectionStatus();
    }
  }, [device]);

  const loadDeviceDetails = async () => {
    try {
      setLoading(true);
      const deviceData = await apiService.getDeviceDetails(Number(id));
      setDevice(deviceData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar detalhes do dispositivo";
      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadProtectionStatus = async () => {
    try {
      if (device) {
        const status = await apiService.getDeviceProtectionStatus(device.id);
        setProtectionStatus({
          protection_enabled: status.protection_enabled,
          timestamp: status.timestamp
        });
      }
    } catch (error) {
      console.error("Erro ao carregar status de proteção:", error);
    }
  };

  const handleToggleProtection = async () => {
    if (!device) return;

    try {
      setSendingCommand(true);
      const response = await toggleDeviceProtection(device.id);
      setProtectionStatus({
        protection_enabled: response.protection_enabled,
        timestamp: response.timestamp
      });
      Alert.alert(
        "Sucesso",
        response.message,
        [{ text: "OK" }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao alternar proteção";
      Alert.alert("Erro", errorMessage);
    } finally {
      setSendingCommand(false);
    }
  };

  const getDeviceTitle = (deviceType: string) => {
    const typeMap: { [key: string]: string } = {
      'drone': 'Drone',
      'veículo': 'Veículo',
      'smart-lamp': 'Smart Lâmpada Wi-Fi',
      'smart-lock': 'Fechadura Inteligente',
      'security-camera': 'Câmera de Segurança',
      'smart-tv': 'Smart TV',
      'smart-thermostat': 'Termostato Inteligente'
    };

    return typeMap[deviceType] || deviceType;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, fontSize: 16 }}>
          Carregando detalhes do dispositivo...
        </Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>
          Dispositivo não encontrado
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StandardHeader />
      <ScrollView style={styles.container}>
        <Text style={{ fontSize: 20, fontWeight: '500', marginVertical: 16 }}>
          Detalhes do Dispositivo
        </Text>

      <View style={styles.contentContainer}>
        <Text><span style={styles.textBold}>Nome:</span> {getDeviceTitle(device.device_type)}</Text>
        <Text><span style={styles.textBold}>Tipo:</span> {device.device_type}</Text>
        <Text><span style={styles.textBold}>IP:</span> {device.ip_address}</Text>
        <Text><span style={styles.textBold}>Código de identificação:</span> {device.id}</Text>
        {device.registered_at && (
          <Text>
            <span style={styles.textBold}>Data de registro:</span> {new Date(device.registered_at).toLocaleString()}
          </Text>
        )}
        <Text><span style={styles.textBold}>Status:</span> {protectionStatus?.protection_enabled ? "Protegido" : "Vulnerável"}</Text>

        <View>
          <TouchableOpacity
            onPress={handleToggleProtection}
            disabled={sendingCommand}
            style={{
              backgroundColor: protectionStatus?.protection_enabled ? Colors.error : Colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 20,
              width: '100%',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 8,
              opacity: sendingCommand ? 0.6 : 1,
            }}>
            <Ionicons
              name={protectionStatus?.protection_enabled ? "alert-circle" : "shield"}
              size={20}
              style={{ color: '#FFF' }}
            />
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
              {sendingCommand
                ? "Processando..."
                : protectionStatus?.protection_enabled
                  ? "Desativar Proteção"
                  : "Ativar Proteção"
              }
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Obs.: Ao desativar a proteção, lembre-se de que o dispositivo ficará vulnerável a ataques. A IOTRAC não se responsabiliza por quaisquer prejuízos causados após a desativação da proteção.</Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16
  },
  contentContainer: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    borderColor: Colors.neutral,
    borderWidth: 1,
    display: "flex",
    gap: 16,
  },
  label: {
    fontSize: 12,
    marginTop: 8,
    color: Colors.textSecondary
  },
  textBold: {
    fontWeight: 600
  }
});