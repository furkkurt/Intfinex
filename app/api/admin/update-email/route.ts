import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid, newEmail } = await request.json()
    
    console.log(`Admin attempting to update email for user ${uid} to ${newEmail}`)
    
    if (!uid || !newEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Verify the user exists in Auth before updating
    try {
      const user = await adminAuth.getUser(uid)
      console.log(`Current Auth email for ${uid}: ${user.email}`)
    } catch (userError) {
      console.error('Error fetching user from Auth:', userError)
      return NextResponse.json({ 
        success: false, 
        error: 'User not found in Firebase Auth'
      }, { status: 404 })
    }
    
    // First update the auth email
    try {
      await adminAuth.updateUser(uid, {
        email: newEmail,
        emailVerified: true // Assume admin-updated emails are verified
      })
      console.log(`Successfully updated Auth email for ${uid}`)
    } catch (authError) {
      console.error('Error updating Auth email:', authError)
      return NextResponse.json({ 
        success: false, 
        error: `Auth update failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`
      }, { status: 500 })
    }
    
    // Then update the Firestore document
    try {
      await adminDb.collection('users').doc(uid).update({
        email: newEmail,
        emailUpdatedByAdmin: true,
        emailUpdatedAt: new Date().toISOString()
      })
      console.log(`Successfully updated Firestore email for ${uid}`)
    } catch (dbError) {
      console.error('Error updating Firestore email:', dbError)
      // Continue anyway since Auth was updated
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating email:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 