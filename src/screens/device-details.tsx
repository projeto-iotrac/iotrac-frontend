import React from "react";
import Colors from "../constants/Colors";
import { ScrollView, Text, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { apiService, Device, ProtectionStatus } from "../services/api";
import { useDevices } from "../hooks/useApi";
import { useAuth } from "../contexts/AuthContext";

export default function DeviceDetails() {
  const { id } = useLocalSearchParams();
  const [device, setDevice] = useState<Device | null>(null);
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingCommand, setSendingCommand] = useState(false);
  const { toggleDeviceProtection } = useDevices();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
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
    <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '500', marginVertical: 16 }}>
        Detalhes do Dispositivo
      </Text>

      <View style={{ 
        backgroundColor: '#f5f5f5', 
        padding: 16, 
        borderRadius: 8, 
        marginBottom: 16 
      }}>
        <Text style={{ marginBottom: 8, fontWeight: '600' }}>
          Nome: {getDeviceTitle(device.device_type)}
        </Text>
        <Text style={{ marginBottom: 8 }}>
          Tipo: {device.device_type}
        </Text>
        <Text style={{ marginBottom: 8 }}>
          IP: {device.ip_address}
        </Text>
        <Text style={{ marginBottom: 8 }}>
          ID: {device.id}
        </Text>
        {device.registered_at && (
          <Text style={{ marginBottom: 8 }}>
            Registrado em: {new Date(device.registered_at).toLocaleString()}
          </Text>
        )}
        <Text style={{ marginBottom: 8 }}>
          Status: {protectionStatus?.protection_enabled ? "Protegido" : "Vulnerável"}
        </Text>
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
              backgroundColor: protectionStatus?.protection_enabled ? Colors.error : Colors.primary,
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
              style={{color: '#FFF'}} 
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