import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    // Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(userId)
    } catch (error) {
      console.error('Error deleting from Firebase Auth:', error)
      // Continue with Firestore deletion even if Auth deletion fails
      // The user might already be deleted from Auth
    }

    // Delete from Firestore
    await adminDb.collection('verification').doc(userId).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ 
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 