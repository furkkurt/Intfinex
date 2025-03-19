import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid, updates } = await request.json()
    
    if (!uid || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Get a timestamp for the update
    const timestamp = new Date().toISOString()
    
    // Perform the update server-side with admin permissions
    await adminDb.collection('users').doc(uid).update({
      ...updates,
      updatedByAdmin: true,
      updatedAt: timestamp
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 