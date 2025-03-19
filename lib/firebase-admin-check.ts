import { NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function GET() {
  try {
    // Test Firestore connection
    const testDoc = await adminDb.collection('system').doc('test').set({
      testTimestamp: new Date().toISOString(),
      message: 'Admin SDK test'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK is working correctly'
    })
  } catch (error) {
    console.error('Admin SDK test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Firebase Admin SDK is not configured correctly'
    }, { status: 500 })
  }
} 