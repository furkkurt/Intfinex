import { NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { userId, formData } = await request.json()
    
    console.log('Admin panel update for user:', userId)
    console.log('Form data:', formData)
    
    if (!userId || !formData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Extract auth-related properties to update in Auth
    const authUpdates: any = {}
    if (formData.email) authUpdates.email = formData.email
    if (formData.phoneNumber) authUpdates.phoneNumber = formData.phoneNumber
    if (formData.password && formData.password.length >= 6) authUpdates.password = formData.password
    
    // Update Auth if needed
    if (Object.keys(authUpdates).length > 0) {
      try {
        await adminAuth.updateUser(userId, authUpdates)
        console.log('Updated auth for user:', userId)
      } catch (authError) {
        console.error('Error updating auth:', authError)
        // Continue with Firestore update anyway
      }
    }
    
    // Prepare Firestore updates (excluding password)
    const firestoreUpdates = {...formData}
    delete firestoreUpdates.password
    
    // Add admin metadata
    firestoreUpdates.updatedByAdmin = true
    firestoreUpdates.updatedAt = new Date().toISOString()
    
    // Update Firestore
    await adminDb.collection('users').doc(userId).update(firestoreUpdates)
    console.log('Updated Firestore for user:', userId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin panel update error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 