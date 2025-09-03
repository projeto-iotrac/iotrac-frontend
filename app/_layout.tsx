import { Stack } from "expo-router";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { StyleSheet } from "react-native";
import theme from "@/src/theme";

const defaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "white",
  },
};

export default function AuthLayout() {
  return (
    <ThemeProvider value={defaultTheme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ThemeProvider>
  );
} 