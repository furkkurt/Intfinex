import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST() {
  try {
    // Delete the existing counter document
    await adminDb.collection('counters').doc('users').delete()
    
    // Create a new counter starting at 10000
    await adminDb.collection('counters').doc('users').set({
      count: 10000
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Counter reset to 10000' 
    })
  } catch (error) {
    console.error('Error resetting counter:', error)
    return NextResponse.json({ 
      error: 'Failed to reset counter' 
    }, { status: 500 })
  }
} 