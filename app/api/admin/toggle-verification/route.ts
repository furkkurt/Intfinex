import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { enabled } = await request.json()
    
    // Update the system settings document
    await adminDb.collection('system').doc('settings').set({
      verificationEnabled: enabled,
      _lastToggled: new Date().toISOString(),
      _toggledBy: 'admin'
    }, { merge: true })
    
    return NextResponse.json({ success: true, enabled })
  } catch (error) {
    console.error('Error toggling verification:', error)
    return NextResponse.json({ error: 'Failed to toggle verification' }, { status: 500 })
  }
} 