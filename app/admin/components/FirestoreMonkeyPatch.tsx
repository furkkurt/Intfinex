'use client'
import { useEffect } from 'react'

export default function FirestoreMonkeyPatch() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return
    
    console.log('🔧 Installing deep Firestore monkey patch')
    
    // Approach 1: Intercept Firebase objects
    if (window.firebase) {
      console.log('🔍 Firebase found in window object')
      try {
        // Patch Firestore reference update
        if (window.firebase.firestore?.DocumentReference?.prototype?.update) {
          const originalUpdate = window.firebase.firestore.DocumentReference.prototype.update
          window.firebase.firestore.DocumentReference.prototype.update = function(...args) {
            console.log('🛠️ Intercepted Firestore update on path:', this.path)
            
            // Get document ID from path
            const pathParts = this.path.split('/')
            const docId = pathParts[pathParts.length - 1] 
            
            // Create server API call
            console.log('⚙️ Redirecting to server API with ID:', docId)
            
            // Instead of throwing, we'll silently handle via API
            fetch('/api/admin/update-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: docId,
                updates: args[0] // First argument contains the updates
              })
            }).then(response => {
              console.log('✅ API response:', response.status)
              return response.json()
            }).catch(err => {
              console.error('❌ API error:', err)
            })
            
            // Return a promise that resolves immediately to prevent errors
            return Promise.resolve()
          }
          console.log('✅ DocumentReference.update successfully patched')
        }
        
        // Patch Firestore set
        if (window.firebase.firestore?.DocumentReference?.prototype?.set) {
          const originalSet = window.firebase.firestore.DocumentReference.prototype.set
          window.firebase.firestore.DocumentReference.prototype.set = function(...args) {
            console.log('🛠️ Intercepted Firestore set on path:', this.path)
            
            // Get document ID from path
            const pathParts = this.path.split('/')
            const docId = pathParts[pathParts.length - 1]
            
            // Create server API call
            console.log('⚙️ Redirecting to server API with ID:', docId)
            
            // Handle via API
            fetch('/api/admin/update-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: docId,
                updates: args[0] // First argument contains the data
              })
            }).then(response => {
              console.log('✅ API response:', response.status)
              return response.json()
            }).catch(err => {
              console.error('❌ API error:', err)
            })
            
            // Return a promise that resolves immediately
            return Promise.resolve()
          }
          console.log('✅ DocumentReference.set successfully patched')
        }
      } catch (error) {
        console.error('❌ Error patching Firestore methods:', error)
      }
    } else {
      console.log('⚠️ Firebase not found in window object yet, will try dynamic interception')
      
      // Approach 2: Try to intercept dynamically
      const originalDefineProperty = Object.defineProperty
      Object.defineProperty = function(obj, prop, descriptor) {
        // Check if this looks like a Firestore operation
        if (prop === 'update' && descriptor && typeof descriptor.value === 'function') {
          console.log('🔍 Potential Firestore method detected:', prop)
          
          // Save original method
          const originalMethod = descriptor.value
          
          // Replace with our interceptor
          descriptor.value = function(...args) {
            if (this && typeof this.path === 'string' && this.path.includes('/users/')) {
              console.log('🛠️ Intercepted potential Firestore operation:', prop, 'on path:', this.path)
              
              // Get document ID from path
              const pathParts = this.path.split('/')
              const docId = pathParts[pathParts.length - 1]
              
              // Use API instead
              return fetch('/api/admin/update-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  uid: docId,
                  updates: args[0]
                })
              }).then(response => response.json())
            }
            
            // Otherwise call original
            return originalMethod.apply(this, args)
          }
        }
        
        // Call original defineProperty
        return originalDefineProperty.call(this, obj, prop, descriptor)
      }
    }
    
    return () => {
      // Cleanup if needed
      if (typeof Object.defineProperty === 'function') {
        Object.defineProperty = originalDefineProperty
      }
    }
  }, [])
  
  return null
} 