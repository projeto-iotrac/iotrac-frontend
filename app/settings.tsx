import { Text, View } from "react-native";

export default function Settings() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '500', marginVertical: 16 }}>
        Configurações
      </Text>
    </View>
  );
}