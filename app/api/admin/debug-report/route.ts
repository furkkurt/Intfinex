import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    // Define the full type including properties we'll add later
    const report: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      firebase: {
        configured: !!process.env.FIREBASE_PROJECT_ID && 
                   !!process.env.FIREBASE_CLIENT_EMAIL && 
                   !!process.env.FIREBASE_PRIVATE_KEY,
        projectId: process.env.FIREBASE_PROJECT_ID || 'not-set',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 
                    `${process.env.FIREBASE_CLIENT_EMAIL.substring(0, 5)}...` : 'not-set',
        privateKeyLength: process.env.FIREBASE_PRIVATE_KEY ? 
                        process.env.FIREBASE_PRIVATE_KEY.length : 0,
      }
    }
    
    // Test admin SDK
    try {
      const userCount = await adminAuth.listUsers(1)
      report.adminAuth = {
        success: true,
        userCount: userCount.users.length
      }
    } catch (authError) {
      report.adminAuth = {
        success: false,
        error: authError instanceof Error ? authError.message : 'Unknown error'
      }
    }
    
    // Test Firestore
    try {
      const testDoc = adminDb.collection('system').doc('debug-report')
      await testDoc.set({ timestamp: new Date().toISOString() })
      report.adminFirestore = {
        success: true
      }
    } catch (firestoreError) {
      report.adminFirestore = {
        success: false,
        error: firestoreError instanceof Error ? firestoreError.message : 'Unknown error'
      }
    }
    
    return NextResponse.json(report)
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 