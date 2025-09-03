import { Stack } from "expo-router";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { Text, StyleSheet } from "react-native";
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
        {/* ToDo: deixar versão do release dinâmica */}
        <Text style={styles.version}>v1.0.0</Text>
      </AuthProvider>
    </ThemeProvider>
  );
} 

const styles = StyleSheet.create({
  version: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});