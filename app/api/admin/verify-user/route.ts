import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { userId, verified } = await req.json()

    console.log('AdminPanel: Setting verified status for user:', userId, 'to:', verified)

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    console.log('Admin credentials:', {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length
    })

    // Ensure verified is boolean type
    const verifiedValue = Boolean(verified)
    console.log('AdminPanel: Normalized verified value:', verifiedValue)

    // First check the document
    const beforeDoc = await adminDb.collection('verification').doc(userId).get()
    console.log('AdminPanel: Before update:', beforeDoc.exists ? beforeDoc.data()?.verified : null)

    await adminDb.collection('verification').doc(userId).update({
      verified: verifiedValue,
      lastAdminUpdate: new Date().toISOString(),
      updatedBy: 'admin'
    })

    // Verify the update
    const afterDoc = await adminDb.collection('verification').doc(userId).get()
    console.log('AdminPanel: After update:', afterDoc.exists ? afterDoc.data()?.verified : null)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating verified status:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
} 