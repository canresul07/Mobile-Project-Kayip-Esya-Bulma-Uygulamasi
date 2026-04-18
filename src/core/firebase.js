import Constants from 'expo-constants';
import { initializeApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EXPO_PUBLIC_FIREBASE_API_KEY as FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID as FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID as FIREBASE_APP_ID,
} from '@env';

/**
 * Normalizes environment variables, stripping spaces if any.
 */
const cleanEnvVar = (v) => (typeof v === 'string' ? v.trim() : v);

const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: cleanEnvVar(extra.firebaseApiKey || FIREBASE_API_KEY),
  authDomain: cleanEnvVar(extra.firebaseAuthDomain || FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvVar(extra.firebaseProjectId || FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvVar(extra.firebaseStorageBucket || FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvVar(extra.firebaseMessagingSenderId || FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvVar(extra.firebaseAppId || FIREBASE_APP_ID),
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

function getOrInitAuth() {
  let persistence;
  try {
    // Lazy-access Platform to avoid early evaluation issues in some environments
    const { Platform } = require('react-native');
    persistence =
      Platform.OS === 'web'
        ? browserLocalPersistence
        : getReactNativePersistence(AsyncStorage);
    console.log('[Firebase] Initializing auth with persistence:', Platform.OS);
  } catch (e) {
    console.warn('[Firebase] Platform detection failed, falling back to default persistence:', e.message);
    persistence = getReactNativePersistence(AsyncStorage);
  }

  try {
    return initializeAuth(app, { persistence });
  } catch (e) {
    if (e?.code === 'auth/already-initialized') {
      return getAuth(app);
    }
    console.error('[Firebase] Auth initialization error:', e);
    throw e;
  }
}

export const auth = getOrInitAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
