import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST() {
  try {
    // Get all users from Firestore
    const usersSnapshot = await adminDb.collection('users').get();
    
    let fixed = 0;
    let errors = 0;
    let skipped = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const uid = doc.id;
      
      // Skip if no phone number in Firestore
      if (!userData.phoneNumber) {
        skipped++;
        continue;
      }
      
      try {
        // Get the Auth user
        const authUser = await adminAuth.getUser(uid);
        
        // Check if phone number is missing in Auth
        if (!authUser.phoneNumber) {
          // Update Auth with phone from Firestore
          await adminAuth.updateUser(uid, {
            phoneNumber: userData.phoneNumber
          });
          
          console.log(`Fixed user ${uid}: Added phone ${userData.phoneNumber.slice(-4)}`);
          fixed++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Error fixing phone for user ${uid}:`, error);
        errors++;
      }
    }
    
    return NextResponse.json({
      success: true,
      results: { fixed, errors, skipped, total: usersSnapshot.size }
    });
  } catch (error) {
    console.error('Error in fix-missing-phones:', error);
    return NextResponse.json({ error: 'Fix operation failed' }, { status: 500 });
  }
} 