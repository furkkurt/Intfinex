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
    const beforeDoc = await adminDb.collection('verification').doc(userId).get();
    console.log('Document before update:', beforeDoc.exists ? beforeDoc.data() : 'No document');
    
    // Convert 'verified' to explicit boolean value if it exists
    if ('verified' in updates) {
      updates.verified = updates.verified === true;
      console.log('Normalized verified value:', updates.verified);
    }

    // Update Firestore
    await adminDb.collection('verification').doc(userId).update(updates);
    
    // Verify the update worked
    const afterDoc = await adminDb.collection('verification').doc(userId).get();
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