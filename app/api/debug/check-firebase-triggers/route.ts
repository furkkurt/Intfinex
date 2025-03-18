import { NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function GET() {
  try {
    // Check if there are any functions deployed
    console.log('Checking for Firebase triggers or functions...')
    
    // Get list of users with verified=true
    const verifiedUsers = await adminDb.collection('users')
      .where('verified', '==', true)
      .get()
    
    // Get users with phoneVerified but not verified
    const phoneVerifiedUsers = await adminDb.collection('users')
      .where('phoneVerified', '==', true)
      .where('verified', '==', false)
      .get()
    
    return NextResponse.json({
      verifiedUsersCount: verifiedUsers.size,
      phoneVerifiedNotVerifiedCount: phoneVerifiedUsers.size,
      message: 'Check server logs for more details'
    })
  } catch (error) {
    console.error('Error checking Firebase triggers:', error)
    return NextResponse.json({ error: 'Failed to check Firebase triggers' }, { status: 500 })
  }
} 