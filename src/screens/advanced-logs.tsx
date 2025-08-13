import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService, LogEntry } from '../services/api';
import Colors from '../constants/Colors';

export default function AdvancedLogsScreen({ navigation }: any) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadLogs();
    
    // Configurar atualização automática a cada 5 segundos
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadLogs();
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const loadLogs = async () => {
    try {
      const logsData = await apiService.getLogs(500); // Carregar mais logs para análise avançada
      setLogs(logsData);
    } catch (error) {
      console.error('Erro ao carregar logs avançados:', error);
      if (!refreshing) {
        Alert.alert('Erro', 'Não foi possível carregar os logs avançados');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (autoRefresh && intervalRef.current) {
      clearInterval(intervalRef.current);
    } else if (!autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadLogs();
      }, 5000);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
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
      case 'info':
        return '#2196f3';
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
      case 'info':
        return 'information-circle';
      default:
        return 'help-circle';
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

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === '' || 
      log.command.toLowerCase().includes(filter.toLowerCase()) ||
      log.ip_address.includes(filter) ||
      log.device_type.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
    
    return matchesFilter && matchesStatus;
  });

  const getLogsByStatus = (status: string) => {
    return logs.filter(log => log.status === status).length;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics" size={48} color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando logs avançados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="analytics" size={32} color={Colors.primary} />
          <Text style={styles.headerTitle}>Logs Avançados</Text>
          <Text style={styles.headerSubtitle}>
            Monitoramento detalhado em tempo real
          </Text>
        </View>

        {/* Controles */}
        <View style={styles.controlsContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Filtrar logs..."
              value={filter}
              onChangeText={setFilter}
            />
          </View>

          <TouchableOpacity
            style={[styles.autoRefreshButton, autoRefresh && styles.autoRefreshActive]}
            onPress={toggleAutoRefresh}
          >
            <Ionicons 
              name={autoRefresh ? "sync" : "sync-outline"} 
              size={20} 
              color={autoRefresh ? "#fff" : Colors.primary} 
            />
            <Text style={[styles.autoRefreshText, autoRefresh && styles.autoRefreshTextActive]}>
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtros de Status */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
          <TouchableOpacity
            style={[styles.statusFilter, selectedStatus === 'all' && styles.statusFilterActive]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text style={[styles.statusFilterText, selectedStatus === 'all' && styles.statusFilterTextActive]}>
              Todos ({logs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusFilter, selectedStatus === 'success' && styles.statusFilterActive]}
            onPress={() => setSelectedStatus('success')}
          >
            <Text style={[styles.statusFilterText, selectedStatus === 'success' && styles.statusFilterTextActive]}>
              Sucesso ({getLogsByStatus('success')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusFilter, selectedStatus === 'error' && styles.statusFilterActive]}
            onPress={() => setSelectedStatus('error')}
          >
            <Text style={[styles.statusFilterText, selectedStatus === 'error' && styles.statusFilterTextActive]}>
              Erro ({getLogsByStatus('error')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusFilter, selectedStatus === 'blocked' && styles.statusFilterActive]}
            onPress={() => setSelectedStatus('blocked')}
          >
            <Text style={[styles.statusFilterText, selectedStatus === 'blocked' && styles.statusFilterTextActive]}>
              Bloqueado ({getLogsByStatus('blocked')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusFilter, selectedStatus === 'warning' && styles.statusFilterActive]}
            onPress={() => setSelectedStatus('warning')}
          >
            <Text style={[styles.statusFilterText, selectedStatus === 'warning' && styles.statusFilterTextActive]}>
              Aviso ({getLogsByStatus('warning')})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Estatísticas Detalhadas */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{logs.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {logs.filter(log => new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </Text>
              <Text style={styles.statLabel}>Últimas 24h</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {logs.filter(log => new Date(log.timestamp) > new Date(Date.now() - 60 * 60 * 1000)).length}
              </Text>
              <Text style={styles.statLabel}>Última Hora</Text>
            </View>
          </View>
        </View>

        {/* Lista de Logs Filtrados */}
        <Text style={styles.sectionTitle}>
          Logs Filtrados ({filteredLogs.length})
        </Text>
        
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="filter-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum log encontrado</Text>
            <Text style={styles.emptySubtext}>
              Tente ajustar os filtros ou aguarde novos logs
            </Text>
          </View>
        ) : (
          filteredLogs.map((log) => (
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

        {/* Indicador de Atualização */}
        {autoRefresh && (
          <View style={styles.updateIndicator}>
            <Ionicons name="sync" size={16} color={Colors.primary} />
            <Text style={styles.updateIndicatorText}>
              Atualizando automaticamente a cada 5 segundos
            </Text>
          </View>
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
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    fontSize: 16,
  },
  autoRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  autoRefreshActive: {
    backgroundColor: Colors.primary,
  },
  autoRefreshText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  autoRefreshTextActive: {
    color: '#fff',
  },
  statusFilters: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusFilterActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusFilterText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: '#fff',
  },
  statsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    margin: 16,
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
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
    borderRadius: 8,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  updateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    gap: 8,
  },
  updateIndicatorText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
}); 