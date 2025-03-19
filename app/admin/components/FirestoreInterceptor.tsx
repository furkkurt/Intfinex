'use client'
import { useEffect } from 'react'

export default function FirestoreInterceptor() {
  useEffect(() => {
    // Only run this in the browser
    if (typeof window === 'undefined') return
    
    console.log('⚡️ Firestore Interceptor active')
    
    // Method 1: Intercept fetch requests
    const originalFetch = window.fetch
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      
      // Check if this is a Firestore write operation
      if (url.includes('firestore.googleapis.com') && 
          url.includes('/Write/') && 
          init?.method === 'POST') {
        
        console.log('🛑 Intercepted Firestore write operation')
        
        // Reject with permission error to prevent client-side updates
        return Promise.reject(new Error('Firestore operations blocked by interceptor - use server API instead'))
      }
      
      // Pass through to the original fetch for all other requests
      return originalFetch.apply(this, [input, init])
    }
    
    // Method 2: Try to monkey patch Firestore SDK
    try {
      // This is a more drastic approach - it hooks into the actual Firebase SDK
      if (window.firebase?.firestore) {
        const originalUpdate = window.firebase.firestore.DocumentReference.prototype.update
        window.firebase.firestore.DocumentReference.prototype.update = function(...args: any[]) {
          console.log('🛑 Intercepted Firestore update operation on path:', this.path)
          // Extract the document ID from the path
          const docId = this.id
          
          throw new Error(`Direct Firestore updates are blocked in admin area. Use server APIs instead. Path: ${this.path}`)
        }
        
        console.log('✅ Successfully monkey-patched Firestore SDK')
      }
    } catch (e) {
      console.log('⚠️ Could not monkey-patch Firestore SDK:', e)
    }
    
    return () => {
      // Cleanup
      window.fetch = originalFetch
    }
  }, [])
  
  return null
} 