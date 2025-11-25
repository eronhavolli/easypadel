import React, { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { getAllReservations } from "../REST-API/api";
import { useAuth } from "../auth";

type AdminReservationItem = {
  _id: string;
  user: string;
  terrain: string;
  date: string;
  heure: string;
};

export default function AdminReservationsScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminReservationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") return;

    (async () => {
      try {
        setLoading(true);
        const list = await getAllReservations(user.token);
        setData(list);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ??
          "Impossible de charger les réservations (admin).";
        Alert.alert("Erreur", msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Accès réservé aux administrateurs.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
        Toutes les réservations
      </Text>

      {loading ? (
        <Text>Chargement...</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12,
                borderWidth: 1,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontWeight: "600" }}>
                {item.user} – {item.terrain}
              </Text>
              <Text>
                {item.date} 
              </Text>
              <Text>
                {item.heure}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
