import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Get Auth instance with persistence
const auth = getAuth(app)

// Configure auth settings
if (process.env.NODE_ENV !== 'production') {
  auth.settings.appVerificationDisabledForTesting = true
}

// Set persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Auth persistence error:', error)
  })

// Initialize other services
const db = getFirestore(app)
const storage = getStorage(app)

// Enable cross-origin isolation
auth.useDeviceLanguage()

export { auth, db, storage } 