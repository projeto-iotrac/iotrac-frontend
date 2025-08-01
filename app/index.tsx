import Device from "../src/components/Device";
import DevicesMenu from "../src/components/DevicesMenu";
import { View, Text, ScrollView, FlatList, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { apiService, Device as DeviceData, ProtectionStatus } from "../src/services/api";
import Colors from "../src/constants/Colors";
import { useDevices } from "../src/hooks/useApi";
import Banner from "../src/components/Banner";
import Toast from 'react-native-toast-message';

export default function Index() {
  const { devices, error, refreshDevices, removeDevice } = useDevices();
  const [refreshing, setRefreshing] = useState(false);
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefreshing, setAutoRefreshing] = useState(false);

  const loadProtectionStatus = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setAutoRefreshing(true);
      } else {
        setLoading(true);
      }
      const status = await apiService.getProtectionStatus();

      setProtectionStatus(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(status)) {
          return status;
        }
        return prev;
      });

    } catch (err) {
      console.error('Erro ao carregar status de proteção:', err);
    } finally {
      if (isAutoRefresh) {
        setAutoRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDevices();
    await loadProtectionStatus();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProtectionStatus();

    // Atualizar status a cada 5 segundos
    const interval = setInterval(() => {
      loadProtectionStatus(true); // auto refresh, não mostra loading global
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
          <Text style={{ fontSize: 16, color: Colors.textSecondary, textAlign: 'center' }}>
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
    <ScrollView>
      <View style={{ zIndex: 999 }}>
        <Toast />
      </View>
      <Banner source={require('../assets/images/banner.png')} />

      <View style={{ flex: 1, padding: 16, paddingTop: 0 }}>
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
    </ScrollView>
  );
}