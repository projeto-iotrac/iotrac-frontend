import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

const DevicesMenu = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
  };

  const handleAddDevice = () => {
    closeDropdown();
    try {
      router.push("/new-device");
    } catch (error) {
      Alert.alert('Erro', 'Erro ao navegar para nova tela');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.text}>Dispositivos</Text>

        <View style={styles.buttonContainer}>
          {/* Botão de menu */}
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={toggleDropdown}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {dropdownVisible && (
        <>
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleAddDevice}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.dropdownText}>
                Adicionar novo dispositivo
              </Text>
            </TouchableOpacity>
          </View>
          <Pressable 
            style={[StyleSheet.absoluteFill, { zIndex: 2 }]} 
            onPress={closeDropdown} 
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
    marginTop: 16,
    position: 'relative',
    zIndex: 3,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 30,
    right: 9,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    display: 'flex',
    minWidth: 200,
    elevation: 10,
    zIndex: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  dropdownText: {
    fontSize: 16,
  }
});

export default DevicesMenu;