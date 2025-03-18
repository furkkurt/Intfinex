import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid, phoneNumber } = await request.json()
    
    if (!uid || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Format phone number to E.164 format
    let formattedPhone = phoneNumber.trim().replace(/\s+/g, '').replace(/[()-]/g, '')
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`
    }
    
    // Update the user's phone number in Firebase Auth
    await adminAuth.updateUser(uid, {
      phoneNumber: formattedPhone
    })
    
    // Ensure the phone number is also updated in Firestore
    await adminDb.collection('users').doc(uid).update({
      phoneNumber: formattedPhone,
      phoneLinkedToAuth: true
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error linking phone number:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 