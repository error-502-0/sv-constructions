import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Combo {
  id: string;
  name: string;
  items: string[];
  price: number;
  rawForm?: any;
}

export const fetchCombos = async (): Promise<Combo[]> => {
  try {
    const combosCol = collection(db, "combos");
    const comboSnapshot = await getDocs(combosCol);
    return comboSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        items: Array.isArray(data.items) ? data.items : [],
        price: typeof data.price === 'number' ? data.price : 0,
        rawForm: data.rawForm || undefined
      };
    });
  } catch (error) {
    console.error("Error fetching combos:", error);
    return [];
  }
};

export const deleteCombo = async (comboId: string) => {
  try {
    const docRef = doc(db, "combos", comboId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting combo:", error);
    return false;
  }
};

export const updateCombo = async (comboId: string, data: Partial<Combo>) => {
  try {
    const docRef = doc(db, "combos", comboId);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating combo:", error);
    return false;
  }
};

// Owner Login & Session Logic
const OWNER_ID = "svconstructions";
const OWNER_PASS = "12349876";

export const checkActiveSession = async () => {
  // Deprecated: No longer restricting to a single session
  return { isActive: true, sessionId: "", lastLogin: "" };
};

export const loginOwner = async (id: string, pass: string) => {
  if (id !== OWNER_ID || pass !== OWNER_PASS) {
    throw new Error("Invalid ID or Password.");
  }

  const newSessionId = Math.random().toString(36).substring(2, 15);

  // Save token locally
  if (typeof window !== "undefined") {
    sessionStorage.setItem("owner_session_id", newSessionId);
  }
  
  return true;
};

export const logoutOwner = async () => {
  try {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("owner_session_id");
    }
    return true;
  } catch (e) {
    console.error("Logout failed", e);
    return false;
  }
};

export const verifyLocalSession = async () => {
  if (typeof window === "undefined") return false;
  const localId = sessionStorage.getItem("owner_session_id");
  return !!localId;
};

// Individual Pricing Logic
export const fetchItemPrices = async (): Promise<Record<string, number>> => {
  try {
    const docRef = doc(db, "settings", "itemPrices");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Record<string, number>;
    }
    return {};
  } catch (error) {
    console.error("Error fetching item prices:", error);
    return {};
  }
};

export const saveItemPrices = async (prices: Record<string, number>) => {
  try {
    const docRef = doc(db, "settings", "itemPrices");
    await setDoc(docRef, prices, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving item prices:", error);
    throw new Error("Failed to save prices.");
  }
};
