import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

import NetInfo from "@react-native-community/netinfo";
import {
  getReservationsByUser,
  getTerrains,
  Reservation,
  Terrain,
} from "../REST-API/api";
import { useAuth } from "../auth";
import { loadPending, syncReservations } from "../sync/reservationsSync";

export default function ReservationsScreen() {
  const { user } = useAuth();

  // On étend le type Reservation pour inclure l'info offline
  const [reservations, setReservations] = useState<(Reservation & { _offline?: boolean })[]>([]);
  const [terrainsMap, setTerrainsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Charge la map idTerrain : nom
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

      // 1. Récupérer les réservations offline
      const pendingOps = await loadPending(user.userId);
      const offlineReservations = pendingOps
        .filter((op) => op.type === "create")
        .map((op) => ({
          _id: op.id,
          terrainId: op.payload.terrainId,
          date: op.payload.date,
          heure: op.payload.heure,
          _offline: true, // marqueur pour l'UI
        }));

      // 2. Récupérer les réservations online (si possible)
      let onlineReservations: Reservation[] = [];
      try {
        // On tente une sync avant de fetch
        await syncReservations(user.userId);
        onlineReservations = await getReservationsByUser(user.userId);
      } catch (err) {
        console.log("Impossible de charger les réservations online", err);
        // Si erreur réseau, on garde au moins ce qu'on a déjà en cache si on en avait (optionnel)
        // Ici on assume que si ça fail, on a juste pas de online
      }

      // 3. Fusionner : offline d'abord (ou trié par date, au choix)
      // Ici on met tout dans une liste et on pourrait trier par date
      const all = [...offlineReservations, ...onlineReservations];

      // Tri par date (optionnel mais mieux)
      all.sort((a, b) => {
        const da = new Date(a.date + "T" + (a.heure?.split("h")[0] || "00") + ":00");
        const db = new Date(b.date + "T" + (b.heure?.split("h")[0] || "00") + ":00");
        return db.getTime() - da.getTime(); // plus récent en haut
      });

      setReservations(all);
    } catch (e) {
      console.log("Erreur chargement réservations", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Chargement initial + écouteur réseau
  useEffect(() => {
    let unsubscribe = () => { };

    (async () => {
      await loadTerrains();
      await loadReservations(false);

      // Écouteur de changement de réseau
      unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected) {
          console.log("Connexion rétablie : on sync et on recharge !");
          loadReservations(false);
        }
      });
    })();

    return () => {
      unsubscribe();
    };
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
                // Style grisé si offline
                backgroundColor: item._offline ? "#f3f4f6" : "#ffffff",
                borderColor: item._offline ? "#9ca3af" : "#000000",
                opacity: item._offline ? 0.6 : 1,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>
                  {getTerrainName(item.terrainId)}
                </Text>
                {item._offline && (
                  <Text
                    style={{ fontSize: 12, color: "orange", fontWeight: "bold" }}
                  >
                    (En attente de sync)
                  </Text>
                )}
              </View>
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