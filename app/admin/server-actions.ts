'use server'

import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function getUsers() {
  try {
    const snapshot = await adminDb.collection('users').get()
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting users:', error)
    throw new Error('Failed to get users')
  }
}

export async function updateUser(uid: string, updates: any) {
  try {
    await adminDb.collection('users').doc(uid).update({
      ...updates,
      updatedByAdmin: true,
      updatedAt: new Date().toISOString()
    })
    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    throw new Error('Failed to update user')
  }
} 