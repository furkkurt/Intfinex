import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid, source } = await request.json()
    
    // Send an immediate response to prevent timeout
    const response = NextResponse.json({ received: true, processing: true })
    
    // Use a separate async process to handle the fix
    (async () => {
      console.log(`🚨 EMERGENCY FIX for ${uid} from ${source}`)
      
      try {
        const docRef = adminDb.collection('verification').doc(uid)
        const doc = await docRef.get()
        
        console.log('Current state:', doc.exists ? doc.data() : 'No document')
        
        // Force the update
        await docRef.update({
          verified: false,
          _emergency: true,
          _source: source || 'emergency-endpoint',
          _timestamp: new Date().toISOString()
        })
        
        console.log(`Emergency fix applied for ${uid}`)
        
        // Verify it worked
        const afterDoc = await docRef.get()
        console.log('After fix:', afterDoc.exists ? 
          { verified: afterDoc.data()?.verified } : 
          'No document')
      } catch (innerError) {
        console.error('Inner emergency fix error:', innerError)
      }
    })()
    
    return response
  } catch (error) {
    console.error('Emergency fix endpoint error:', error)
    return NextResponse.json({ error: 'Fix failed' }, { status: 500 })
  }
} 