import { NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  try {
    const { userId, formData } = await request.json()
    
    console.log('Admin panel update for user:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    // Extract the fields we want to update
    const { 
      fullName, 
      phoneNumber, 
      accountAgent, 
      dateOfBirth, 
      products, 
      nationality, 
      documents, 
      securityLevel,
      userId: userIdNumber,
      accountStatus,
      uniqueId
    } = formData
    
    // If uniqueId is provided, check for duplicates
    if (uniqueId && uniqueId !== 'N/A') {
      // Query for users with this uniqueId
      const uniqueIdQuery = await adminDb.collection('users')
        .where('uniqueId', '==', uniqueId)
        .get()
      
      // Check if any other user has this uniqueId
      const isDuplicate = uniqueIdQuery.docs.some(doc => doc.id !== userId && doc.data().uniqueId === uniqueId)
      
      if (isDuplicate) {
        return NextResponse.json({ 
          error: 'Unique ID is already in use by another user' 
        }, { status: 400 })
      }
    }
    
    // Update user in Firestore
    await adminDb.collection('users').doc(userId).update({
      fullName,
      phoneNumber,
      accountAgent,
      dateOfBirth,
      products,
      nationality,
      documents,
      securityLevel,
      userId: userIdNumber,
      accountStatus,
      uniqueId: uniqueId === 'N/A' ? null : uniqueId,
      updatedByAdmin: true,
      updatedAt: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin panel update error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 