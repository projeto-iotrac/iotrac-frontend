import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

// ToDo: deixar nome do usuário dinâmico
export default function Header({ name = "Natali" }) {
  const route = useRoute();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.avatar}>
          <MaterialIcons name="person" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity>
            <Ionicons name="shield-checkmark-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {route.path === "/home" && (
        <Text style={styles.greeting}>Olá, {name}!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#02003B",
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 16,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A4A7A",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    color: "#fff",
    fontSize: 18,
    flex: 1,
    paddingTop: 12
  },
  actions: {
    flexDirection: "row",
    gap: 20,
  },
});