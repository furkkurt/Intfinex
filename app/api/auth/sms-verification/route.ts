import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import twilio from 'twilio'
import { adminAuth } from '@/lib/firebase-admin'

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

export async function POST(request: Request) {
  try {
    const { action, uid, phoneNumber, code } = await request.json()
    
    console.log('SMS Verification Request:', { action, uid, phoneNumber: phoneNumber?.slice(-4) });
    
    if (action === 'send') {
      try {
        // Generate verification code if not provided
        const verificationCode = code || Math.floor(100000 + Math.random() * 900000).toString();
        
        console.log(`=== SMS VERIFICATION INFO ===`);
        console.log(`CODE: ${verificationCode}`);
        console.log(`PHONE: ${phoneNumber?.slice(-4)}`);
        console.log(`UID: ${uid}`);
        
        // Store the code in users collection
        if (!code) {
          await adminDb.collection('users').doc(uid).update({
            smsVerificationCode: verificationCode,
            smsVerificationSentAt: new Date().toISOString(),
            smsVerificationAttempts: 0
          });
        }
        
        // Format phone number to E.164 format for Twilio (same as test)
        let formattedPhone = phoneNumber.trim().replace(/\s+/g, '').replace(/[()-]/g, '');
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = `+${formattedPhone}`;
        }
        
        console.log('Attempting to send SMS to:', formattedPhone.replace(/\d(?=\d{4})/g, "*"));
        console.log('Using Twilio phone:', twilioPhoneNumber);
        
        // MIRRORING THE TEST SMS APPROACH
        // Use exactly the same approach as the test endpoint
        const message = await twilioClient.messages.create({
          body: `Your Intfinex verification code is: ${verificationCode}`,
          from: twilioPhoneNumber,
          to: formattedPhone
        });
        
        console.log('SMS sent successfully with SID:', message.sid);
        
        // Record success in Firestore
        await adminDb.collection('users').doc(uid).update({
          smsSendAttempted: true,
          smsSendSuccessful: true,
          smsSendTimestamp: new Date().toISOString(),
          smsProvider: 'twilio',
          smsMessageId: message.sid
        });
        
        return NextResponse.json({ 
          success: true,
          messageSid: message.sid,
          devCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
        });
      } catch (twilioError) {
        console.error('TWILIO ERROR:', twilioError);
        return NextResponse.json({ 
          success: false, 
          error: twilioError.message
        }, { status: 500 });
      }
    } else if (action === 'verify') {
      console.log('=== SMS VERIFICATION REQUEST (verify) ===');
      console.log('UID:', uid);
      console.log('Submitted code:', code);
      
      try {
        // Get the verification data from users collection
        const userDoc = await adminDb.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
          console.error('User document not found');
          return NextResponse.json({ error: 'User document not found' }, { status: 400 });
        }
        
        const userData = userDoc.data();
        
        // Log verification details
        console.log('SMS verification details:');
        console.log('Stored code:', userData?.smsVerificationCode);
        console.log('Submitted code:', code);
        
        // Normalize codes for comparison
        const storedCode = String(userData?.smsVerificationCode).trim();
        const submittedCode = String(code).trim();
        
        // Check if the code is correct
        if (storedCode !== submittedCode) {
          console.log('SMS code mismatch!');
          
          // Increment attempts counter
          await adminDb.collection('users').doc(uid).update({
            smsVerificationAttempts: (userData?.smsVerificationAttempts || 0) + 1
          });
          
          return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }
        
        console.log('SMS code matched successfully!');
        
        // Mark phone as verified and update required fields
        await adminDb.collection('users').doc(uid).update({
          phoneVerified: true,
          phoneVerifiedAt: new Date().toISOString(),
          emailAndSmsVerified: true  // Important for preventing user deletion
        });
        
        if (userData?.phoneNumber) {
          try {
            // Format phone number to E.164 format
            let formattedPhone = userData.phoneNumber.trim().replace(/\s+/g, '').replace(/[()-]/g, '')
            if (!formattedPhone.startsWith('+')) {
              formattedPhone = `+${formattedPhone}`
            }
            
            // Link phone number to Firebase Auth
            await adminAuth.updateUser(uid, {
              phoneNumber: formattedPhone
            })
            
            console.log('Successfully linked phone to Auth:', formattedPhone.replace(/\d(?=\d{4})/g, "*"))
            
            // Update the Firestore document to mark phone as linked
            await adminDb.collection('users').doc(uid).update({
              phoneLinkedToAuth: true
            })
          } catch (phoneUpdateError) {
            console.error('Error linking phone to Auth:', phoneUpdateError)
            // Continue anyway, this isn't critical
          }
        }
        
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error verifying SMS code:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
      }
    }
    
    // Return success in development to continue the verification flow
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV MODE: Simulating successful SMS verification');
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('SMS verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 