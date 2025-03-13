'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/firebase/config'
import { getFirestore, doc, getDoc, deleteDoc } from 'firebase/firestore'

export default function VerificationCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const db = getFirestore()
  
  // Public paths that don't require verification
  // Add all registration-related paths here
  const publicPaths = [
    '/login', 
    '/register',
    '/verify-email',
    '/verify-sms'
  ]
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      // Don't check on public paths or if no user
      if (!user || !pathname || publicPaths.includes(pathname)) {
        return
      }
      
      // Only enforce verification on the homepage and dashboard paths
      // This allows registration steps to proceed normally
      if (pathname === '/' || pathname.startsWith('/dashboard')) {
        try {
          // Check if user has completed verification
          const userDocRef = doc(db, 'verification', user.uid)
          const docSnap = await getDoc(userDocRef)
          
          if (docSnap.exists()) {
            const userData = docSnap.data()
            
            // If verification is not complete, delete user
            if (userData.mailAndSmsVerification !== true) {
              console.log('Found user with incomplete verification')
              
              // Delete from Firestore
              await deleteDoc(userDocRef)
              
              // Delete from Auth
              await user.delete()
              
              // Sign out and redirect to register
              await auth.signOut()
              router.push('/register')
            }
          }
        } catch (error) {
          console.error('Error checking verification status:', error)
        }
      }
    })
    
    return () => unsubscribe()
  }, [pathname, router, db])
  
  return <>{children}</>
} 