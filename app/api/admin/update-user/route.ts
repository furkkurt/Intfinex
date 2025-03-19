import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    // Clone request to log
    const clonedRequest = request.clone()
    const requestText = await clonedRequest.text()
    console.log('📦 Admin update-user API raw request:', requestText)
    
    // Parse body
    const { uid, updates } = JSON.parse(requestText)
    
    console.log(`🔹 Admin update-user API called for uid:`, uid)
    console.log(`🔹 Updates:`, updates)
    
    if (!uid) {
      console.log('❌ Missing user ID')
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }
    
    // Check if email is being updated, handle separately with Auth
    if (updates.email) {
      try {
        console.log(`📧 Updating email for ${uid} to ${updates.email}`)
        await adminAuth.updateUser(uid, {
          email: updates.email,
          emailVerified: true // Admin-updated emails are considered verified
        })
        console.log(`✅ Updated email for ${uid}`)
      } catch (authError) {
        console.error('📛 Error updating Auth email:', authError)
        // Continue with Firestore update anyway
      }
    }
    
    // Check if phone is being updated, handle separately with Auth
    if (updates.phoneNumber) {
      try {
        // Format phone number to E.164 format (required by Firebase)
        let formattedPhone = updates.phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = `+${formattedPhone}`
        }
        
        console.log(`📱 Updating phone for ${uid} to ${formattedPhone}`)
        await adminAuth.updateUser(uid, {
          phoneNumber: formattedPhone
        })
        updates.phoneNumber = formattedPhone // Update the formatted version
        console.log(`✅ Updated phone for ${uid}`)
      } catch (authError) {
        console.error('📛 Error updating Auth phone:', authError)
        // Continue with Firestore update anyway
      }
    }
    
    // Update the user document in Firestore
    console.log(`📝 Updating Firestore document for ${uid}`)
    await adminDb.collection('users').doc(uid).update({
      ...updates,
      updatedByAdmin: true,
      updatedAt: new Date().toISOString()
    })
    console.log(`✅ Firestore update successful for ${uid}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error updating user:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 