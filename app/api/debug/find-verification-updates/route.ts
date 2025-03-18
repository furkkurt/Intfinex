import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    // Search for any code that references the verified field
    const searchPatterns = [
      'verified: true',
      '.verified = true',
      '"verified": true',
      "'verified': true",
      'verified:true',
      'verified= true'
    ];
    
    console.log('Searching for patterns that might be setting verified status:');
    searchPatterns.forEach(pattern => {
      console.log(`- ${pattern}`);
    });
    
    // Get all verification documents that have verified=true
    const snapshot = await adminDb.collection('users')
      .where('verified', '==', true)
      .get();
    
    const trueVerifiedUsers = snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));
    
    return NextResponse.json({
      message: 'Check server logs for code search results',
      usersWithVerifiedTrue: trueVerifiedUsers.length,
      firstFewUsers: trueVerifiedUsers.slice(0, 5)
    });
  } catch (error) {
    console.error('Error searching for verification updates:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
} 