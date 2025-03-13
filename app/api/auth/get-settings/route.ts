import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const settingsDoc = await adminDb.collection('system').doc('settings').get()
    
    const settings = settingsDoc.exists ? settingsDoc.data() : {
      verificationEnabled: true,
      smsVerificationEnabled: true
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error getting settings:', error)
    return NextResponse.json({ 
      error: 'Failed to get settings',
      verificationEnabled: true, // Default to enabled
      smsVerificationEnabled: true
    }, { status: 500 })
  }
} 