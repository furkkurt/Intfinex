import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid } = await request.json()
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing UID' }, { status: 400 })
    }
    
    console.log('Fixing verified status for user:', uid)
    
    // Check before
    const beforeDoc = await adminDb.collection('users').doc(uid).get()
    console.log('Before fix:', beforeDoc.exists ? beforeDoc.data() : null)
    
    // Force update
    await adminDb.collection('users').doc(uid).update({
      verified: false,
      _fixedAt: new Date().toISOString(),
      _fixReason: 'Auto-corrected verified status'
    })
    
    // Check after
    const afterDoc = await adminDb.collection('users').doc(uid).get()
    console.log('After fix:', afterDoc.exists ? afterDoc.data() : null)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error fixing verified status:', error)
    return NextResponse.json({ error: 'Failed to fix verified status' }, { status: 500 })
  }
} 