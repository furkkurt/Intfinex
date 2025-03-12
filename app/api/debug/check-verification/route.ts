import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    // Get all verification documents
    const snapshot = await adminDb.collection('verification').get();
    
    // Analyze the verified field values
    const results = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        verified: data.verified,
        verifiedType: typeof data.verified,
        verifiedEqualsTrue: data.verified === true,
        hasVerifiedField: 'verified' in data,
        registrationDate: data.registrationDate,
      };
    });
    
    // Count statistics
    const stats = {
      total: results.length,
      trueValues: results.filter(r => r.verified === true).length,
      falseValues: results.filter(r => r.verified === false).length,
      nullValues: results.filter(r => r.verified === null).length,
      undefinedValues: results.filter(r => r.verified === undefined).length,
      missingField: results.filter(r => !r.hasVerifiedField).length,
    };
    
    return NextResponse.json({ results, stats });
  } catch (error) {
    console.error('Error checking verification status:', error);
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    );
  }
} 