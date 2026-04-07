import {
  collection, addDoc, getDocs, getDoc, doc,
  updateDoc, deleteDoc, query, where, orderBy,
  onSnapshot, serverTimestamp, limit,
} from 'firebase/firestore';
import { db } from './config';

const COL = 'items';

export const subscribeToItems = (filter, callback) => {
  let q;
  if (filter === 'LOST') {
    q = query(collection(db, COL), where('type', '==', 'LOST'), where('isResolved', '==', false), orderBy('timestamp', 'desc'));
  } else if (filter === 'FOUND') {
    q = query(collection(db, COL), where('type', '==', 'FOUND'), where('isResolved', '==', false), orderBy('timestamp', 'desc'));
  } else {
    q = query(collection(db, COL), orderBy('timestamp', 'desc'), limit(50));
  }

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().timestamp?.toDate?.() || new Date(),
    }));
    callback(items);
  });
};

export const getItemById = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, COL, id));
    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data(), timestamp: docSnap.data().timestamp?.toDate?.() || new Date() },
      };
    }
    return { success: false, error: 'İlan bulunamadı' };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const addItem = async (itemData) => {
  try {
    const ref = await addDoc(collection(db, COL), {
      ...itemData,
      timestamp: serverTimestamp(),
      isResolved: false,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: ref.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const updateItem = async (id, updates) => {
  try {
    await updateDoc(doc(db, COL, id), { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const resolveItem = async (id) => updateItem(id, { isResolved: true });

export const deleteItem = async (id) => {
  try {
    await deleteDoc(doc(db, COL, id));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const getUserItems = async (uid) => {
  try {
    const q = query(collection(db, COL), where('ownerId', '==', uid), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return {
      success: true,
      data: snapshot.docs.map((d) => ({
        id: d.id, ...d.data(),
        timestamp: d.data().timestamp?.toDate?.() || new Date(),
      })),
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const getStats = async () => {
  try {
    const [lostSnap, foundSnap] = await Promise.all([
      getDocs(query(collection(db, COL), where('type', '==', 'LOST'), where('isResolved', '==', false))),
      getDocs(query(collection(db, COL), where('type', '==', 'FOUND'), where('isResolved', '==', false))),
    ]);
    const allSnap = await getDocs(query(collection(db, COL), orderBy('timestamp', 'desc'), limit(100)));
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const todayCount = allSnap.docs.filter((d) => {
      const ts = d.data().timestamp?.toDate?.();
      return ts && ts > yesterday;
    }).length;
    return { success: true, data: { lostCount: lostSnap.size, foundCount: foundSnap.size, todayCount } };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
