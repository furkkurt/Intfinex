import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const settingsDoc = await adminDb.collection('system').doc('settings').get()
    
    // Default to enabled if setting doesn't exist
    const enabled = settingsDoc.exists 
      ? settingsDoc.data()?.verificationEnabled !== false // Changed from smsVerificationEnabled
      : true
    
    return NextResponse.json({ enabled })
  } catch (error) {
    console.error('Error getting verification status:', error)
    return NextResponse.json({ error: 'Failed to get verification status' }, { status: 500 })
  }
} 