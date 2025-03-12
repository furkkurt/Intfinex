import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { enabled } = await request.json()
    
    // Update the system settings document
    await adminDb.collection('system').doc('settings').set({
      smsVerificationEnabled: enabled,
      lastUpdated: new Date().toISOString()
    }, { merge: true })
    
    return NextResponse.json({ success: true, enabled })
  } catch (error) {
    console.error('Error toggling SMS verification:', error)
    return NextResponse.json({ error: 'Failed to toggle SMS verification' }, { status: 500 })
  }
} 