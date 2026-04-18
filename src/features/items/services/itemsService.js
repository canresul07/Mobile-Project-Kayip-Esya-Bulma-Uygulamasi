import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/core/firebase';

const ITEMS_COL = 'items';

export const addItem = async (item) => {
  try {
    const docRef = await addDoc(collection(db, ITEMS_COL), {
      ...item,
      status: 'ACTIVE',
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const subscribeToItems = (filter, callback) => {
  const itemsRef = collection(db, ITEMS_COL);
  let q = query(itemsRef, orderBy('timestamp', 'desc'));

  if (filter === 'LOST') {
    q = query(itemsRef, where('type', '==', 'LOST'), orderBy('timestamp', 'desc'));
  } else if (filter === 'FOUND') {
    q = query(itemsRef, where('type', '==', 'FOUND'), orderBy('timestamp', 'desc'));
  }

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(items);
  });
};

export const getItemById = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, ITEMS_COL, id));
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'İlan bulunamadı.' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserItems = async (uid) => {
  try {
    const q = query(collection(db, ITEMS_COL), where('ownerId', '==', uid));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteItem = async (id) => {
  try {
    await deleteDoc(doc(db, ITEMS_COL, id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resolveItem = async (id) => {
  try {
    await updateDoc(doc(db, ITEMS_COL, id), {
      status: 'RESOLVED',
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getStats = async () => {
  try {
    const snapshot = await getDocs(collection(db, ITEMS_COL));
    const all = snapshot.docs.map((d) => d.data());
    
    return {
      success: true,
      data: {
        lostCount: all.filter((i) => i.type === 'LOST').length,
        foundCount: all.filter((i) => i.type === 'FOUND').length,
        todayCount: all.filter((i) => {
          const ts = i.timestamp instanceof Timestamp ? i.timestamp.toDate() : new Date();
          return ts.toDateString() === new Date().toDateString();
        }).length,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
