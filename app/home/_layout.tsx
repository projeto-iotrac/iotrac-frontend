import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { TouchableOpacity } from "react-native";
import Colors from "../../src/constants/Colors";

const CustomTabButton = (props: any) => {
  const filteredProps = Object.fromEntries(Object.entries(props).filter(([_, v]) => v !== null));
  return <TouchableOpacity {...filteredProps} activeOpacity={1} />;
};

export default function HomeTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case "logs":
              iconName = "document-text";
              break;
            case "index":
              iconName = "home";
              break;
            case "argos-bot":
              iconName = "chatbubbles";
              break;
            default:
              iconName = "help-circle-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondary,
        headerShown: false,
      })}
    >
      {/* Ordem: Logs (esquerda), Início (centro), Argos Bot (direita) */}
      <Tabs.Screen name="logs" options={{ title: "Logs do Sistema" }} />
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="argos-bot" options={{ title: "Argos Bot" }} />

      {/* Rotas que não devem aparecer como abas */}
      <Tabs.Screen name="device-details" options={{ href: null }} />
    </Tabs>
  );
} 