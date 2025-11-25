import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../App";
import { useAuth } from "../auth";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { user, setUser } = useAuth();

  function handleLogout() {
    // On efface l'utilisateur du contexte
    setUser(null);
    // On revient proprement sur l'écran de Login
    navigation.replace("Login");
  }

  return (
    <View style={styles.container}>
      {/* CONTENU PRINCIPAL (logo + boutons bleus) */}
      <View style={styles.main}>
        {/* LOGO + TITRE */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/Logo-easypadel.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>EasyPadel</Text>
          <Text style={styles.welcome}>
            Bonjour <Text style={{ fontWeight: "700" }}>{user?.username}</Text>
          </Text>
        </View>

        {/* CARTE AVEC LES ACTIONS */}
        <View style={styles.card}>
          {/* (Titre laissé vide pour garder design) */}
          <Text style={styles.cardTitle}></Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Terrains")}
          >
            <Text style={styles.actionText}>Réserver un créneau</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Reservations")}
          >
            <Text style={styles.actionText}>Mes réservations</Text>
          </TouchableOpacity>

          {user?.role === "admin" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("AdminReservations")}
            >
              <Text style={styles.actionText}>
                Toutes les réservations (Admin)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* BOUTON DECONNEXION */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>SE DÉCONNECTER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 16,
  },
  // (header + carte)
  main: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 120,
    marginBottom: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  welcome: {
    fontSize: 16,
    color: "#000000ff",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#4575ddff",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: "center",
  },
  actionText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  // bouton rouge en bas
  logoutButton: {
    marginTop: 16,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "crimson",
    alignItems: "center",
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});