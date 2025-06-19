import { Text, View, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { apiService, LogEntry, ProtectionStatus } from "../services/api";

export default function Settings() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingProtection, setTogglingProtection] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadLogs(),
        loadProtectionStatus()
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const logsData = await apiService.getLogs(50); // Limitar a 50 logs
      setLogs(logsData);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
    }
  };

  const loadProtectionStatus = async () => {
    try {
      const status = await apiService.getProtectionStatus();
      setProtectionStatus(status);
    } catch (error) {
      console.error("Erro ao carregar status de proteção:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleProtection = async () => {
    try {
      setTogglingProtection(true);
      const response = await apiService.toggleProtection();
      setProtectionStatus(response);
      Alert.alert(
        "Sucesso", 
        response.message,
        [{ text: "OK" }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao alternar proteção";
      Alert.alert("Erro", errorMessage);
    } finally {
      setTogglingProtection(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'blocked':
        return '#ff9800';
      default:
        return '#666';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: Colors.primary }}>
          Carregando configurações...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, paddingHorizontal: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={{ fontSize: 20, fontWeight: '500', marginVertical: 16 }}>
        Configurações do Sistema
      </Text>

      {/* Status de Proteção Global */}
      <View style={{ 
        backgroundColor: '#f5f5f5', 
        padding: 16, 
        borderRadius: 8, 
        marginBottom: 16 
      }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Proteção Global
        </Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: protectionStatus?.protection_enabled ? '#4caf50' : '#f44336',
            marginRight: 8
          }} />
          <Text style={{ fontSize: 14 }}>
            Status: {protectionStatus?.protection_enabled ? "Ativada" : "Desativada"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleToggleProtection}
          disabled={togglingProtection}
          style={{
            backgroundColor: protectionStatus?.protection_enabled ? Colors.error : Colors.primary,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 6,
            alignItems: 'center',
            opacity: togglingProtection ? 0.6 : 1,
          }}>
          <Text style={{ color: '#FFF', fontWeight: '500' }}>
            {togglingProtection 
              ? "Processando..." 
              : protectionStatus?.protection_enabled 
                ? "Desativar Proteção" 
                : "Ativar Proteção"
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logs do Sistema */}
      <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 12 }}>
        Logs do Sistema
      </Text>

      {logs.length === 0 ? (
        <View style={{ 
          backgroundColor: '#f5f5f5', 
          padding: 20, 
          borderRadius: 8, 
          alignItems: 'center' 
        }}>
          <Ionicons name="document-text-outline" size={32} color="#666" />
          <Text style={{ marginTop: 8, color: '#666', textAlign: 'center' }}>
            Nenhum log encontrado
          </Text>
        </View>
      ) : (
        logs.map((log) => (
          <View 
            key={log.id} 
            style={{ 
              backgroundColor: '#f5f5f5', 
              padding: 12, 
              borderRadius: 6, 
              marginBottom: 8 
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontWeight: '600', fontSize: 12 }}>
                {log.device_type} (ID: {log.device_id})
              </Text>
              <Text style={{ 
                fontSize: 10, 
                color: getStatusColor(log.status),
                fontWeight: '500'
              }}>
                {log.status.toUpperCase()}
              </Text>
            </View>
            
            <Text style={{ fontSize: 12, marginBottom: 2 }}>
              Comando: {log.command}
            </Text>
            
            <Text style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>
              IP: {log.ip_address}
            </Text>
            
            <Text style={{ fontSize: 10, color: '#666' }}>
              {formatTimestamp(log.timestamp)}
            </Text>
          </View>
        ))
      )}

      {/* Informações da API */}
      <View style={{ 
        backgroundColor: '#f5f5f5', 
        padding: 16, 
        borderRadius: 8, 
        marginTop: 16,
        marginBottom: 20
      }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Informações da API
        </Text>
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
          Status: Conectado
        </Text>
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
          Total de Logs: {logs.length}
        </Text>
        <Text style={{ fontSize: 12, color: '#666' }}>
          Última atualização: {new Date().toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
}