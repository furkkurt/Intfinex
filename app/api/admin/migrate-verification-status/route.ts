import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST() {
  try {
    const snapshot = await adminDb.collection('verification').get()
    
    let updatedCount = 0
    let errorCount = 0
    
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data()
        const currentStatus = data.verified
        
        if (typeof currentStatus === 'boolean') {
          await doc.ref.update({
            verified: currentStatus === true ? 'PREMIUM' : 'BASIC',
            _migratedAt: new Date().toISOString(),
            _previousStatus: currentStatus
          })
          updatedCount++
        }
      } catch (error) {
        console.error(`Error updating doc ${doc.id}:`, error)
        errorCount++
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      updatedCount,
      errorCount,
      total: snapshot.size
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
} 