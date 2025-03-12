import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    // Fetch all users from the verification collection
    const snapshot = await adminDb.collection('verification').get()
    
    if (snapshot.empty) {
      return NextResponse.json({ users: [] })
    }
    
    const users = await Promise.all(snapshot.docs.map(async (doc) => {
      const firestoreData = doc.data();
      let authData = {};
      
      // Try to get additional data from Auth
      try {
        const userRecord = await adminAuth.getUser(doc.id);
        authData = {
          displayName: userRecord.displayName,
          email: userRecord.email,
          phoneNumber: userRecord.phoneNumber,
        };
      } catch (error) {
        console.error(`Failed to fetch Auth data for user ${doc.id}:`, error);
      }
      
      // Merge Firestore and Auth data
      return {
        id: doc.id,
        ...firestoreData,
        // Auth data takes precedence for these fields
        fullName: authData.displayName || firestoreData.fullName || 'N/A',
        email: authData.email || firestoreData.email || 'N/A',
        phoneNumber: authData.phoneNumber || firestoreData.phoneNumber || 'N/A'
      };
    }));
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    )
  }
} 