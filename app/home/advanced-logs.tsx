import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { apiService, LogEntry } from '../../src/services/api';
import Colors from '../../src/constants/Colors';
import theme from '@/src/theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function AdvancedLogsScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();

  useEffect(() => { loadLogs(); }, []);
  useEffect(() => {
    if (autoRefresh) { intervalRef.current = setInterval(() => loadLogs(), 5000); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh]);

  const loadLogs = async () => {
    try { const logsData = await apiService.getLogs(500); setLogs(logsData); }
    catch (error) { console.error('Erro ao carregar logs avançados:', error); if (!refreshing) Alert.alert('Erro', 'Não foi possível carregar os logs avançados'); }
    finally { setLoading(false); }
  };

  const onRefresh = async () => { setRefreshing(true); await loadLogs(); setRefreshing(false); };
  const toggleAutoRefresh = () => setAutoRefresh(v => !v);
  const formatTimestamp = (t: string) => new Date(t).toLocaleString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'blocked': return theme.colors.warning;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.info || theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };
  const getStatusIcon = (s: string) => s.toLowerCase() === 'success' ? 'checkmark-circle' : s === 'error' ? 'close-circle' : s === 'blocked' ? 'shield-checkmark' : s === 'warning' ? 'warning' : s === 'info' ? 'information-circle' : 'help-circle';
  const filteredLogs = logs.filter(l => {
    const f = filter.toLowerCase();
    const matchesFilter = !f || l.command.toLowerCase().includes(f) || l.ip_address.includes(filter) || l.device_type.toLowerCase().includes(f);
    const matchesStatus = selectedStatus === 'all' || l.status === selectedStatus;
    return matchesFilter && matchesStatus;
  });
  const getLogsByStatus = (s: string) => logs.filter(l => l.status === s).length;

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (loading && !refreshing)
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics" size={48} color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando logs avançados...</Text>
      </View>
    );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('index' as never)} style={styles.backButton}>
          <Ionicons name="chevron-back-outline" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes do Dispositivo</Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filtrar logs..."
            placeholderTextColor={theme.colors.textSecondary}
            value={filter}
            onChangeText={setFilter}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.autoRefreshButton,
            autoRefresh && styles.autoRefreshActive,
          ]}
          onPress={toggleAutoRefresh}
        >
          <Ionicons
            name={autoRefresh ? 'sync' : 'sync-outline'}
            size={20}
            color={autoRefresh ? theme.colors.neutralBackground : theme.colors.primary}
          />
          <Text
            style={[
              styles.autoRefreshText,
              autoRefresh && styles.autoRefreshTextActive,
            ]}
          >
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: `Todos (${logs.length})` },
            { key: 'success', label: `Sucesso (${getLogsByStatus('success')})` },
            { key: 'error', label: `Erro (${getLogsByStatus('error')})` },
            { key: 'blocked', label: `Bloqueado (${getLogsByStatus('blocked')})` },
            { key: 'warning', label: `Aviso (${getLogsByStatus('warning')})` },
          ].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.statusFilter,
                selectedStatus === f.key && styles.statusFilterActive,
              ]}
              onPress={() => setSelectedStatus(f.key)}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  selectedStatus === f.key && styles.statusFilterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>


      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{logs.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {logs.filter(l => new Date(l.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
            </Text>
            <Text style={styles.statLabel}>Últimas 24h</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {logs.filter(l => new Date(l.timestamp) > new Date(Date.now() - 60 * 60 * 1000)).length}
            </Text>
            <Text style={styles.statLabel}>Última Hora</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Logs Filtrados ({filteredLogs.length})</Text>

      {filteredLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="filter-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>Nenhum log encontrado</Text>
          <Text style={styles.emptySubtext}>
            Tente ajustar os filtros ou aguarde novos logs
          </Text>
        </View>
      ) : (
        filteredLogs.map(log => (
          <View key={log.id} style={styles.logItem}>
            <View style={styles.logHeader}>
              <View style={styles.logStatus}>
                <Ionicons
                  name={getStatusIcon(log.status)}
                  size={16}
                  color={getStatusColor(log.status)}
                />
                <Text style={[styles.logStatusText, { color: getStatusColor(log.status) }]}>
                  {log.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.logTimestamp}>{formatTimestamp(log.timestamp)}</Text>
            </View>
            <View style={styles.logContent}>
              <Text style={styles.logDevice}>
                {log.device_type} (ID: {log.device_id})
              </Text>
              <Text style={styles.logCommand}>Comando: {log.command}</Text>
              <Text style={styles.logIP}>IP: {log.ip_address}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
    flexGrow: 1,
    backgroundColor: theme.colors.neutralBackground,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutralBackground,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.primary,
    marginTop: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
    backgroundColor: theme.colors.neutralBackground,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  autoRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.neutralBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 8,
  },
  autoRefreshActive: {
    backgroundColor: theme.colors.primary,
  },
  autoRefreshText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  autoRefreshTextActive: {
    color: theme.colors.neutralBackground,
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
    backgroundColor: theme.colors.neutralBackground,
  },
  statusFilterActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusFilterText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: theme.colors.neutralBackground,
  },
  statsContainer: {
    borderRadius: 8,
    padding: 16,
    borderColor: theme.colors.neutralBorder,
    borderWidth: 1,
    backgroundColor: theme.colors.neutralBackground,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    width: '33%',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
    backgroundColor: theme.colors.neutralBackground,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  logItem: {
    backgroundColor: theme.colors.neutralBackground,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.neutralBorder,
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
    color: theme.colors.textSecondary,
  },
  logContent: {
    gap: 4,
  },
  logDevice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  logCommand: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  logIP: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
});