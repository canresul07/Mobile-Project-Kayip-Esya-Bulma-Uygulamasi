import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { initializeApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from '@env';

const t = (v) => (typeof v === 'string' ? v.trim() : v);

/** app.config.js → extra (web dahil güvenilir; Metro string bozulmasını önler) */
const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};

/**
 * Öncelik: expo-constants extra (app.config.js + .env) → @env
 * (process.env zincirini burada kullanma; Metro web bundle’da bazen yanlış öncelik üretir.)
 */
const firebaseConfig = {
  apiKey: t(extra.firebaseApiKey || FIREBASE_API_KEY),
  authDomain: t(extra.firebaseAuthDomain || FIREBASE_AUTH_DOMAIN),
  projectId: t(extra.firebaseProjectId || FIREBASE_PROJECT_ID),
  storageBucket: t(extra.firebaseStorageBucket || FIREBASE_STORAGE_BUCKET),
  messagingSenderId: t(extra.firebaseMessagingSenderId || FIREBASE_MESSAGING_SENDER_ID),
  appId: t(extra.firebaseAppId || FIREBASE_APP_ID),
};

console.log("--- FIREBASE AYARLARI KONTROLÜ ---");
console.log(firebaseConfig);
console.log("----------------------------------");

if (__DEV__ && (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'BURAYA_YAZ')) {
  console.warn(
    '[KampüsBul] FIREBASE_API_KEY eksik. app.config.js extra ve .env kontrol et.'
  );
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

function getOrInitAuth() {
  const persistence =
    Platform.OS === 'web'
      ? browserLocalPersistence
      : getReactNativePersistence(AsyncStorage);

  try {
    return initializeAuth(app, { persistence });
  } catch (e) {
    if (e?.code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw e;
  }
}

export const auth = getOrInitAuth();

export const db = getFirestore(app);

export default app;
