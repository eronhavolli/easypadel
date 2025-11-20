import axios from "axios";
import { Platform } from "react-native";

const LAN_IP = "10.29.251.183";
export const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:4000"
    : Platform.OS === "android"
    ? "http://10.0.2.2:4000"      
    : `http://${LAN_IP}:4000`;  

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.log("AXIOS ERROR:", {
      message: err.message,
      status: err.response?.status,
      url: err.config?.baseURL + (err.config?.url ?? ""),
      data: err.response?.data,
    });
    return Promise.reject(err);
  }
);

/** ---- Types ---- */
export type User = { _id: string; username: string; role: "user" | "admin" };
export type Terrain = { _id: string; nom: string; dispo?: boolean };
//export type Creneau = { id: string; nom: string; dispo: boolean };
export type Creneau = { id: string; nom: string; dispo: boolean; heure: string };
export type Reservation = { _id: string; terrainId: string; date: string; heure: string };

/** ---- API calls ---- */

/** Login : envoie username/password.
 */
export async function login(username: string, password: string) {
  const res = await api.post("/users/login", {
    username,
    password,
    identifiant: username,   
    motdepasse: password,    
  });
  return res.data as { message: string; userId: string; username: string; role: "user" | "admin" };
}

export async function getTerrains() {
  const r = await api.get("/terrains");
  return r.data as Terrain[];
}

/** Ton MVP côté backend utilise /api/creneaux */
export async function getSlots(terrainId: string, date: string, heure?: string) {
  const r = await api.get(`/creneaux`, { params: { terrainId, date, heure } });
  return r.data as Creneau[];
}

export async function createReservation(payload: {
  terrainId: string; userId: string; date: string; heure: string;
}) {
  const r = await api.post("/reservations", payload);
  return r.data as { message: string; reservationId: string };
}

export async function getReservationsByUser(userId: string) {
  const r = await api.get("/reservations", { params: { userId } });
  return r.data as Reservation[];
}

/** ADMIN */
export async function getAllReservations() {
  const r = await api.get("/reservations/all");
  return r.data as Array<{ _id: string; user: string; terrain: string; date: string; heure: string }>;
}
/**import axios from "axios";
import { Platform } from "react-native";

const LAN_IP = "10.29.251.183"; 

export const BASE_URL = Platform.select({
  web: "http://localhost:4000",
  default: `http://${LAN_IP}:4000`,
});

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export type User = { _id: string; identifiant: string; role: "user" | "admin" };
export type Terrain = { _id: string; nom: string; dispo?: boolean };
export type Creneau = { id: string; nom: string; dispo: boolean };
export type Reservation = { _id: string; terrainId: string; date: string; heure: string };

export async function login(username: string, password: string) {
  const res = await api.post("/users/login", { identifiant: username, motdepasse: password });
  // on suppose que tu renvoies { message, userId, username, role }
  return res.data as { message: string; userId: string; username: string; role: "user" | "admin" };
}

export async function getTerrains() {
  const r = await api.get("/terrains");
  return r.data as Terrain[];
}

export async function getSlots(terrainId: string, date: string, heure?: string) {
  const r = await api.get(`/creneaux`, { params: { terrainId, date, heure } });
  return r.data as Creneau[];
}

export async function createReservation(payload: {
  terrainId: string; userId: string; date: string; heure: string;
}) {
  const r = await api.post("/reservations", payload);
  return r.data as { message: string; reservationId: string };
}

export async function getReservationsByUser(userId: string) {
  const r = await api.get("/reservations", { params: { userId } });
  return r.data as Reservation[];
}

// ADMIN
export async function getAllReservations() {
  const r = await api.get("/reservations/all");
  return r.data as Array<{ _id: string; user: string; terrain: string; date: string; heure: string }>;
}
*/