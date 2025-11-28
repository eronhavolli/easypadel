import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createReservation } from "../REST-API/api";

type PendingOp = {
  id: string; // id local
  type: "create";
  payload: {
    terrainId: string;
    date: string;
    heure: string;
  };
};

function pendingKey(userId: string) {
  return `PENDING_RES_${userId}`;
}

export async function loadPending(userId: string): Promise<PendingOp[]> {
  const raw = await AsyncStorage.getItem(pendingKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PendingOp[];
  } catch {
    return [];
  }
}

async function savePending(userId: string, list: PendingOp[]) {
  await AsyncStorage.setItem(pendingKey(userId), JSON.stringify(list));
}

/**
 * Appelé quand on est en OFFLINE → on stocke la réservation en local
 */
export async function addOfflineReservation(
  userId: string,
  payload: { terrainId: string; date: string; heure: string }
) {
  const ops = await loadPending(userId); //On charge la liste des actions en attente
  ops.push({                             //On ajoute la nouvelle réservation à CETTE liste
    id: `local-${Date.now()}`,
    type: "create",
    payload,
  });
  await savePending(userId, ops);        //On sauvegarde cette liste 
}

/**
 * Essaie d'envoyer toutes les réservations stockées en local
 * Appelé :
 *  - avant d'afficher "Mes réservations"
 *  - à chaque réservation réussie
 */
export async function syncReservations(userId: string) {
  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    console.log("SYNC: pas de réseau, on ne fait rien");
    return;
  }

  let ops = await loadPending(userId); //On charge SEULEMENT les réservations en attente (let ops = liste locale))
  if (ops.length === 0) return; //Si la liste est vide, on quitte

  console.log("SYNC: envoi des réservations hors-ligne:", ops.length);

  const remaining: PendingOp[] = [];

  for (const op of ops) {       // On boucle sur chaque réservation en attente pour l'envoyer
    if (op.type === "create") {
      try {
        await createReservation({
          terrainId: op.payload.terrainId,
          userId,
          date: op.payload.date,
          heure: op.payload.heure,
        });
        console.log("SYNC: réservation envoyée OK", op.id);
      } catch (e) {
        console.log("SYNC: échec pour", op.id, e);
        remaining.push(op);
      }
    }
  }

  await savePending(userId, remaining); //On sauvegarde la liste des réservations restantes

  if (remaining.length === 0) {
    console.log("SYNC: toutes les réservations hors-ligne ont été envoyées");
  } else {
    console.log(
      "SYNC: il reste",
      remaining.length,
      "réservation(s) en attente"
    );
  }
}
