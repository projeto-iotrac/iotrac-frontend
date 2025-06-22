import { Text, View, ScrollView, TouchableOpacity, RefreshControl, Alert, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../src/constants/Colors";
import { apiService, LogEntry, ProtectionStatus } from "../src/services/api";

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
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.container}>
        <Text style={styles.title}>Configurações do Sistema</Text>
        <View style={styles.contentContainer}>
          <Text style={styles.subtitle}>Proteção Global</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
              borderRadius: 6,
              alignItems: 'center',
              opacity: togglingProtection ? 0.6 : 1,
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8
            }}>
            <Ionicons
              name={protectionStatus?.protection_enabled ? "alert-circle" : "shield"}
              size={20}
              style={{ color: '#FFF' }}
            />
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

        <View style={styles.contentContainer}>
          <Text style={styles.subtitle}>Logs do Sistema</Text>

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
                <Text style={{ fontSize: 10, color: '#999' }}>
                  {formatTimestamp(log.timestamp)}
                </Text>
              </View>
            ))
          )}
        </View>
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
    gap: 16,
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});