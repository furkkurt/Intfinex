import { NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'
import { adminAuth } from '@/lib/firebase-admin'

const db = getFirestore()

export async function POST() {
  try {
    const users = await adminAuth.listUsers()
    
    for (const user of users.users) {
      await db.collection('users').doc(user.uid).set({
        name: user.displayName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        isVerified: false,
      }, { merge: true })
    }
    
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
} 