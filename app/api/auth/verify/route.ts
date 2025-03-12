import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { adminAuth } from '@/lib/firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phoneNumber, action, code, firstName, lastName, email, uid } = body

    console.log('Verify endpoint received:', { action, phoneNumber, code, uid })

    let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`
    }

    if (action === 'verify') {
      console.log('Verifying code...')
      const storedData = global.verificationCodes?.get(formattedPhone)
      
      if (!storedData || storedData.code !== code) {
        console.log('Invalid code. Expected:', storedData?.code, 'Got:', code)
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
      }

      try {
        // Update the user's phone number in Firebase Auth
        await adminAuth.updateUser(uid, {
          phoneNumber: formattedPhone,
          emailVerified: false // Ensure email starts as unverified
        })

        // Send verification email
        const user = await adminAuth.getUser(uid)
        if (user.email) {
          await adminAuth.generateEmailVerificationLink(user.email)
          // Send the verification email using your email service
          await sendVerificationEmail(user.email)
        }

        // Get next user ID
        const userId = await getNextUserId()
        console.log('Got next user ID:', userId)

        // Create verification document with phone number
        await db.collection('verification').doc(uid).set({
          verified: false,
          emailVerified: false,
          uid: uid,
          registrationDate: new Date().toISOString(),
          userId: userId,
          products: "Information",
          securityLevel: "Password",
          documents: "N/A",
          accountAgent: "N/A",
          dateOfBirth: "N/A",
          nationality: "N/A",
          email: storedData.userData.email || "N/A",
          displayName: `${firstName} ${lastName}`,
          phoneNumber: formattedPhone
        })

        console.log('Verification document created')

        // Generate custom token
        const customToken = await adminAuth.createCustomToken(uid)
        
        // Clean up verification code
        global.verificationCodes.delete(formattedPhone)

        return NextResponse.json({ 
          status: 'success',
          customToken,
          requireEmailVerification: true
        })
      } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 })
      }
    }

    if (action === 'send') {
      try {
        // Check if user already exists
        try {
          const existingUser = await adminAuth.getUserByPhoneNumber(formattedPhone)
          if (existingUser) {
            return NextResponse.json({ 
              error: 'User already exists',
              details: 'This phone number is already registered'
            }, { status: 400 })
          }
        } catch (error) {
          // User not found, which is what we want for registration
        }

        const verificationCode = generateVerificationCode()
        console.log('Generated verification code:', verificationCode)

        global.verificationCodes = global.verificationCodes || new Map()
        global.verificationCodes.set(formattedPhone, {
          code: verificationCode,
          timestamp: Date.now(),
          userData: { firstName, lastName, email }
        })

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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Handler error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Email verification helper function
async function sendVerificationEmail(email: string) {
  // Implement your email sending logic here
  // You can use services like SendGrid, AWS SES, etc.
} 