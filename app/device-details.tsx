import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity } from "react-native";

export default function DeviceDetails() {
  const router = useRouter();

  const handleDisableProtection = () => {
    alert("Proteção desativada.");
  };

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '500', marginVertical: 16 }}>
        Detalhes do Dispositivo
      </Text>

      <Text style={{ marginBottom: 8 }}>
        Nome do Dispositivo: Smart Lâmpada Wi-Fi
      </Text>
      <Text style={{ marginBottom: 8 }}>
        Status: Seguro
      </Text>
      <Text style={{ marginBottom: 8 }}>
        Descrição: Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </Text>

      <TouchableOpacity
        onPress={handleDisableProtection}
        style={{
          backgroundColor: Colors.error,
          paddingVertical: 12,
          paddingHorizontal: 20,
          marginTop: 8,
          width: '100%',
          alignItems: 'center',
        }}>
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Desativar Proteção</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}