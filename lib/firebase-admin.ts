import { initializeApp, getApps, cert, App, getApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Update the private key formatting
const privateKey = process.env.FIREBASE_PRIVATE_KEY ? 
  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined

function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp()
  }

  // Check if we have all required environment variables
  if (!process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !privateKey) {
    throw new Error('Missing Firebase Admin SDK credentials in environment variables')
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    })
  })
}

// Initialize the app
let adminApp: App
try {
  adminApp = getFirebaseAdminApp()
} catch (error) {
  if (error instanceof Error && !/already exists/u.test(error.message)) {
    console.error('Firebase admin initialization error:', error.stack)
  }
  // Ensure we have an app instance even if there was an error
  adminApp = getApp()
}

// Initialize Firestore and Auth with the app instance
export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp) 