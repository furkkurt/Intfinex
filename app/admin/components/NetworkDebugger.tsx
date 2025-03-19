'use client'
import { useEffect } from 'react'

export default function NetworkDebugger() {
  useEffect(() => {
    // Only run in development and in the browser
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return
    
    console.log('🔍 Network Debugger active')
    
    // Intercept XHR requests
    const originalXHROpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function(
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null
    ) {
      // Add event listener to track responses
      this.addEventListener('load', function() {
        console.log(`📡 XHR ${method} ${url} - Status: ${this.status}`)
      })
      
      // Call original method
      return originalXHROpen.call(this, method, url, async, username, password)
    }
    
    // Intercept fetch requests
    const originalFetch = window.fetch
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      const method = init?.method || 'GET'
      
      console.log(`📡 Fetch request: ${method} ${url}`)
      
      try {
        const response = await originalFetch.apply(this, [input, init])
        console.log(`✅ Fetch response: ${method} ${url} - Status: ${response.status}`)
        
        // Clone the response to not consume it
        return response.clone()
      } catch (error) {
        console.log(`❌ Fetch error: ${method} ${url} - ${error}`)
        throw error
      }
    }
    
    return () => {
      // Restore originals
      XMLHttpRequest.prototype.open = originalXHROpen
      window.fetch = originalFetch
    }
  }, [])
  
  return null
} 