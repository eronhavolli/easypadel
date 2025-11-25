import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

import {
  getReservationsByUser,
  getTerrains,
  Reservation,
  Terrain,
} from "../REST-API/api";
import { useAuth } from "../auth";
import { syncReservations } from "../sync/reservationsSync";

export default function ReservationsScreen() {
  const { user } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [terrainsMap, setTerrainsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Charge la map idTerrain -> nom
  async function loadTerrains() {
    try {
      const terrains = await getTerrains();
      const map: Record<string, string> = {};
      terrains.forEach((t: Terrain) => {
        const id = (t as any)._id || (t as any).id || (t as any).terrainId;
        if (id) map[id] = t.nom;
      });
      setTerrainsMap(map);
    } catch (e) {
      console.log("Erreur chargement terrains pour ReservationsScreen", e);
    }
  }

  // Charge les réservations de l'utilisateur
  async function loadReservations(isRefresh = false) {
    if (!user) return;
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // d'abord → on essaie de synchroniser ce qu'on a en attente
      await syncReservations(user.userId);

      // ensuite → on récupère la vérité depuis le backend
      const list = await getReservationsByUser(user.userId);
      setReservations(list);
    } catch (e) {
      console.log("Erreur chargement réservations", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Chargement initial
  useEffect(() => {
    (async () => {
      await loadTerrains();
      await loadReservations(false);
    })();
  }, [user]);

  // Fonction pour retrouver le nom du terrain
  function getTerrainName(terrainId: string) {
    return terrainsMap[terrainId] ?? terrainId;
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Tu dois être connecté pour voir tes réservations.</Text>
      </View>
    );
  }

  if (loading && reservations.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: 16 }}>
      <Text
        style={{
          paddingHorizontal: 16,
          marginBottom: 8,
          fontSize: 18,
          fontWeight: "bold",
        }}
      >
        Mes réservations
      </Text>

      {reservations.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
          }}
        >
          <Text>Tu n'as pas encore de réservation.</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(r) => r._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadReservations(true)}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <View
              style={{
                marginBottom: 12,
                padding: 12,
                borderWidth: 1,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                {getTerrainName(item.terrainId)}
              </Text>
              <Text>Date : {item.date}</Text>
              <Text>Heure : {item.heure}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}


/**import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useAuth } from "../auth";
import { getReservationsByUser, getTerrains } from "../REST-API/api";

// Supporte les 2 formes d'API: {terrainNom, heure} OU {terrainId, heure}
type Resa = {
  _id: string;
  terrainId?: string;
  terrainNom?: string | null;
  date: string;
  heure?: string | null;
  creneau?: string | null; 
};

type Terrain = { _id: string; nom: string };

export default function ReservationsScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Resa[]>([]);
  const [terrains, setTerrains] = useState<Terrain[]>([]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const [resas, trs] = await Promise.all([
        getReservationsByUser(user.userId),
        getTerrains(),
      ]);
      setRows(resas as Resa[]);
      setTerrains(trs);
    })();
  }, [user]);

  const mapNom = useMemo(() => {
    const m = new Map<string, string>();
    terrains.forEach(t => m.set(t._id, t.nom));
    return m;
  }, [terrains]);

  const terrainLabel = (r: Resa) =>
    r.terrainNom ??
    (r.terrainId ? mapNom.get(r.terrainId) ?? r.terrainId : "?");

  const heureLabel = (r: Resa) => r.heure ?? r.creneau ?? "?";

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Mes réservations</Text>

      <FlatList
        data={rows}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 8 }}>
            <Text>Terrain: {terrainLabel(item)}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Heure: {heureLabel(item)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Aucune réservation</Text>}
      />
    </View>
  );
}
*/