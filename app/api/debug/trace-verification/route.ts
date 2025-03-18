import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    
    // Add a watcher to the document
    console.log(`Setting up trace for user ${userId}`)
    
    // Get current time for reference
    const now = new Date().toISOString()
    
    // Mark this document for tracing
    await adminDb.collection('users').doc(userId).update({
      _traceEnabled: true,
      _traceStartedAt: now,
      _verifiedAtTraceStart: false // We'll set this to the actual current verified value
    })
    
    return NextResponse.json({ 
      success: true,
      message: `Trace enabled for user ${userId}. Watch server logs for changes.`
    })
  } catch (error) {
    console.error('Error setting up trace:', error)
    return NextResponse.json({ error: 'Failed to setup trace' }, { status: 500 })
  }
} 