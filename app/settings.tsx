import { View, Text } from 'react-native';

export default function SettingsDisabled() {
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding: 24 }}>
      <Text style={{ fontSize: 16, textAlign:'center' }}>
        Configurações estão temporariamente desativadas. Utilize as abas Início, Logs e Argos Bot.
      </Text>
    </View>
  );
}