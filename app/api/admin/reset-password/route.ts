import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid, newPassword } = await request.json()
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }
    
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    
    // Update the user's password
    await adminAuth.updateUser(uid, {
      password: newPassword,
    })
    
    // Log the action for security audit
    console.log(`Admin reset password for user: ${uid} at ${new Date().toISOString()}`)
    
    return NextResponse.json({ 
      success: true,
      message: 'Password updated successfully' 
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ 
      error: 'Failed to reset password',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 