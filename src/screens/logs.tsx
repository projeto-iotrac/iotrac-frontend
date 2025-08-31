import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService, LogEntry } from '../services/api';
import Colors from '../constants/Colors';
import Header from '../components/Header';
import { Link } from 'expo-router';

export default function LogsScreen({ navigation }: any) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const logsData = await apiService.getLogs(100); // Limitar a 100 logs
      setLogs(logsData);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      Alert.alert('Erro', 'Não foi possível carregar os logs do sistema');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'blocked':
        return '#ff9800';
      case 'warning':
        return '#ffc107';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'blocked':
        return 'shield-checkmark';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getDeviceTypeLabel = (deviceType: string) => {
    const typeMap: { [key: string]: string } = {
      'drone': 'Drone',
      'veículo': 'Veículo',
      'smart-lamp': 'Smart Lâmpada',
      'smart-lock': 'Fechadura',
      'security-camera': 'Câmera',
      'smart-tv': 'Smart TV',
      'smart-thermostat': 'Termostato'
    };
    
    return typeMap[deviceType] || deviceType;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="document-text" size={48} color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>Logs do Sistema</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Botão para Logs Avançados */}
        <Link href="/(tabs)/advanced-logs" asChild>
          <TouchableOpacity style={styles.advancedButtonRaw}>
            <Text style={styles.advancedButtonRawText}>Abrir Logs Avançados</Text>
          </TouchableOpacity>
        </Link>

        {/* Estatísticas Rápidas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{logs.length}</Text>
            <Text style={styles.statLabel}>Total de Logs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {logs.filter(log => log.status === 'blocked').length}
            </Text>
            <Text style={styles.statLabel}>Bloqueios</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {logs.filter(log => log.status === 'error').length}
            </Text>
            <Text style={styles.statLabel}>Erros</Text>
          </View>
        </View>

        {/* Lista de Logs */}
        <Text style={styles.sectionTitle}>Logs Recentes</Text>
        
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum log encontrado</Text>
            <Text style={styles.emptySubtext}>
              Os logs aparecerão aqui quando houver atividade no sistema
            </Text>
          </View>
        ) : (
          logs.slice(0, 20).map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logHeader}>
                <View style={styles.logStatus}>
                  <Ionicons
                    name={getStatusIcon(log.status)}
                    size={16}
                    color={getStatusColor(log.status)}
                  />
                  <Text style={[
                    styles.logStatusText,
                    { color: getStatusColor(log.status) }
                  ]}>
                    {log.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.logTimestamp}>
                  {formatTimestamp(log.timestamp)}
                </Text>
              </View>
              
              <View style={styles.logContent}>
                <Text style={styles.logDevice}>
                  {getDeviceTypeLabel(log.device_type)} (ID: {log.device_id})
                </Text>
                <Text style={styles.logCommand}>
                  Comando: {log.command}
                </Text>
                <Text style={styles.logIP}>
                  IP: {log.ip_address}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Botão para ver mais logs */}
        {logs.length > 20 && (
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>Ver Todos os Logs</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 16,
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  advancedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    margin: 16,
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    margin: 16,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  logItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  logTimestamp: {
    fontSize: 10,
    color: '#666',
  },
  logContent: {
    gap: 4,
  },
  logDevice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logCommand: {
    fontSize: 12,
    color: '#555',
  },
  logIP: {
    fontSize: 11,
    color: '#666',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    margin: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  moreButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '400',
    marginRight: 8,
  },
  advancedButtonRaw: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cfcfcf',
    margin: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  advancedButtonRawText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '400',
  },
}); 