import { NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: Request) {
  try {
    const { uid, email, phoneNumber, fullName } = await request.json()
    
    // Get next user ID from counter
    let userId = '10000'; // Default fallback
    try {
      const counterRef = adminDb.collection('counters').doc('users');
      await adminDb.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (counterDoc.exists) {
          userId = String(counterDoc.data()?.count || 10000);
          transaction.update(counterRef, { count: FieldValue.increment(1) });
        } else {
          userId = '10000';
          transaction.set(counterRef, { count: 10001 });
        }
      });
    } catch (counterError) {
      console.error('Error getting user ID from counter:', counterError);
      // Continue with default ID
    }
    
    // Create user document using admin SDK with all required fields
    await adminDb.collection('users').doc(uid).set({
      uid,
      userId,
      email,
      phoneNumber,
      fullName,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      emailVerified: false,
      phoneVerified: false,
      emailAndSmsVerified: false,
      accountStatus: 'BASIC',
      products: 'Information',
      nationality: 'N/A',
      dateOfBirth: 'N/A',
      uniqueId: 'N/A',
      documents: 'N/A',
      accountAgent: 'N/A',
      registrationDate: new Date().toISOString().split('T')[0]
    });
    
    // Link phone number to Auth if provided
    if (phoneNumber) {
      try {
        await adminAuth.updateUser(uid, {
          phoneNumber: phoneNumber
        });
        console.log(`Linked phone ${phoneNumber.slice(-4)} to Auth for new user ${uid}`);
      } catch (phoneError) {
        console.error('Error linking phone to Auth during creation:', phoneError);
        // Continue anyway as the account is already created
      }
    }
    
    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error('Error creating user documents:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 