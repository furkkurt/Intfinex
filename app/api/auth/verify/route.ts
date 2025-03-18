import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { adminAuth } from '@/lib/firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase-admin'

declare global {
  var verificationCodes: Map<string, { 
    code: string; 
    timestamp: number; 
    userData: { 
      firstName: string; 
      lastName: string; 
      email: string 
    } 
  }>;
}

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const db = getFirestore()

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Add a counter for user IDs
const getNextUserId = async () => {
  try {
    const counterRef = db.collection('counters').doc('users')
    const counterDoc = await counterRef.get()
    
    if (!counterDoc.exists || (counterDoc.data()?.count || 0) < 10000) {
      await counterRef.set({ count: 10000 })
      return 10000
    }
    
    const batch = db.batch()
    const newCount = counterDoc.data()!.count + 1
    batch.update(counterRef, { count: newCount })
    await batch.commit()
    
    return newCount
  } catch (error) {
    console.error('Error getting next user ID:', error)
    await db.collection('counters').doc('users').set({ count: 10000 })
    return 10000
  }
}

export async function POST(request: Request) {
  try {
    const { action, phoneNumber, firstName, lastName, uid, code } = await request.json()
    
    console.log(`Verify API called with action: ${action}, uid: ${uid}`)
    
    if (action === 'send') {
      // Validation
      if (!phoneNumber || !uid) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      
      console.log(`Sending verification code for ${phoneNumber}`)
      
      // Generate random 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store the code in Firestore
      await adminDb.collection('users').doc(uid).update({
        verificationCode,
        verificationCodeSentAt: new Date().toISOString(),
        verificationAttempts: 0
      })
      
      // Log the verification code for development
      console.log(`===================================`)
      console.log(`VERIFICATION CODE: ${verificationCode}`)
      console.log(`FOR PHONE: ${phoneNumber}`)
      console.log(`===================================`)
      
      // Format the phone number for Twilio (E.164 format)
      let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      // Actually send the SMS if Twilio is configured
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const message = await twilioClient.messages.create({
            body: `Your Intfinex verification code is: ${verificationCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
          });
          
          console.log(`SMS sent with SID: ${message.sid}`);
        } catch (twilioError) {
          console.error('Twilio error:', twilioError);
          // Continue anyway - we'll use the console log in development
        }
      } else {
        console.log('Twilio not configured - skipping actual SMS sending');
      }
      
      return NextResponse.json({ success: true })
    }
    
    if (action === 'verify') {
      // Validation
      if (!code || !uid) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      
      console.log(`Verifying code for uid: ${uid}`)
      
      // Get user doc
      const userDoc = await adminDb.collection('users').doc(uid).get()
      if (!userDoc.exists) {
        console.error('User document not found')
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      const userData = userDoc.data()
      
      // Check verification code
      if (userData?.verificationCode !== code) {
        console.error('Invalid verification code')
        
        // Increment attempt counter
        await adminDb.collection('users').doc(uid).update({
          verificationAttempts: (userData?.verificationAttempts || 0) + 1
        })
        
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
      }
      
      // Update verification status
      await adminDb.collection('users').doc(uid).update({
        phoneVerified: true,
        phoneVerifiedAt: new Date().toISOString(),
        mailAndSmsVerification: true,
        verificationCodeVerified: true
      })
      
      console.log(`Verification successful for uid: ${uid}`)
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Verification API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Email verification helper function
async function sendVerificationEmail(email: string) {
  // Implement your email sending logic here
  // You can use services like SendGrid, AWS SES, etc.
} 