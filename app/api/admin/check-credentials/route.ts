import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    // Test 1: Can we list users?
    const usersList = await adminAuth.listUsers(1)
    
    // Test 2: Can we write to Firestore?
    const testDocRef = adminDb.collection('_admin_tests').doc('credential_check')
    await testDocRef.set({
      timestamp: new Date().toISOString(),
      test: 'admin_credentials_check'
    })
    
    return NextResponse.json({
      success: true,
      authTest: {
        success: true,
        userCount: usersList.users.length,
        firstUser: usersList.users[0]?.email || 'No users found'
      },
      firestoreTest: {
        success: true,
        documentPath: testDocRef.path
      }
    })
  } catch (error) {
    console.error('Admin credential check failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 