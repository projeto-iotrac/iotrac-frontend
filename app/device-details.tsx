import Colors from "@/constants/Colors";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DeviceDetails() {
  const handleDisableProtection = () => {
    alert("Proteção desativada.");
  };

  const handleEnableProtection = () => {
    alert("Proteção ativada.");
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

      {/* Exibir quando a proteção estiver ativada
       <TouchableOpacity
        onPress={handleDisableProtection}
        style={{
          backgroundColor: Colors.error,
          paddingVertical: 12,
          paddingHorizontal: 20,
          marginTop: 8,
          width: '100%',
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 8,
        }}>
        <Ionicons name="alert-circle" size={20} style={{color: '#FFF'}} /> 
        <Text style={{ color: '#FFF', fontWeight: 'bold', alignItems: 'center', justifyContent: "center", display: "flex" }}>Desativar Proteção</Text>
      </TouchableOpacity> */}

      <TouchableOpacity
        onPress={handleEnableProtection}
        style={{
          backgroundColor: Colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 20,
          marginTop: 8,
          width: '100%',
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 8,
        }}>
        <Ionicons name="shield" size={20} style={{color: '#FFF'}} /> 
        <Text style={{ color: '#FFF', fontWeight: 'bold', alignItems: 'center', justifyContent: "center", display: "flex" }}>Ativar Proteção</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}