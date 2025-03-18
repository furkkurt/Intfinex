import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }
    
    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(id).get()
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Get auth data
    let authData = {}
    try {
      const authUser = await adminAuth.getUser(id)
      authData = {
        authEmail: authUser.email,
        authEmailVerified: authUser.emailVerified,
        authPhoneNumber: authUser.phoneNumber,
        authProviders: authUser.providerData.map(p => p.providerId)
      }
    } catch (error) {
      console.error('Error getting auth user:', error)
      // Continue even if auth data can't be fetched
    }
    
    // Return combined data
    return NextResponse.json({
      ...userDoc.data(),
      ...authData,
      id: userDoc.id
    })
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json({ 
      error: 'Failed to get user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 