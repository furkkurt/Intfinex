import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { userId, updates } = await request.json()

    // Validate request
    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    // Separate Auth updates from Firestore updates
    const authUpdates: any = {};
    const firestoreUpdates = { ...updates };

    // Fields that should be updated in Auth
    if (updates.email) authUpdates.email = updates.email;
    if (updates.fullName) authUpdates.displayName = updates.fullName;
    if (updates.phoneNumber) authUpdates.phoneNumber = updates.phoneNumber;

    // Update Auth if needed
    if (Object.keys(authUpdates).length > 0) {
      try {
        await adminAuth.updateUser(userId, authUpdates);
      } catch (error) {
        console.error('Error updating Auth:', error);
        // Continue with Firestore update even if Auth update fails
      }
    }

    // Update Firestore
    await adminDb.collection('verification').doc(userId).update(firestoreUpdates);

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ 
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 