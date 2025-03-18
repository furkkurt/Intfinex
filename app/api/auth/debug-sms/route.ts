import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import twilio from 'twilio'

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

export async function POST(request: Request) {
  try {
    console.log('==== DEBUG SMS ENDPOINT CALLED ====');
    
    // Parse the request body
    const { phoneNumber, uid } = await request.json();
    
    // Generate a verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('Phone:', phoneNumber?.slice(-4));
    console.log('UID:', uid);
    console.log('Code:', verificationCode);
    
    // Store the verification code in Firestore if UID is provided
    if (uid) {
      try {
        await adminDb.collection('users').doc(uid).update({
          smsVerificationCode: verificationCode,
          smsVerificationSentAt: new Date().toISOString(),
          smsVerificationAttempts: 0,
          debugSmsAttempted: true
        });
        console.log('Verification code stored in Firestore');
      } catch (dbError) {
        console.error('Error storing code in Firestore:', dbError);
        // Continue anyway to test SMS sending
      }
    }
    
    // Format the phone number
    let formattedPhone = phoneNumber.trim().replace(/\s+/g, '').replace(/[()-]/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }
    
    console.log('Formatted phone:', formattedPhone.replace(/\d(?=\d{4})/g, "*"));
    console.log('Twilio phone:', twilioPhoneNumber);
    
    // Dump environment variables without exposing full values
    console.log('Environment check:');
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set (starts with ' + process.env.TWILIO_ACCOUNT_SID.substring(0, 3) + '...)' : 'Not set');
    console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set (not shown)' : 'Not set');
    console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || 'Not set');
    
    // Try to send the SMS
    try {
      console.log('Attempting to send SMS...');
      
      const message = await twilioClient.messages.create({
        body: `Intfinex verification code: ${verificationCode}`,
        from: twilioPhoneNumber,
        to: formattedPhone,
      });
      
      console.log('SMS sent successfully!');
      console.log('Message SID:', message.sid);
      
      // Record success in Firestore if UID is provided
      if (uid) {
        await adminDb.collection('users').doc(uid).update({
          smsSendAttempted: true,
          smsSendSuccessful: true,
          smsSendTimestamp: new Date().toISOString(),
          smsProvider: 'twilio',
          smsMessageId: message.sid,
          debugSmsSent: true
        });
      }
      
      return NextResponse.json({
        success: true,
        messageSid: message.sid,
        code: verificationCode,
        message: 'Debug SMS sent successfully'
      });
    } catch (twilioError) {
      console.error('Twilio error in debug endpoint:', twilioError);
      
      // Record failure in Firestore if UID is provided
      if (uid) {
        await adminDb.collection('users').doc(uid).update({
          smsSendAttempted: true,
          smsSendSuccessful: false,
          smsSendError: twilioError.message,
          debugSmsSent: false,
          debugSmsError: twilioError.message
        });
      }
      
      return NextResponse.json({
        success: false,
        error: twilioError.message,
        code: verificationCode // Return the code anyway for testing
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in debug SMS endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 