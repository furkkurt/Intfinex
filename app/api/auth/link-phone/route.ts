import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid, phoneNumber } = await request.json()
    
    if (!uid || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Format phone number to E.164 format (international format) which Firebase requires
    let formattedPhone = phoneNumber.trim().replace(/\s+/g, '').replace(/[()-]/g, '')
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`
    }
    
    // Check if phone number is already in use by another account
    try {
      const existingUser = await adminAuth.getUserByPhoneNumber(formattedPhone)
      if (existingUser && existingUser.uid !== uid) {
        return NextResponse.json({ 
          success: false, 
          error: 'Phone number already associated with another account'
        }, { status: 400 })
      }
    } catch (error) {
      // No user with this phone number - this is expected
    }
    
    // Update the user's phone number in Firebase Auth
    try {
      await adminAuth.updateUser(uid, {
        phoneNumber: formattedPhone
      })
      console.log(`Successfully linked phone ${formattedPhone.slice(-4)} to user ${uid}`)
    } catch (authError) {
      console.error('Error updating Auth user phone:', authError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update phone in Auth system'
      }, { status: 500 })
    }
    
    // Update the Firestore document
    await adminDb.collection('users').doc(uid).update({
      phoneNumber: formattedPhone,
      phoneLinkedToAuth: true,
      phoneUpdatedAt: new Date().toISOString()
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