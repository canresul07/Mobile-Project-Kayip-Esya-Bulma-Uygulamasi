import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc,
  writeBatch,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/core/firebase';

const NOTIFICATIONS_COL = 'notifications';

export const sendNotification = async (receiverId, type, data) => {
  try {
    await addDoc(collection(db, NOTIFICATIONS_COL), {
      userId: receiverId,
      type, // 'NEW_MESSAGE' | 'ITEM_CLAIMED'
      data,
      read: false,
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('sendNotification error:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, NOTIFICATIONS_COL),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(notifications);
  });
};

export const markAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COL, notificationId), {
      read: true,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, NOTIFICATIONS_COL, notificationId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const markAllAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COL),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((d) => {
      batch.update(d.ref, { read: true });
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const clearAllNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COL),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
