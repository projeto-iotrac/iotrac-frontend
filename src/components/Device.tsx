import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import Colors from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

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

  const handlePress = () => {
    router.push(href);
  };

  const handleDeletePress = (e: any) => {
    // Parar a propagação do evento imediatamente
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔴 Botão de delete pressionado para dispositivo:', deviceId);
    
    if (!onDelete) {
      console.error('❌ Função onDelete não fornecida');
      Alert.alert("Erro", "Função de remoção não disponível");
      return;
    }
    
    Alert.alert(
      "Confirmar Remoção",
      "Tem certeza que deseja remover este dispositivo? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => console.log('❌ Remoção cancelada pelo usuário')
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('🔄 Iniciando remoção do dispositivo:', deviceId);
              await onDelete(deviceId);
              console.log('✅ Dispositivo removido com sucesso:', deviceId);
              Alert.alert("Sucesso", "Dispositivo removido com sucesso");
            } catch (error) {
              console.error('❌ Erro ao remover dispositivo:', error);
              const errorMessage = error instanceof Error ? error.message : "Erro ao remover dispositivo";
              Alert.alert("Erro", errorMessage);
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress} 
      activeOpacity={0.7}
      delayPressIn={200}
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
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDeletePress}
            onPressIn={(e) => {
              console.log('🔴 TESTE: Botão de delete pressionado (onPressIn)');
              e.stopPropagation();
            }}
            onPressOut={(e) => {
              console.log('🔴 TESTE: Botão de delete solto (onPressOut)');
              e.stopPropagation();
            }}
            activeOpacity={0.5}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
      height: 2,
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
    marginLeft: 4,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
    borderWidth: 2,
    borderColor: '#fed7d7',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default Device;