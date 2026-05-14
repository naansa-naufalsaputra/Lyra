/**
 * Firebase Configuration — Lyra SaaS
 *
 * Initializes Firebase v10+ with credentials from environment variables.
 * Exports `auth`, `db` (Firestore), and `googleProvider` for use across the app.
 *
 * If env vars are not set, Firebase runs in a "not configured" state.
 * The app will still render but auth operations will fail gracefully.
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/** True if Firebase credentials are configured */
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

const app = initializeApp(
  isFirebaseConfigured
    ? firebaseConfig
    : { apiKey: "demo-key", projectId: "demo-project" }
);

/** Firebase Auth instance */
export const auth = getAuth(app);

/** Firestore database instance */
export const db = getFirestore(app);

/** Google OAuth provider */
export const googleProvider = new GoogleAuthProvider();

/* Connect to emulators when running with demo credentials */
if (!isFirebaseConfigured && import.meta.env.DEV) {
  console.warn(
    "[Lyra] Firebase credentials not found. Create a .env file from .env.example.\n" +
    "Auth and Firestore will not work until credentials are configured."
  );
}
