import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { login } from "../REST-API/api";
import { useAuth } from "../auth";

export default function LoginScreen({ navigation }: any) {
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email || !password) {
      Alert.alert("Erreur", "Merci de renseigner l'e-mail et le mot de passe.");
      return;
    }

    try {
      setLoading(true);

      //l’API doit renvoyer { token, user }
      const res = await login(email, password);
      const { token, user } = res;

      setUser({
        token,
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      navigation.replace("Home");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? "Impossible de se connecter.";
      Alert.alert("Erreur", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <Image
          source={require("../../assets/Logo-easypadel.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Titre */}
        <Text style={styles.title}>EasyPadel</Text>

        {/* Champs de formulaire */}
        <TextInput
          style={styles.input}
          placeholder="Adresse e-mail"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Bouton de connexion */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Connexion..." : "Se connecter"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    width: "100%",
    paddingHorizontal: 40,
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 80,
    letterSpacing: 1,
  },
  input: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2563EB",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 60,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
  },
});
