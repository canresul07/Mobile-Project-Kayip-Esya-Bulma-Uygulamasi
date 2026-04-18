import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword as updateAuthPassword,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  getDocs,
  orderBy,
  startAt,
  endAt,
  limit,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '@/core/firebase';
import { uploadImageToCloudinary } from '@/core/storage';

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
      nameLowerCase: userData.name.toLowerCase(),
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

export const searchUsers = async (searchQuery, currentUserUid) => {
  try {
    const usersRef = collection(db, 'users');
    // Simple prefix search simulation for Firestore
    const q = query(
      usersRef,
      orderBy('nameLowerCase'),
      startAt(searchQuery.toLowerCase()),
      endAt(searchQuery.toLowerCase() + '\uf8ff'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    const users = snapshot.docs
      .map((doc) => ({ uid: doc.id, ...doc.data() }))
      .filter((u) => u.uid !== currentUserUid);
    
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Uploads a profile image to Cloudinary.
 * @param {string} uid 
 * @param {string} imageUri 
 */
export const uploadProfileImage = async (uid, imageUri) => {
  try {
    const result = await uploadImageToCloudinary(imageUri);
    return result;
  } catch (error) {
    console.error('[AuthService] Image upload error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Updates user profile data in Firestore and Firebase Auth.
 * @param {string} uid 
 * @param {object} updates { name, department, studentId, phoneNumber, profilePicture }
 */
export const updateUserProfile = async (uid, updates) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Oturum açmış kullanıcı bulunamadı.');

    // Update Firebase Auth display name if provided
    if (updates.name) {
      await updateProfile(user, { displayName: updates.name });
    }

    // Update Firestore document
    const userRef = doc(db, 'users', uid);
    const updatedData = { ...updates };
    if (updates.name) {
      updatedData.nameLowerCase = updates.name.toLowerCase();
    }

    await updateDoc(userRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: mapErrorToMessage(error) };
  }
};

/**
 * Changes current user's password.
 * @param {string} newPassword 
 */
export const updatePassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Oturum açmış kullanıcı bulunamadı.');
    
    await updateAuthPassword(user, newPassword);
    return { success: true };
  } catch (error) {
    return { success: false, error: mapErrorToMessage(error) };
  }
};

/**
 * Ensures user profile has nameLowerCase for searching (auto-migration).
 * @param {string} uid 
 * @param {object} profile 
 */
export const ensureProfileConsistency = async (uid, profile) => {
  if (profile && !profile.nameLowerCase && profile.name) {
    console.log('[AuthService] Auto-patching nameLowerCase for search consistency...');
    try {
      await updateDoc(doc(db, 'users', uid), {
        nameLowerCase: profile.name.toLowerCase()
      });
      return { ...profile, nameLowerCase: profile.name.toLowerCase() };
    } catch (err) {
      console.warn('[AuthService] nameLowerCase patch failed:', err);
    }
  }
  return profile;
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  onAuthChange,
  updateUserProfile,
  uploadProfileImage,
  updatePassword,
  ensureProfileConsistency,
};
