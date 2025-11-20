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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit() {
    try {
      const data = await login(username, password);
      setUser({
        userId: data.userId,
        username: data.username,
        role: data.role,
      });
      navigation.replace("Home");
    } catch (err: any) {
      Alert.alert("Erreur", err?.response?.data?.message ?? "Connexion impossible.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Logo */}
      <Image
        source={require("../../assets/Logo-easypadel.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Titre */}
      <Text style={styles.title}>EasyPadel</Text>

      {/* Zone de formulaire */}
      <View style={styles.form}>
        <TextInput
          placeholder="Identifiant"
          placeholderTextColor="#999"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {/* Bouton login */}
        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>SE CONNECTER</Text>
        </TouchableOpacity>

        {/* Lien inscription (non fonctionnel ici) */}
        <TouchableOpacity onPress={() => Alert.alert("Pas encore implémenté")}>
          <Text style={styles.register}>Pas de compte ? S’inscrire</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 60,
  },
  form: {
    width: "100%",
    alignItems: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0d6efd",
    width: "100%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  register: {
    marginTop: 18,
    color: "#0d6efd",
    fontSize: 14,
  },
});


/*import React, { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { login } from "../REST-API/api";
import { useAuth } from "../auth";

export default function LoginScreen({ navigation }: any) {
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit() {
    try {
      const data = await login(username, password); // username/password uniquement
      setUser({ userId: data.userId, username: data.username, role: data.role });
      navigation.replace("Home");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Connexion impossible";
      Alert.alert("Erreur", msg);
    }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Se connecter" onPress={onSubmit} />
    </View>
  );
}
*/