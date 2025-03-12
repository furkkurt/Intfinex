import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

// Helper function to create a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const { uid, timestamp } = await request.json()
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing UID' }, { status: 400 })
    }
    
    console.log('FINAL VERIFICATION FIX started for user:', uid, 'at', timestamp)
    
    // Check status before delay
    const beforeDoc = await adminDb.collection('verification').doc(uid).get()
    console.log('Before delay:', beforeDoc.exists ? 
      { verified: beforeDoc.data()?.verified, _initiallySetTo: beforeDoc.data()?._initiallySetTo } : 
      'No document')
    
    // Wait 1 second to let any other operations complete
    console.log('Waiting 1 second before applying fix...')
    await delay(1000);
    
    // Check status after delay but before update
    const midDoc = await adminDb.collection('verification').doc(uid).get()
    console.log('After delay, before update:', midDoc.exists ? 
      { verified: midDoc.data()?.verified } : 
      'No document')
    
    // Force update with admin privileges
    await adminDb.collection('verification').doc(uid).update({
      verified: false,
      _finalFixApplied: true,
      _finalFixTimestamp: timestamp,
      _fixAppliedWithDelay: true
    })
    
    // Verify update was successful
    const afterDoc = await adminDb.collection('verification').doc(uid).get()
    console.log('After final fix:', afterDoc.exists ? 
      { verified: afterDoc.data()?.verified, _finalFixApplied: afterDoc.data()?._finalFixApplied } : 
      'No document')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in final verification fix:', error)
    return NextResponse.json({ error: 'Failed to apply final fix' }, { status: 500 })
  }
} 