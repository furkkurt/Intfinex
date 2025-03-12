import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid } = await request.json()
    
    console.log('SMS verification request for uid:', uid)
    
    // Check document before making any changes
    const beforeDoc = await adminDb.collection('verification').doc(uid).get()
    console.log('Before SMS API update:', beforeDoc.exists ? beforeDoc.data() : null)
    
    // Update document - IMPORTANT: Do NOT set verified:true here
    await adminDb.collection('verification').doc(uid).update({
      phoneVerified: true,
      phoneVerifiedAt: new Date().toISOString(),
      // Make sure to explicitly set verified to false to override any potential default behavior
      verified: false
    })
    
    // Check document after our update
    const afterDoc = await adminDb.collection('verification').doc(uid).get()
    console.log('After SMS API update:', afterDoc.exists ? afterDoc.data() : null)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in SMS verification API:', error)
    return NextResponse.json({ error: 'SMS verification API failed' }, { status: 500 })
  }
} 