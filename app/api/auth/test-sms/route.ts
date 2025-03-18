import { NextResponse } from 'next/server'
import twilio from 'twilio'

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

export async function GET(request: Request) {
  try {
    console.log('Test SMS endpoint invoked');
    console.log('Twilio config:', {
      accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 5) + '...',
      phoneNumber: twilioPhoneNumber,
      authTokenPresent: !!process.env.TWILIO_AUTH_TOKEN
    });
    
    // Get phone number from query string
    const { searchParams } = new URL(request.url);
    const testPhone = searchParams.get('phone');
    
    if (!testPhone) {
      return NextResponse.json({ 
        error: 'Missing phone parameter', 
        usage: 'Add ?phone=+1234567890 to the URL'
      }, { status: 400 });
    }
    
    // Send test SMS
    try {
      const message = await twilioClient.messages.create({
        body: `Test SMS from Intfinex at ${new Date().toISOString()}`,
        from: twilioPhoneNumber,
        to: testPhone
      });
      
      console.log('Test SMS sent successfully, SID:', message.sid);
      
      return NextResponse.json({ 
        success: true, 
        messageSid: message.sid 
      });
    } catch (twilioError) {
      console.error('Twilio API error:', twilioError);
      
      return NextResponse.json({ 
        success: false, 
        error: twilioError.message || 'Unknown Twilio error',
        twilioErrorCode: twilioError.code
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test SMS endpoint error:', error);
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 