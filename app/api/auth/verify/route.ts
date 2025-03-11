import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { adminAuth } from '@/lib/firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

declare global {
  var verificationCodes: Map<string, { code: string; timestamp: number; userData: { firstName: string; lastName: string; email: string } }>;
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const db = getFirestore()

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Add a counter for user IDs
const getNextUserId = async () => {
  try {
    // Delete existing counter if it exists (temporary fix)
    const counterRef = db.collection('counters').doc('users')
    const counterDoc = await counterRef.get()
    
    // If counter doesn't exist or is less than 10000, set it to 10000
    if (!counterDoc.exists || (counterDoc.data()?.count || 0) < 10000) {
      await counterRef.set({ count: 10000 })
      return 10000
    }
    
    // Get the next ID and update the counter
    const batch = db.batch()
    const newCount = counterDoc.data()!.count + 1
    batch.update(counterRef, { count: newCount })
    await batch.commit()
    
    return newCount
  } catch (error) {
    console.error('Error getting next user ID:', error)
    // Fallback to 10000 if there's an error
    await db.collection('counters').doc('users').set({ count: 10000 })
    return 10000
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phoneNumber, action, code, firstName, lastName, email } = body

    // Format phone number consistently
    let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`
    }

    if (action === 'send') {
      try {
        const verificationCode = generateVerificationCode()
        
        // Store the code and user data for later
        global.verificationCodes = global.verificationCodes || new Map()
        global.verificationCodes.set(formattedPhone, {
          code: verificationCode,
          timestamp: Date.now(),
          userData: { firstName, lastName, email } // Store user data temporarily
        })

        // Send SMS
        await client.messages.create({
          body: `Your Intfinex verification code is: ${verificationCode}`,
          to: formattedPhone,
          from: process.env.TWILIO_PHONE_NUMBER
        })

        return NextResponse.json({ status: 'success' })
      } catch (error) {
        console.error('Send code error:', error)
        return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
      }
    }

    if (action === 'verify') {
      const storedData = global.verificationCodes?.get(formattedPhone)
      
      if (!storedData || storedData.code !== code) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
      }

      try {
        // Create the user in Firebase Auth
        const userRecord = await adminAuth.createUser({
          phoneNumber: formattedPhone,
          email: storedData.userData.email,
          displayName: `${storedData.userData.firstName} ${storedData.userData.lastName}`,
        })

        // Get next user ID
        const userId = await getNextUserId()

        // Create verification document
        await db.collection('verification').doc(userRecord.uid).set({
          verified: false,
          uid: userRecord.uid,
          registrationDate: new Date().toISOString(),
          userId: userId,
          products: "Information",
          securityLevel: "Password",
          documents: "N/A",
          accountAgent: "N/A",
          dateOfBirth: "N/A",
          nationality: "N/A",
          email: storedData.userData.email || "N/A",
          displayName: `${storedData.userData.firstName} ${storedData.userData.lastName}`,
          phoneNumber: formattedPhone
        })

        // Generate custom token
        const customToken = await adminAuth.createCustomToken(userRecord.uid)
        
        // Clean up verification code and stored data
        global.verificationCodes.delete(formattedPhone)

        return NextResponse.json({ 
          status: 'success',
          customToken,
          uid: userRecord.uid
        })
      } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Handler error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 