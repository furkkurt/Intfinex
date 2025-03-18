import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid } = await request.json()
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }
    
    console.log('Cancelling registration for user:', uid)
    
    // Delete from Firestore first
    try {
      await adminDb.collection('users').doc(uid).delete()
      console.log('Deleted verification document for:', uid)
    } catch (error) {
      console.error('Error deleting verification document:', error)
      // Continue with auth deletion even if Firestore fails
    }
    
    // Then delete from Auth
    try {
      await adminAuth.deleteUser(uid)
      console.log('Deleted auth user:', uid)
    } catch (error) {
      console.error('Error deleting auth user:', error)
      // If the user doesn't exist, that's fine
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling registration:', error)
    return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 })
  }
} 