import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import Colors from "../constants/Colors";
import { LinearGradient } from 'expo-linear-gradient';

const CustomTabButton = (props: any) => {
  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(([_, v]) => v !== null)
  );
  return <TouchableOpacity {...filteredProps} activeOpacity={1} />;
};

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "index":
              iconName = "home";
              break;
              case "settings":
              iconName = "settings";
              break;
            default:
              iconName = "help-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondary,
        tabBarPressColor: 'transparent',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0
        },
        tabBarButton: (props) => <CustomTabButton {...props} />,
        headerShown: true,

        header: () => (
          <View style={{ padding: 16, paddingTop: 40, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary }}>
            <Ionicons name="shield-half" size={20} style={{color: '#FFF'}} /> 
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: "#FFFFFF" }}>IOTRAC</Text>
          </View>
        ),
      })}
    >

      <Tabs.Screen name="index" options={{
        title: "Início",
      }} />

      <Tabs.Screen name="device-details" options={{
        title: "Início",
        href: null
      }} />

      <Tabs.Screen name="settings" options={{
        title: "Configurações",
      }} />

      <Tabs.Screen name="new-device" options={{
        title: "Novo Dispositivo",
        href: null
      }} />
    </Tabs>
  );
}