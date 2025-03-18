import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { userId, updates } = await request.json()

    console.log('Updating user:', userId);
    console.log('Updates to apply:', updates);

    // Validate request
    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    // Check the current state before update
    const beforeDoc = await adminDb.collection('users').doc(userId).get();
    console.log('Document before update:', beforeDoc.exists ? beforeDoc.data() : 'No document');
    
    // Convert 'verified' to explicit boolean value if it exists
    if ('verified' in updates) {
      updates.verified = updates.verified === true;
      console.log('Normalized verified value:', updates.verified);
    }

    // Check if uniqueId is being updated and is not N/A
    if (updates.uniqueId && updates.uniqueId !== 'N/A') {
      // Check if this uniqueId already exists for another user
      const existingUsers = await adminDb.collection('users')
        .where('uniqueId', '==', updates.uniqueId)
        .get()
      
      // If this uniqueId exists and belongs to a different user, return error
      if (!existingUsers.empty) {
        const isOwnId = existingUsers.docs.some(doc => doc.id === userId)
        if (!isOwnId) {
          return NextResponse.json(
            { error: 'This Unique ID is already in use by another user' }, 
            { status: 400 }
          )
        }
      }
    }

    // Update Firestore
    await adminDb.collection('users').doc(userId).update(updates);
    
    // Verify the update worked
    const afterDoc = await adminDb.collection('users').doc(userId).get();
    console.log('Document after update:', afterDoc.exists ? afterDoc.data() : 'No document');

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ 
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 