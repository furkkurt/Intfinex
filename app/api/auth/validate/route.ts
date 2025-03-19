import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { email, phoneNumber } = await request.json()

    const errors: { email?: string; phoneNumber?: string } = {}

    // Format phone number
    let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`
    }

    // Check email
    try {
      const userByEmail = await adminAuth.getUserByEmail(email)
      if (userByEmail) {
        errors.email = 'Email already in use'
      }
    } catch (error) {
      // Error means user not found, which is what we want
    }

    // Check phone number - ensure this block is properly executed
    try {
      // Add explicit logging to debug
      console.log(`Validating phone number: ${formattedPhone}`);
      
      const userByPhone = await adminAuth.getUserByPhoneNumber(formattedPhone);
      console.log('Found existing user with phone:', userByPhone?.uid);
      
      if (userByPhone) {
        errors.phoneNumber = 'Phone number already in use';
      }
    } catch (error: unknown) {
      // Log the error type to confirm it's the expected "user-not-found" error
      const errorInfo = error instanceof Error 
        ? error.message
        : typeof error === 'object' && error !== null && 'code' in error
          ? (error as { code: string }).code
          : 'unknown error';
          
      console.log('Phone lookup error (expected if new):', errorInfo);
      // Error means user not found, which is what we want
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
} 