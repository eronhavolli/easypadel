import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { createReservation, getTerrains, Terrain } from "../REST-API/api";
import { useAuth } from "../auth";
import {
  addOfflineReservation,
  syncReservations,
} from "../sync/reservationsSync";

// Créneaux horaires proposés (MVP)
const HOURS = [
  "16h-17h",
  "17h-18h",
  "18h-19h",
  "19h-20h",
  "20h-21h",
  "21h-22h",
];

// format YYYY-MM-DD pour le backend
function formatDateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// récupère l'id du terrain quelle que soit la clé
function getTerrainId(t: Terrain | null): string | null {
  if (!t) return null;
  return (t as any)._id || (t as any).id || (t as any).terrainId || null;
}

// --- Une "carte" pour chaque terrain ---
function TerrainItem({
  nom,
  selected,
  onPress,
}: {
  nom: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.terrainCard, selected && styles.terrainCardSelected]}
    >
      <Text style={styles.terrainName}>{nom}</Text>
    </TouchableOpacity>
  );
}

export default function TerrainsScreen() {
  const { user } = useAuth();

  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);

  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [loadingTerrains, setLoadingTerrains] = useState(false);
  const [loadingReserve, setLoadingReserve] = useState(false);

  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Charger les terrains au démarrage
  useEffect(() => {
    (async () => {
      try {
        setLoadingTerrains(true);
        const list = await getTerrains();
        setTerrains(list);
        if (list.length > 0) {
          setSelectedTerrain(list[0]);
        }
      } catch (e) {
        console.log("Erreur chargement terrains", e);
        showError("Impossible de charger les terrains.");
      } finally {
        setLoadingTerrains(false);
      }
    })();
  }, []);

  function showError(message: string) {
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("Erreur", message);
    }
  }

  function showSuccess(message: string) {
    setSuccessBanner(message);
    setTimeout(() => setSuccessBanner(null), 2500);
  }

  // changement de date (mobile)
  function onChangeDate(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    const d = selectedDate || date;
    setShowDatePicker(false);
    setDate(d);
  }

  async function reserve() {
    if (!user) {
      showError("Tu dois être connecté pour réserver.");
      return;
    }
    if (!selectedTerrain || !selectedHour) {
      showError("Choisis un terrain, une date et une heure.");
      return;
    }

    const terrainId = getTerrainId(selectedTerrain);
    if (!terrainId) {
      showError("Impossible de déterminer le terrain.");
      return;
    }

    const dateStr = formatDateLocal(date);

    try {
      setLoadingReserve(true);

      // 1) On essaie d'abord de synchroniser ce qu'on a en attente
      await syncReservations(user.userId);

      // 2) Puis on tente la réservation en ligne
      const res = await createReservation({
        terrainId,
        userId: user.userId,
        date: dateStr,
        heure: selectedHour,
      });

      const msg =
        res?.message ||
        `Créneau réservé : ${selectedTerrain.nom} – ${dateStr} à ${selectedHour}`;
      showSuccess(msg);

      // 3) Après une réservation OK, on re-synchronise au cas où
      await syncReservations(user.userId);
    } catch (e: any) {
      console.log("Erreur réservation", e?.response || e);

      const hasHttpStatus = e?.response?.status !== undefined;

      if (!hasHttpStatus) {
        // Erreur réseau → on enregistre hors-ligne
        await addOfflineReservation(user.userId, {
          terrainId,
          date: dateStr,
          heure: selectedHour,
        });
        showSuccess(
          `Réservation enregistrée hors-ligne pour ${selectedTerrain.nom} – ${dateStr} à ${selectedHour}. Elle sera envoyée dès que tu auras du réseau.`
        );
      } else {
        // Erreur "logique" renvoyée par l'API (créneau pris, déjà réservé, etc.)
        const msg =
          e?.response?.data?.message ?? "Impossible de réserver ce créneau.";
        showError(msg);
      }
    } finally {
      setLoadingReserve(false);
    }
  }

  const formattedDate = formatDateLocal(date);

  return (
    <View style={styles.container}>
      {/* Titre */}
      <Text style={styles.title}>Terrains disponibles</Text>

      {/* Liste des terrains */}
      {loadingTerrains ? (
        <Text style={{ marginTop: 16 }}>Chargement des terrains...</Text>
      ) : (
        <View style={styles.terrainsList}>
          {terrains.map((t) => {
            const id = getTerrainId(t);
            const selectedId = getTerrainId(selectedTerrain);
            const selected = !!id && !!selectedId && id === selectedId;

            return (
              <TerrainItem
                key={id || t.nom}
                nom={t.nom}
                selected={selected}
                onPress={() => {
                  setSelectedTerrain(t);
                  setSelectedHour(null); // on reset l'heure si on change de terrain
                }}
              />
            );
          })}
        </View>
      )}

      {/* Date */}
      {selectedTerrain && (
        <View style={{ width: "100%", marginTop: 20 }}>
          <Text style={styles.label}>Date du créneau</Text>
          {Platform.OS === "web" ? (
            // input natif HTML
            // @ts-ignore
            <input
              type="date"
              value={formattedDate}
              onChange={(e: any) => {
                const v: string = e.target.value; // "2025-11-27"
                const newDate = new Date(v);
                if (!isNaN(newDate.getTime())) {
                  setDate(newDate);
                }
              }}
              style={styles.dateInputWeb}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>{formattedDate}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                />
              )}
            </>
          )}
        </View>
      )}

      {/* Heures */}
      {selectedTerrain && (
        <View style={{ width: "100%", marginTop: 20 }}>
          <Text style={styles.label}>Créneau horaire</Text>
          <View style={styles.hoursContainer}>
            {HOURS.map((h) => {
              const isSelected = selectedHour === h;
              return (
                <TouchableOpacity
                  key={h}
                  onPress={() => setSelectedHour(h)}
                  style={[
                    styles.hourChip,
                    isSelected && styles.hourChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.hourChipText,
                      isSelected && styles.hourChipTextSelected,
                    ]}
                  >
                    {h}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Bouton réserver */}
      {selectedTerrain && (
        <View style={styles.footer}>
          <Button
            title={
              loadingReserve ? "RÉSERVATION EN COURS..." : "RÉSERVER CE CRÉNEAU"
            }
            onPress={reserve}
            disabled={!selectedHour || loadingReserve}
            color="#2563eb"
          />
        </View>
      )}

      {/* Bannière de succès */}
      {successBanner && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Text style={{ color: "#22c55e", fontSize: 24 }}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Créneau réservé !</Text>
            <Text style={styles.successMessage}>{successBanner}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  terrainsList: {
    width: "100%",
  },
  terrainCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  terrainCardSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#e5f0ff",
  },
  terrainName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 6,
  },
  dateInputWeb: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  dateButtonText: {
    fontSize: 14,
  },
  hoursContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hourChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
    marginBottom: 6,
  },
  hourChipSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  hourChipText: {
    fontSize: 13,
    color: "#374151",
  },
  hourChipTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
  footer: {
    width: "100%",
    marginTop: 24,
  },
  successOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  successCard: {
    width: "80%",
    maxWidth: 340,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  successIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ecfdf3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  successMessage: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
  },
});


/** 
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { createReservation, getTerrains, Terrain } from "../REST-API/api";
import { useAuth } from "../auth";

// Créneaux en dur pour le MVP
const HOURS = [
  "16h-17h",
  "17h-18h",
  "18h-19h",
  "19h-20h",
  "20h-21h",
  "21h-22h",
];

// format YYYY-MM-DD pour le backend
function formatDateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// helpers pour les popups
function showSuccess(message: string) {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    Alert.alert("Succès", message);
  }
}

function showError(message: string) {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    Alert.alert("Erreur", message);
  }
}

// 🟡 helper pour récupérer l'id du terrain quel que soit le nom du champ
function getTerrainId(t: Terrain | null): string | null {
  if (!t) return null;
  return (t as any)._id || (t as any).id || (t as any).terrainId || null;
}

export default function TerrainsScreen() {
  const { user } = useAuth();

  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);

  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [loadingReserve, setLoadingReserve] = useState(false);

  // Charger les terrains au démarrage
  useEffect(() => {
    (async () => {
      try {
        const list = await getTerrains();
        setTerrains(list);
      } catch (e) {
        console.log("Erreur chargement terrains", e);
        showError("Impossible de charger les terrains.");
      }
    })();
  }, []);

  // changement de date (mobile)
  function onChangeDate(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    const d = selectedDate || date;
    setShowDatePicker(false);
    setDate(d);
  }

  // Réserver
  async function reserve() {
    if (!user) {
      showError("Tu dois être connecté pour réserver.");
      return;
    }
    if (!selectedTerrain || !selectedHour) {
      showError("Choisis un terrain, une date et une heure.");
      return;
    }

    const dateStr = formatDateLocal(date);

    // 🔍 on récupère l'id réel du terrain
    const terrainId = getTerrainId(selectedTerrain);

    console.log("selectedTerrain complet =", selectedTerrain);
    console.log("terrainId calculé =", terrainId);

    if (!terrainId) {
      showError("Impossible de déterminer l'identifiant du terrain.");
      return;
    }

    console.log("Reservation demandée :", {
      terrainId,
      userId: user.userId,
      date: dateStr,
      heure: selectedHour,
    });

    try {
      setLoadingReserve(true);

      const res = await createReservation({
        terrainId,
        userId: user.userId,
        date: dateStr,
        heure: selectedHour,
      });

      const msg =
        res?.message ||
        `Réservation confirmée pour ${selectedTerrain.nom} le ${dateStr} à ${selectedHour}`;

      showSuccess(msg);
    } catch (e: any) {
      console.log("Erreur réservation", e?.response || e);
      const msg =
        e?.response?.data?.message ?? "Impossible de réserver ce créneau.";
      showError(msg);
    } finally {
      setLoadingReserve(false);
    }
  }

  return (
    <View style={{ flex: 1, paddingTop: 20 }}>
      {/* ---- TERRAINS ---- }
      <Text style={{ padding: 16, fontSize: 18, fontWeight: "bold" }}>
        Sélectionne un terrain
      </Text>

      <FlatList
        data={terrains}
        horizontal
        keyExtractor={(t) => getTerrainId(t) || t.nom}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) => {
          const itemId = getTerrainId(item);
          const selectedId = getTerrainId(selectedTerrain);
          const isSelected = itemId && selectedId && itemId === selectedId;

          return (
            <TouchableOpacity
              onPress={() => {
                setSelectedTerrain(item); // 👈 on mémorise bien le terrain
                setSelectedHour(null); // reset l'heure si on change de terrain
              }}
              style={{
                padding: 12,
                borderWidth: 1,
                borderRadius: 8,
                minWidth: 100,
                alignItems: "center",
                backgroundColor: isSelected ? "#cce5ff" : "#fff", // couleur différente
                borderColor: isSelected ? "#007bff" : "#ccc", // bordure différente
              }}
            >
              <Text>{item.nom}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ---- DATE ---- }
      {selectedTerrain && (
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={{ marginBottom: 8 }}>
            Date sélectionnée : {formatDateLocal(date)}
          </Text>

          {Platform.OS === "web" ? (
            // @ts-ignore : input HTML natif sur le web
            <input
              type="date"
              value={formatDateLocal(date)}
              onChange={(e: any) => {
                const v: string = e.target.value; // "2025-11-27"
                const newDate = new Date(v);
                if (!isNaN(newDate.getTime())) {
                  setDate(newDate);
                }
              }}
              style={{
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
          ) : (
            <>
              <Button
                title="Choisir une date"
                onPress={() => setShowDatePicker(true)}
              />
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                />
              )}
            </>
          )}
        </View>
      )}

      {/* ---- HEURES ---- }
      {selectedTerrain && (
        <>
          <Text style={{ padding: 16, fontSize: 16 }}>
            Créneau horaire – {selectedTerrain.nom}
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              paddingHorizontal: 16,
            }}
          >
            {HOURS.map((h) => {
              const isSelected = selectedHour === h;
              return (
                <TouchableOpacity
                  key={h}
                  onPress={() => setSelectedHour(h)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    marginBottom: 8,
                    backgroundColor: isSelected ? "#eee" : "#fff",
                    borderColor: isSelected ? "#333" : "#ccc",
                  }}
                >
                  <Text>{h}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {/* ---- BOUTON RÉSERVER ---- }
      {selectedTerrain && (
        <View style={{ padding: 16, marginTop: 20 }}>
          <Button
            title={
              loadingReserve ? "Réservation en cours..." : "RÉSERVER CE CRÉNEAU"
            }
            disabled={!selectedHour || loadingReserve}
            onPress={reserve}
          />
        </View>
      )}
    </View>
  );
}

*/

