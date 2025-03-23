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
    const { id, uniqueId, updates } = JSON.parse(requestText)
    
    console.log(`🔹 Admin update-user API called for uid:`, id)
    console.log(`🔹 Updates:`, updates)
    
    if (!id) {
      console.log('❌ Missing user ID')
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }
    
    // If a uniqueId is provided, check if it's already used by another user
    if (uniqueId) {
      // Query for users with this uniqueId
      const uniqueIdQuery = await adminDb.collection('users')
        .where('uniqueId', '==', uniqueId)
        .get()
      
      // Check if any other user (not the current one) has this uniqueId
      const isDuplicate = uniqueIdQuery.docs.some(doc => doc.id !== id && doc.data().uniqueId === uniqueId)
      
      if (isDuplicate) {
        return NextResponse.json({ 
          error: 'Unique ID is already in use by another user' 
        }, { status: 400 })
      }
    }
    
    // Check if email is being updated, handle separately with Auth
    if (updates.email) {
      try {
        console.log(`📧 Updating email for ${id} to ${updates.email}`)
        await adminAuth.updateUser(id, {
          email: updates.email,
          emailVerified: true // Admin-updated emails are considered verified
        })
        console.log(`✅ Updated email for ${id}`)
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
        
        console.log(`📱 Updating phone for ${id} to ${formattedPhone}`)
        await adminAuth.updateUser(id, {
          phoneNumber: formattedPhone
        })
        updates.phoneNumber = formattedPhone // Update the formatted version
        console.log(`✅ Updated phone for ${id}`)
      } catch (authError) {
        console.error('📛 Error updating Auth phone:', authError)
        // Continue with Firestore update anyway
      }
    }
    
    // Update the user document in Firestore
    console.log(`📝 Updating Firestore document for ${id}`)
    await adminDb.collection('users').doc(id).update({
      ...updates,
      uniqueId: uniqueId || null, // Store null if not provided
      updatedByAdmin: true,
      updatedAt: new Date().toISOString()
    })
    console.log(`✅ Firestore update successful for ${id}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error updating user:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 