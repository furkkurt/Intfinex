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
        
        // Check if the document has the old field name
        if ('verified' in data) {
          const updateData: any = {
            accountStatus: data.verified, // Copy value from verified to accountStatus
            _fieldRenamed: true,
            _renamedAt: new Date().toISOString()
          }
          
          // Add uniqueId field if it doesn't exist
          if (!('uniqueId' in data)) {
            updateData.uniqueId = 'N/A'
          }
          
          await doc.ref.update(updateData)
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