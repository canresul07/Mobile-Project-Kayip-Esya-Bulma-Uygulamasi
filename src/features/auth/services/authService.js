import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/core/firebase';

/**
 * Maps Firebase errors to user-friendly messages.
 * @param {any} error 
 * @returns {string}
 */
const mapErrorToMessage = (error) => {
  const code = error?.code;
  const authMessages = {
    'auth/email-already-in-use': 'Bu e-posta zaten kullanılıyor.',
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
    'auth/user-not-found': 'Kullanıcı bulunamadı.',
    'auth/wrong-password': 'Şifre hatalı.',
    'auth/invalid-credential': 'E-posta veya şifre hatalı.',
    'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekleyin.',
    'auth/network-request-failed': 'İnternet bağlantısı hatası.',
  };

  if (code === 'permission-denied') return 'Firestore izni reddedildi.';
  return authMessages[code] || 'Bir hata oluştu.';
};

/**
 * Registers a new user.
 * @param {string} email 
 * @param {string} password 
 * @param {object} userData { name, studentId, department }
 */
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: userData.name });

    const userProfile = {
      uid: user.uid,
      name: userData.name,
      email,
      department: userData.department,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: mapErrorToMessage(error) };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: mapErrorToMessage(error) };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: 'Kullanıcı bulunamadı' };
  } catch (error) {
    return { success: false, error: mapErrorToMessage(error) };
  }
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
