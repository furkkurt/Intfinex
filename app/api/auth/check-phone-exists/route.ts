import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json()
    
    // Format phone number to E.164 format
    let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '')
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`
    }
    
    console.log('Checking phone existence:', formattedPhone)
    
    try {
      // Try to get user with this phone number
      const userByPhone = await adminAuth.getUserByPhoneNumber(formattedPhone)
      
      // If we get here, a user with this phone exists
      console.log('Phone number already exists for user:', userByPhone.uid)
      return NextResponse.json({ exists: true, uid: userByPhone.uid })
    } catch (error) {
      // If error is user-not-found, phone is available
      console.log('Phone check error (good if user-not-found):', error.code || error.message)
      return NextResponse.json({ exists: false })
    }
  } catch (error) {
    console.error('Phone check error:', error)
    return NextResponse.json({ error: 'Failed to check phone' }, { status: 500 })
  }
} 