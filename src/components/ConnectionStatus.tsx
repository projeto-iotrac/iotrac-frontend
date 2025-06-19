import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useConnectionStatus } from '../hooks/useApi';

interface ConnectionStatusProps {
  onStatusChange?: (isConnected: boolean) => void;
  showDetails?: boolean;
}

export default function ConnectionStatus({ 
  onStatusChange, 
  showDetails = false 
}: ConnectionStatusProps) {
  const { isConnected, isChecking, lastCheck, checkConnection } = useConnectionStatus();

  // Notificar mudanças de status
  React.useEffect(() => {
    onStatusChange?.(isConnected || false);
  }, [isConnected, onStatusChange]);

  const getStatusColor = () => {
    if (isConnected === null) return Colors.gray;
    return isConnected ? Colors.success : Colors.error;
  };

  const getStatusText = () => {
    if (isChecking) return 'Verificando...';
    if (isConnected === null) return 'Desconhecido';
    return isConnected ? 'Conectado' : 'Desconectado';
  };

  const getStatusIcon = () => {
    if (isChecking) return 'sync';
    if (isConnected === null) return 'help-circle';
    return isConnected ? 'checkmark-circle' : 'close-circle';
  };

  const getLastCheckText = () => {
    if (!lastCheck) return '';
    const now = new Date();
    const diff = now.getTime() - lastCheck.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s atrás`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
    return `${Math.floor(seconds / 3600)}h atrás`;
  };

  const handlePress = () => {
    if (isChecking) return;
    
    checkConnection();
    
    if (!isConnected) {
      Alert.alert(
        'Problema de Conexão',
        'Não foi possível conectar ao servidor. Verifique:\n\n• Se o backend está rodando\n• Se o IP está correto\n• Se a rede está funcionando',
        [
          { text: 'OK' },
          { 
            text: 'Tentar Novamente', 
            onPress: () => setTimeout(checkConnection, 1000)
          }
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isChecking}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: getStatusColor(),
        opacity: isChecking ? 0.6 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Ionicons 
          name={getStatusIcon() as any} 
          size={18} 
          color={getStatusColor()} 
          style={{ marginRight: 8 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 14, 
            color: getStatusColor(),
            fontWeight: '600'
          }}>
            {getStatusText()}
          </Text>
          {showDetails && lastCheck && (
            <Text style={{ 
              fontSize: 11, 
              color: Colors.gray,
              marginTop: 2
            }}>
              Última verificação: {getLastCheckText()}
            </Text>
          )}
        </View>
      </View>
      
      {isChecking && (
        <Ionicons 
          name="sync" 
          size={16} 
          color={Colors.gray}
          style={{ 
            marginLeft: 8,
            transform: [{ rotate: '0deg' }]
          }}
        />
      )}
      
      {!isConnected && !isChecking && (
        <Ionicons 
          name="refresh" 
          size={16} 
          color={Colors.error}
          style={{ marginLeft: 8 }}
        />
      )}
    </TouchableOpacity>
  );
} 