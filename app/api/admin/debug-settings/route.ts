import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    // Get the settings document
    const settingsDoc = await adminDb.collection('system').doc('settings').get()
    
    // Check if it exists and get the data
    const settingsData = settingsDoc.exists ? settingsDoc.data() : null
    
    // Return the settings data
    return NextResponse.json({
      settings: settingsData,
      exists: settingsDoc.exists,
      verificationEnabled: settingsDoc.exists ? 
        settingsDoc.data()?.verificationEnabled !== false : 
        true
    })
  } catch (error) {
    console.error('Error debugging settings:', error)
    return NextResponse.json({ error: 'Failed to debug settings' }, { status: 500 })
  }
} 