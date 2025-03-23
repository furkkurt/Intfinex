import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid, newPassword } = await request.json()
    
    if (!uid || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Update password in Firebase Auth
    await adminAuth.updateUser(uid, {
      password: newPassword
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ 
      error: 'Failed to change password',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 