import { NextResponse } from 'next/server'
import twilio from 'twilio'

export async function GET() {
  try {
    // Check for Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER
    
    // Basic validation
    const issues = []
    
    if (!accountSid) issues.push('Missing TWILIO_ACCOUNT_SID')
    if (!authToken) issues.push('Missing TWILIO_AUTH_TOKEN')
    if (!phoneNumber) issues.push('Missing TWILIO_PHONE_NUMBER')
    
    if (issues.length > 0) {
      return NextResponse.json({
        working: false,
        issues
      })
    }
    
    // Try to connect to Twilio
    const client = twilio(accountSid, authToken)
    
    // Try to fetch the phone number to validate credentials
    const numbers = await client.incomingPhoneNumbers.list({limit: 1})
    
    return NextResponse.json({
      working: true,
      phoneNumberConfigured: phoneNumber,
      credentialsValid: true,
      details: numbers.length > 0 ? 
        { phoneNumbersFound: numbers.length } : 
        { warning: 'No phone numbers found on account' }
    })
  } catch (error) {
    console.error('Twilio connection error:', error)
    return NextResponse.json({
      working: false,
      error: error instanceof Error ? error.message : 'Unknown error connecting to Twilio'
    })
  }
} 