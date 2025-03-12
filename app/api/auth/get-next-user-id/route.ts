import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST() {
  try {
    const counterRef = adminDb.collection('counters').doc('users')
    
    const result = await adminDb.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef)
      
      if (!counterDoc.exists) {
        transaction.set(counterRef, { count: 10001 })
        return 10000
      }
      
      const newCount = (counterDoc.data()?.count || 10000) + 1
      transaction.update(counterRef, { count: newCount })
      return newCount - 1
    })
    
    return NextResponse.json({ userId: result })
  } catch (error) {
    console.error('Error getting next user ID:', error)
    return NextResponse.json(
      { error: 'Failed to get next user ID' },
      { status: 500 }
    )
  }
} 