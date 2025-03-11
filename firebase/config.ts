import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCUEWO85iz4RzWH_o0hSJ-LURSEAtHvK40",
  authDomain: "gungroup-1a3c8.firebaseapp.com",
  projectId: "gungroup-1a3c8",
  storageBucket: "gungroup-1a3c8.firebasestorage.app",
  messagingSenderId: "936762715193",
  appId: "1:936762715193:web:695b5bb4d7601dfb82b1e8",
  measurementId: "G-JZ53PMDM88"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app) 