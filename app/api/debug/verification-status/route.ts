import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  
  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }
    
    // Get the user's verification document
    const verificationDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!verificationDoc.exists) {
      return NextResponse.json({ 
        error: 'Verification document not found',
        uid
      }, { status: 404 });
    }
    
    // Add more detailed logging in the debug API
    console.log('Debug API - Retrieving verification data for user:', uid);
    if (verificationDoc.exists) {
      const data = verificationDoc.data();
      console.log('Debug API - Found verification data:', {
        code: data.emailVerificationCode,
        sentAt: data.emailVerificationSentAt
      });
    }
    
    // Return all verification data for debugging
    return NextResponse.json({
      uid,
      exists: true,
      data: verificationDoc.data()
    });
  } catch (error) {
    console.error('Error checking verification status:', error);
    return NextResponse.json({ 
      error: 'Failed to check verification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 