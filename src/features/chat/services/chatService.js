import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/core/firebase';

const CHATS_COL = 'chats';
const MESSAGES_COL = 'messages';

/**
 * Creates or retrieves a chat between two users.
 * @param {string} currentUserUid 
 * @param {object} currentUserProfile 
 * @param {string} otherUserUid 
 * @param {object} otherUserProfile 
 * @param {object} itemData 
 */
export const createOrGetChat = async (
  currentUserUid,
  currentUserProfile,
  otherUserUid,
  otherUserProfile,
  itemData = null,
) => {
  try {
    const chatsRef = collection(db, CHATS_COL);
    const q = query(chatsRef, where('participants', 'array-contains', currentUserUid));
    const querySnapshot = await getDocs(q);

    let existingChat = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(otherUserUid)) {
        existingChat = { id: doc.id, ...data };
      }
    });

    if (existingChat) {
      return { success: true, data: existingChat };
    }

    const newChatData = {
      participants: [currentUserUid, otherUserUid],
      participantDetails: {
        [currentUserUid]: {
          name: currentUserProfile.name,
          department: currentUserProfile.department,
        },
        [otherUserUid]: {
          name: otherUserProfile.name,
          department: otherUserProfile.department,
        },
      },
      lastMessage: '',
      lastMessageTimestamp: serverTimestamp(),
      itemContext: itemData ? { id: itemData.id, title: itemData.title } : undefined,
    };

    const docRef = await addDoc(collection(db, CHATS_COL), newChatData);
    return { success: true, data: { id: docRef.id, ...newChatData } };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const sendMessage = async (chatId, senderId, text, imageUrl = null) => {
  try {
    const messagesRef = collection(db, CHATS_COL, chatId, MESSAGES_COL);
    const messageData = {
      senderId,
      text,
      imageUrl,
      timestamp: serverTimestamp(),
    };

    await addDoc(messagesRef, messageData);

    const chatRef = doc(db, CHATS_COL, chatId);
    await updateDoc(chatRef, {
      lastMessage: text || (imageUrl ? '📷 Fotoğraf' : ''),
      lastMessageTimestamp: serverTimestamp(),
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const subscribeToChats = (userUid, callback) => {
  const chatsRef = collection(db, CHATS_COL);
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userUid),
    orderBy('lastMessageTimestamp', 'desc'),
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(chats);
  });
};

export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = collection(db, CHATS_COL, chatId, MESSAGES_COL);
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp instanceof Timestamp ? doc.data().timestamp.toDate() : new Date(),
    }));
    callback(messages);
  });
};

export const deleteChat = async (chatId) => {
  try {
    await deleteDoc(doc(db, CHATS_COL, chatId));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
