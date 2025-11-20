import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { AuthProvider, useAuth } from "./src/auth";
import AdminReservationsScreen from "./src/screens/AdminScreen";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import ReservationsScreen from "./src/screens/ReservationsScreen";
import TerrainsScreen from "./src/screens/TerrainsScreen";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Terrains: undefined;
  Reservations: undefined;
  AdminReservations: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function Router() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: "Retour",
          headerTitleAlign: "center",
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Connexion" }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "EasyPadel" }} />
            <Stack.Screen name="Terrains" component={TerrainsScreen} options={{ title: "Terrains & créneaux" }} />
            <Stack.Screen name="Reservations" component={ReservationsScreen} options={{ title: "Mes réservations" }} />
            {user.role === "admin" && (
              <Stack.Screen
                name="AdminReservations"
                component={AdminReservationsScreen}
                options={{ title: "Toutes les réservations" }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
