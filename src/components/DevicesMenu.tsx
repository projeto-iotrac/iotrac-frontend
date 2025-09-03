import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme';

const DevicesMenu = () => {
  const router = useRouter();

  const handleAddDevice = () => {
    try {
      console.log('🔄 Tentando navegar para /home/new-device');
      router.push("/home/new-device");
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
      Alert.alert('Erro', 'Erro ao navegar para nova tela');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dispositivos</Text>

      <TouchableOpacity onPress={handleAddDevice} activeOpacity={0.7}>
        <Ionicons
          name="add"
          size={20}
          color={"white"}
          style={styles.addIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  addIcon: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    display: "flex"
  },
});

export default DevicesMenu;