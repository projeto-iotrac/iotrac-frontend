import Device from "../src/components/Device";
import DevicesMenu from "../src/components/DevicesMenu";
import { View, Text, Alert, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { apiService, Device as DeviceData, ProtectionStatus } from "../src/services/api";
import Colors from "../src/constants/Colors";
import { useDevices } from "../src/hooks/useApi";

export default function Index() {
  const { devices, loading, error, refreshDevices, removeDevice } = useDevices();
  const [refreshing, setRefreshing] = useState(false);
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null);

  const loadProtectionStatus = async () => {
    try {
      const status = await apiService.getProtectionStatus();
      setProtectionStatus(status);
    } catch (err) {
      console.error('Erro ao carregar status de proteção:', err);
    }
  };

    const onRefresh = async () => {
    console.log('Refresh iniciado');
    setRefreshing(true);
    await refreshDevices();
    await loadProtectionStatus();
    setRefreshing(false);
  };

  const handleDeleteDevice = async (deviceId: number) => {
    console.log('🔄 Index: Iniciando remoção do dispositivo:', deviceId);
    await removeDevice(deviceId);
    console.log('✅ Index: Dispositivo removido com sucesso:', deviceId);
  };

  useEffect(() => {
    console.log('Componente Index montado');
    loadProtectionStatus();

    // Atualizar status a cada 5 segundos
    const interval = setInterval(() => {
      loadProtectionStatus();
    }, 5000);

    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  }, []);

  const getDeviceStatus = (device: DeviceData): 'Seguro' | 'Vulnerável' | 'Sob Ataque!' => {
    // Usar proteção individual do dispositivo em vez da proteção global
    return device.protection_enabled ? 'Seguro' : 'Vulnerável';
  };

  const getDeviceTitle = (device: DeviceData) => {
    // Mapeia os tipos de dispositivo para títulos mais amigáveis
    const typeMap: { [key: string]: string } = {
      'drone': 'Drone',
      'veículo': 'Veículo',
      'smart-lamp': 'Smart Lâmpada Wi-Fi',
      'smart-lock': 'Fechadura Inteligente',
      'security-camera': 'Câmera de Segurança',
      'smart-tv': 'Smart TV',
      'smart-thermostat': 'Termostato Inteligente'
    };
    
    return typeMap[device.device_type] || device.device_type;
  };

  const renderItem = ({ item }: { item: DeviceData }) => (
    <Device
      key={item.id}
      title={getDeviceTitle(item)}
      subtitle={getDeviceStatus(item)}
      href={`/device-details?id=${item.id}`}
      deviceId={item.id}
      protectionEnabled={item.protection_enabled}
      onDelete={handleDeleteDevice}
    />
  );

  const ListHeaderComponent = () => (
    <>
      {error && (
        <View style={{
          backgroundColor: '#ffebee',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16
        }}>
          <Text style={{ color: '#c62828', textAlign: 'center' }}>
            {error}
          </Text>
        </View>
      )}

      {devices.length === 0 && !loading && !error && (
        <View style={{
          padding: 40,
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
            Nenhum dispositivo encontrado.{'\n'}
            Adicione um dispositivo para começar.
          </Text>
        </View>
      )}
    </>
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: Colors.primary }}>
          Carregando dispositivos...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 0 }}>
      {/* DevicesMenu fora do FlatList */}
      <DevicesMenu />
      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}