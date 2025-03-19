import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    // Get a specific user ID to test with
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') || 'Q0ymdFy5kNeOkc0ngosRhGwhIse2'
    
    // Add a timestamp field to verify we can update
    await adminDb.collection('users').doc(userId).update({
      adminTestTimestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated user ${userId} with admin SDK`
    })
  } catch (error) {
    console.error('Admin test update failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 