import Colors from "../../src/constants/Colors";
import { ScrollView, Text, TouchableOpacity, View, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { apiService, Device, ProtectionStatus } from "../../src/services/api";
import { useDevices } from "../../src/hooks/useApi";
import { useAuth } from "../../src/contexts/AuthContext";
import theme from "@/src/theme";
import { useNavigation } from "@react-navigation/native";

export default function DeviceDetails() {
  const { id } = useLocalSearchParams();
  const [device, setDevice] = useState<Device | null>(null);
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingCommand, setSendingCommand] = useState(false);
  const { toggleDeviceProtection } = useDevices();
  const { user } = useAuth();
  const navigation = useNavigation();
  const isOperator = user?.role === 'admin' || user?.role === 'device_operator';

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
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity onPress={() => navigation.navigate('index' as never)}>
          <Ionicons name="chevron-back-outline" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes do Dispositivo</Text>
      </View>

      <View>
        <Text style={styles.deviceName}>{getDeviceTitle(device.device_type)}</Text>
        {/* ToDo: adicionar cadastro de ambiente e deixar essa informação dinâmica */}
        {/* <Text style={styles.deviceEnvironment}>Sala de reuniões</Text> */}
      </View>

      <View>
        <Text style={styles.deviceInfo}>Informações de segurança:</Text>
        <Text style={styles.text}>
          Status: {protectionStatus?.protection_enabled ? "Protegido" : "Vulnerável"}
        </Text>
      </View>

      <View>
        <Text style={styles.deviceInfo}>Informações gerais:</Text>
        <Text style={styles.text}>IP: {device.ip_address}</Text>
        <Text style={styles.text}>ID: {device.id}</Text>
        {device.registered_at && (
          <Text style={styles.text}>
            Registrado em: {new Date(device.registered_at).toLocaleString()}
          </Text>
        )}
        <Text style={styles.text}>Tipo: {device.device_type}</Text>
      </View>

      {/* Controle de Proteção - admins e operadores */}
      {isOperator && (
        <>
          <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 12 }}>
            Controle de Proteção
          </Text>

          <TouchableOpacity
            onPress={handleToggleProtection}
            disabled={sendingCommand}
            style={{
              backgroundColor: protectionStatus?.protection_enabled ? Colors.error : theme.colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 20,
              marginBottom: 32,
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
        </>
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
  title: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary
  },
  deviceEnvironment: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  deviceInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 6,
  },
  text: {
    marginBottom: 4,
  }
});