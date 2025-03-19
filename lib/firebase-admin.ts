import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  const apps = getApps()
  
  if (!apps.length) {
    try {
      // Check if we have all environment variables
      if (!process.env.FIREBASE_PROJECT_ID || 
          !process.env.FIREBASE_CLIENT_EMAIL || 
          !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('Missing Firebase Admin credentials in environment variables')
      }
      
      // Initialize the app
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // The private key needs to have newlines properly handled
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      })
      
      console.log('Firebase Admin SDK initialized successfully')
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error)
      throw error
    }
  }
  
  return {
    adminDb: getFirestore(),
    adminAuth: getAuth()
  }
}

// Export the initialized services
const { adminDb, adminAuth } = initializeFirebaseAdmin()
export { adminDb, adminAuth } 