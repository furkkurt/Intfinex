import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json()

    // Format phone number
    let formattedPhone = phoneNumber.replace(/\s+/g, '')
      .replace(/[()-]/g, '')
      .replace(/^00/, '+')
    
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`
    }

    try {
      const userRecord = await adminAuth.getUserByPhoneNumber(formattedPhone)
      const customToken = await adminAuth.createCustomToken(userRecord.uid)
      
      return NextResponse.json({
        status: 'success',
        customToken,
        uid: userRecord.uid
      })
    } catch (error) {
      return NextResponse.json({
        error: 'User not found',
        details: 'Please register first'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
} 