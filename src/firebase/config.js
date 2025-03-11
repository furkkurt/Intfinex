import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUEWO85iz4RzWH_o0hSJ-LURSEAtHvK40",
  authDomain: "gungroup-1a3c8.firebaseapp.com",
  projectId: "gungroup-1a3c8",
  storageBucket: "gungroup-1a3c8.firebasestorage.app",
  messagingSenderId: "936762715193",
  appId: "1:936762715193:web:695b5bb4d7601dfb82b1e8",
  measurementId: "G-JZ53PMDM88"
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Configure auth settings only on client side
if (typeof window !== 'undefined') {
  auth.languageCode = 'tr';
  auth.settings.appVerificationDisabledForTesting = false;
}

// Analytics is only available in the browser
let analytics = null;
if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export { db, auth, storage, analytics }; 