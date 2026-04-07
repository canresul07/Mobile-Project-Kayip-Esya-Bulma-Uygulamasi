import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

const devLog = (label, error) => {
  if (__DEV__ && error) {
    console.warn(`[KampüsBul Auth] ${label}`, error?.code, error?.message);
  }
};

const mapErrorToMessage = (error) => {
  const code = error?.code;
  const raw = error?.message;

  const authMessages = {
    'auth/email-already-in-use': 'Bu e-posta zaten kullanılıyor.',
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
    'auth/user-not-found': 'Kullanıcı bulunamadı.',
    'auth/wrong-password': 'Şifre hatalı.',
    'auth/invalid-credential': 'E-posta veya şifre hatalı.',
    'auth/invalid-api-key': 'Firebase API anahtarı geçersiz. .env içindeki FIREBASE_API_KEY değerini kontrol edin.',
    'auth/operation-not-allowed': 'E-posta/şifre girişi Firebase Console’da kapalı. Authentication > Sign-in method’dan açın.',
    'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekleyin.',
    'auth/network-request-failed': 'İnternet bağlantısı hatası.',
    'auth/configuration-not-found': 'Firebase yapılandırması bulunamadı. Proje ID ve uygulama ayarlarını kontrol edin.',
  };

  if (code === 'permission-denied' || code === 'missing-or-insufficient-permissions') {
    return 'Firestore izni reddedildi. Firebase Console > Firestore > Rules: kullanıcı giriş yaptıktan sonra users ve items kurallarını kontrol edin.';
  }

  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return 'Firestore şu an yanıt vermiyor. Bağlantıyı veya bölge ayarını kontrol edin.';
  }

  if (authMessages[code]) return authMessages[code];

  if (raw && typeof raw === 'string' && raw.length > 0 && raw.length < 200) {
    return raw;
  }

  return code ? `Hata (${code})` : 'Bir hata oluştu.';
};

export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: userData.name });

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: userData.name,
      email,
      studentId: userData.studentId,
      department: userData.department,
      createdAt: serverTimestamp(),
    });

    return { success: true, user };
  } catch (error) {
    devLog('registerUser', error);
    return { success: false, error: mapErrorToMessage(error) };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    devLog('loginUser', error);
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
    if (docSnap.exists()) return { success: true, data: docSnap.data() };
    return { success: false, error: 'Kullanıcı bulunamadı' };
  } catch (error) {
    devLog('getUserProfile', error);
    return { success: false, error: mapErrorToMessage(error) };
  }
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);
