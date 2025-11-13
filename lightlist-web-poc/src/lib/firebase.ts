import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Emulator ports (must match firebase.json)
const FIREBASE_EMULATOR_PORTS = {
  auth: 9099,
  firestore: 8081,
} as const;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to emulators in development
if (process.env.NEXT_PUBLIC_USE_EMULATOR === "true") {
  // Connect Auth Emulator
  if (!auth.emulatorConfig) {
    connectAuthEmulator(
      auth,
      `http://localhost:${FIREBASE_EMULATOR_PORTS.auth}`,
      {
        disableWarnings: true,
      }
    );
  }

  // Connect Firestore Emulator
  // Check if already connected by looking at the db host
  const dbSettings = db as any;
  if (!dbSettings._settings?.host?.includes("localhost")) {
    try {
      connectFirestoreEmulator(db, "localhost", FIREBASE_EMULATOR_PORTS.firestore);
    } catch (error) {
      // Emulator already connected or another error occurred
    }
  }
}
