import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { userId, updates } = await request.json()

    if (!userId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Handle Firebase Auth updates first
    try {
      if (updates.displayName) {
        // Update the display name in Firebase Auth
        await adminAuth.updateUser(userId, {
          displayName: updates.displayName
        })
      }

      if (updates.email) {
        await adminAuth.updateUser(userId, {
          email: updates.email
        })
      }

      if (updates.phoneNumber) {
        await adminAuth.updateUser(userId, {
          phoneNumber: updates.phoneNumber
        })
      }
    } catch (authError) {
      console.error('Firebase Auth update error:', authError)
      return NextResponse.json({ 
        error: 'Failed to update user authentication details',
        details: authError instanceof Error ? authError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Then update Firestore
    try {
      await adminDb.collection('verification').doc(userId).update({
        ...updates,
        updatedAt: new Date().toISOString()
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in update-user route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 