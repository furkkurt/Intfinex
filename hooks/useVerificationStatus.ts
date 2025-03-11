import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'

const db = getFirestore()

export function useVerificationStatus() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Listen to the verification document
        const verificationDoc = doc(db, 'verification', user.uid)
        const unsubscribeDoc = onSnapshot(verificationDoc, (doc) => {
          if (doc.exists()) {
            setIsVerified(doc.data()?.verified ?? false)
          } else {
            setIsVerified(false)
          }
          setIsLoading(false)
        })

        return () => unsubscribeDoc()
      } else {
        setIsVerified(null)
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return { isVerified, isLoading }
} 