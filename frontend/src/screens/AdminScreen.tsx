import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { getAllReservations } from "../REST-API/api";

export default function AdminReservationsScreen() {
  const [rows, setRows] = useState<Array<{ _id: string; user: string; terrain: string; date: string; heure: string }>>([]);

  useEffect(() => { (async () => setRows(await getAllReservations()))(); }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Toutes les réservations</Text>
      <FlatList
        data={rows}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 8 }}>
            <Text>Utilisateur: {item.user}</Text>
            <Text>Terrain: {item.terrain}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Heure: {item.heure}</Text>
          </View>
        )}
      />
    </View>
  );
}
