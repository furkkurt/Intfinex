import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const uniqueId = searchParams.get('id')
    const userId = searchParams.get('userId') // Current user's ID to exclude from check
    
    if (!uniqueId) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 })
    }

    // Query for any user with this uniqueId
    const snapshot = await adminDb.collection('users')
      .where('uniqueId', '==', uniqueId)
      .get()

    // If no users have this ID, it's available
    // If only the current user has this ID, it's still available
    // Otherwise, it's not available
    const isAvailable = snapshot.empty || 
      (snapshot.size === 1 && snapshot.docs[0].id === userId)

    return NextResponse.json({ available: isAvailable })
  } catch (error) {
    console.error('Error checking unique ID:', error)
    return NextResponse.json({ 
      error: 'Failed to check unique ID availability'
    }, { status: 500 })
  }
} 