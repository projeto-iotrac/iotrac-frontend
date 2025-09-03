import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { TouchableOpacity } from "react-native";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import theme from "@/src/theme";
import Header from "@/src/components/Header";

const CustomTabButton = (props: any) => {
  const filteredProps = Object.fromEntries(
    Object.entries(props).filter(([_, v]) => v !== null)
  );
  return <TouchableOpacity {...filteredProps} activeOpacity={1} />;
};

const defaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "white",
  },
};

export default function Layout() {
  return (
    <ThemeProvider value={defaultTheme}> 
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
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: 'white',
            zIndex: 1,
          },
            headerShown: true,
          header: () => <Header />,
        })}
      >
        <Tabs.Screen name="logs" options={{ title: "Logs do Sistema" }} />
        <Tabs.Screen name="index" options={{ title: "Início" }} />
        <Tabs.Screen name="argos-bot" options={{ title: "Argos Bot" }} />
        <Tabs.Screen name="device-details" options={{ href: null }} />
        <Tabs.Screen name="new-device" options={{ href: null }} />
      </Tabs>
    </ThemeProvider>
  );
}