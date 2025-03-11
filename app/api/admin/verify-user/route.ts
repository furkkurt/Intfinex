import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { userId, verified } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    console.log('Admin credentials:', {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length
    })

    const userRef = adminDb.collection('verification').doc(userId)
    await userRef.update({
      verified: verified,
      verifiedAt: verified ? new Date().toISOString() : null
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Detailed error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      }
    })
    
    return NextResponse.json({ 
      error: 'Failed to update verification status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 