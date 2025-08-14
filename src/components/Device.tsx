import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Modal, ActivityIndicator } from 'react-native';
import { apiService } from "../../src/services/api";
import Colors from "../../src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Button from './Button';
import { useAuth } from "../contexts/AuthContext";

interface DeviceProps {
  title: string;
  subtitle: string;
  href: string;
  deviceId: number;
  protectionEnabled?: boolean;
  onDelete?: (deviceId: number) => Promise<void>;
}

const getStatusColor = (subtitle?: string) => {
  switch (subtitle) {
    case 'Seguro':
      return Colors.success;
    case 'Vulnerável':
      return Colors.warning;
    case 'Sob Ataque!':
      return Colors.error;
    default:
      return '#000';
  }
};

const Device: React.FC<DeviceProps> = ({ title, subtitle, href, deviceId, protectionEnabled, onDelete }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePress = () => {
    router.push(href);
  };

  const handleDeleteDevice = async (deviceId: number) => {
    try {
      setIsDeleting(true);

      if (onDelete) {
        await onDelete(deviceId); // Atualiza lista imediatamente via pai (Home)
      } else {
        await apiService.deleteDevice(deviceId); // Fallback
      }

      Alert.alert("Sucesso", "Dispositivo excluído com sucesso!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao excluir dispositivo";
      console.error("❌ Erro ao excluir dispositivo:", errorMessage);
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const isOperator = user?.role === 'admin' || user?.role === 'device_operator';

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.7}
        delayPressIn={200}
        disabled={isDeleting}
      >
        <View style={styles.content}> 
          <View style={styles.info}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(subtitle) }]} />
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            {protectionEnabled !== undefined && (
              <View style={styles.protectionContainer}>
                <Ionicons
                  name={protectionEnabled ? "shield-checkmark" : "shield-outline"}
                  size={16}
                  color={protectionEnabled ? Colors.success : Colors.warning}
                />
                <Text style={[styles.protectionText, { color: protectionEnabled ? Colors.success : Colors.warning }]}> 
                  {protectionEnabled ? "Protegido" : "Desprotegido"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            {isOperator && (
              <Button
                icon="trash"
                btnClass="buttonDelete"
                onPress={() => {
                  handleDeleteDevice(deviceId);
                }}
                disabled={isDeleting}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isDeleting}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.modalText}>Excluindo dispositivo...</Text>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  protectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  protectionText: {
    fontSize: 12,
    marginLeft: 6,
  },
  actions: {
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    marginTop: 8,
    color: Colors.primary,
  },
});

export default Device;