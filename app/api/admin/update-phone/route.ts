import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid, newPhoneNumber } = await request.json()
    
    console.log(`Admin attempting to update phone for user ${uid} to ${newPhoneNumber}`)
    
    if (!uid || !newPhoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Verify the user exists in Auth before updating
    try {
      const user = await adminAuth.getUser(uid)
      console.log(`Current Auth phone for ${uid}: ${user.phoneNumber}`)
    } catch (userError) {
      console.error('Error fetching user from Auth:', userError)
      return NextResponse.json({ 
        success: false, 
        error: 'User not found in Firebase Auth'
      }, { status: 404 })
    }
    
    // Format phone number to E.164 format (required by Firebase)
    let formattedPhone = newPhoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`
    }
    
    // First update the auth phone
    try {
      await adminAuth.updateUser(uid, {
        phoneNumber: formattedPhone
      })
      console.log(`Successfully updated Auth phone for ${uid}`)
    } catch (authError) {
      console.error('Error updating Auth phone:', authError)
      return NextResponse.json({ 
        success: false, 
        error: `Auth update failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`
      }, { status: 500 })
    }
    
    // Then update the Firestore document
    try {
      await adminDb.collection('users').doc(uid).update({
        phoneNumber: formattedPhone,
        phoneUpdatedByAdmin: true,
        phoneUpdatedAt: new Date().toISOString()
      })
      console.log(`Successfully updated Firestore phone for ${uid}`)
    } catch (dbError) {
      console.error('Error updating Firestore phone:', dbError)
      // Continue anyway since Auth was updated
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating phone:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 