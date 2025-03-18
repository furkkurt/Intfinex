import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development mode' }, { status: 403 });
  }
  
  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }
    
    const doc = await adminDb.collection('users').doc(uid).get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    const data = doc.data();
    
    // Log but don't expose full code in production
    if ((process.env.NODE_ENV as string) === 'production') {
      console.log(`Verification code for ${uid} was requested`);
      return NextResponse.json({ 
        message: 'Verification codes are not exposed in production',
        codeLength: data?.emailVerificationCode?.length || 0
      });
    }
    
    return NextResponse.json({ 
      code: data?.emailVerificationCode || null,
      sentAt: data?.emailVerificationSentAt || null
    });
  } catch (error) {
    console.error('Error getting verification code:', error);
    return NextResponse.json({ error: 'Failed to get code' }, { status: 500 });
  }
} 