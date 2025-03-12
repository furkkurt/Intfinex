// Add logs to trace the verification process for phone numbers 

import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid } = await request.json()
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing UID' }, { status: 400 })
    }
    
    console.log('Phone verification request for uid:', uid)
    
    // IMPORTANT: Do NOT set the main verified flag here
    await adminDb.collection('verification').doc(uid).update({
      phoneVerificationComplete: true, // Use a different field
      phoneVerifiedAt: new Date().toISOString(),
      // Do not include the verified field here
    })
    
    // Check after update
    const afterDoc = await adminDb.collection('verification').doc(uid).get()
    console.log('After phone verification:', afterDoc.exists ? afterDoc.data() : 'No document')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in phone verification process:', error)
    return NextResponse.json({ error: 'Phone verification failed' }, { status: 500 })
  }
} 