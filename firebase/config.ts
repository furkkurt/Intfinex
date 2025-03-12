import { initializeApp, getApps } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBtyY3XnuoC8uoTXgNKA1sgyo0u_xfKvmo",
  authDomain: "intfinex-f46f8.firebaseapp.com",
  projectId: "intfinex-f46f8",
  storageBucket: "intfinex-f46f8.firebasestorage.app",
  messagingSenderId: "700329996973",
  appId: "1:700329996973:web:9685fe5f814a3ed2ba0c24",
  measurementId: "G-NKPTDJ9KN2"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Get Auth instance
const auth = getAuth(app)

// Set persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Auth persistence error:', error)
  })

const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage } 