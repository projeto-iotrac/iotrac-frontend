import Device from "../../src/components/Device";
import DevicesMenu from "../../src/components/DevicesMenu";
import { View, Text, FlatList, RefreshControl, StyleSheet } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { apiService, Device as DeviceData, ProtectionStatus } from "../../src/services/api";
import { useDevices } from "../../src/hooks/useApi";
import { useFocusEffect } from "@react-navigation/native";

export default function Index() {
  const { devices, loading, error, refreshDevices, removeDevice } = useDevices();
  const [refreshing, setRefreshing] = useState(false);
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null);

  const loadProtectionStatus = async (showLoading = false) => {
    try {
      const status = await apiService.getProtectionStatus();
      setProtectionStatus(prevStatus => {
        const hasChanges = !prevStatus || JSON.stringify(prevStatus) !== JSON.stringify(status);
        if (hasChanges) {
          console.log('🔄 Status de proteção atualizado silenciosamente');
          return status;
        }
        return prevStatus;
      });
    } catch (err) {
      console.error('Erro ao carregar status de proteção:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDevices();
    await loadProtectionStatus(true);
    setRefreshing(false);
  };

  const handleDeleteDevice = async (deviceId: number) => {
    await removeDevice(deviceId);
  };

  useEffect(() => {
    loadProtectionStatus(true);
    const interval = setInterval(() => { 
      loadProtectionStatus(false);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshDevices();
      loadProtectionStatus(false);
      return undefined;
    }, [refreshDevices])
  );

  const getDeviceStatus = (device: DeviceData): 'Seguro' | 'Vulnerável' | 'Sob Ataque!' => {
    return device.protection_enabled ? 'Seguro' : 'Vulnerável';
  };

  const getDeviceTitle = (device: DeviceData) => {
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
      href={`/home/device-details?id=${item.id}`}
      deviceId={item.id}
      protectionEnabled={item.protection_enabled}
      onDelete={handleDeleteDevice}
    />
  );

  const ListHeaderComponent = () => (
    <>
      <DevicesMenu />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      {devices.length === 0 && !loading && !error && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhum dispositivo encontrado.{"\n"}
            Adicione um dispositivo para começar.
          </Text>
        </View>
      )}
    </>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Carregando dispositivos...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16
  },
  listContent: {
    paddingBottom: 16
  }
});