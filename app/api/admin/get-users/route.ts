import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

const db = getFirestore()

export async function GET() {
  try {
    const verificationSnapshot = await db.collection('verification').get()
    const users = []

    for (const doc of verificationSnapshot.docs) {
      const verificationData = doc.data()
      const userId = doc.id

      try {
        const userRecord = await adminAuth.getUser(userId)
        users.push({
          id: userId,
          name: userRecord.displayName || 'N/A',
          email: userRecord.email || 'N/A',
          phoneNumber: userRecord.phoneNumber || 'N/A',
          verified: verificationData.verified || false
        })
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
} 