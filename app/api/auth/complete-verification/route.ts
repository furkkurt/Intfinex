import { NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid } = await request.json()
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing UID' }, { status: 400 })
    }
    
    console.log('Completing verification for user:', uid)
    
    // Verify this is a real user
    try {
      await adminAuth.getUser(uid)
    } catch (error) {
      console.error('Invalid user ID:', error)
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }
    
    // Check document before making any changes
    const beforeDoc = await adminDb.collection('verification').doc(uid).get()
    console.log('Before verification completion:', beforeDoc.exists ? beforeDoc.data() : null)
    
    // Update document with admin privileges
    await adminDb.collection('verification').doc(uid).update({
      phoneVerified: true,
      phoneVerifiedAt: new Date().toISOString(),
      verified: false // Explicitly set to false
    })
    
    // Verify the update
    const afterDoc = await adminDb.collection('verification').doc(uid).get()
    console.log('After verification completion:', afterDoc.exists ? afterDoc.data() : null)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing verification:', error)
    return NextResponse.json({ error: 'Failed to complete verification' }, { status: 500 })
  }
} 