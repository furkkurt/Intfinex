import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    
    // Force update the verified status to false
    const userRef = adminDb.collection('users').doc(userId)
    
    // First check the current value
    const doc = await userRef.get()
    const currentValue = doc.exists ? doc.data()?.verified : null
    
    // Update to explicitly set verified to false
    await userRef.update({
      verified: false,
      _lastUpdated: new Date().toISOString()
    })
    
    return NextResponse.json({ 
      success: true, 
      debugInfo: {
        previousValue: currentValue,
        newValue: false,
        docExists: doc.exists
      }
    })
  } catch (error) {
    console.error('Error resetting verification:', error)
    return NextResponse.json(
      { error: 'Failed to reset verification' },
      { status: 500 }
    )
  }
} 