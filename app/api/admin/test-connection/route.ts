import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    // Test if admin SDK can write to Firestore
    await adminDb.collection('system').doc('admin-test').set({
      testTime: new Date().toISOString(),
      source: 'admin-test-endpoint'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Admin SDK can successfully write to Firestore'
    })
  } catch (error) {
    console.error('Admin SDK test error:', error)
    return NextResponse.json({
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 