import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { uid } = await request.json()
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }
    
    console.log('🔴 ADDING VERIFIED=FALSE for user:', uid)
    
    // Check current document
    const docRef = adminDb.collection('users').doc(uid)
    const doc = await docRef.get()
    
    console.log('Current document:', doc.exists ? doc.data() : 'No document')
    
    // Add the verified field explicitly (don't update, set it newly)
    await docRef.set({
      verified: false,
      _verifiedAddedAt: new Date().toISOString()
    }, { merge: true }) // Use merge to preserve other fields
    
    console.log('✅ verified=false explicitly added')
    
    // Double-check
    const updatedDoc = await docRef.get()
    console.log('After adding field:', updatedDoc.exists ? 
      { verified: updatedDoc.data()?.verified } : 'No document')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding verified=false:', error)
    return NextResponse.json({ error: 'Failed to add verified=false' }, { status: 500 })
  }
} 