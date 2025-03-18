'use client'
import { useState, useEffect } from 'react'
import { auth } from '@/firebase/config'

interface EmailVerificationStepProps {
  onVerify: (code: string) => void
  onResend: () => void
  loading: boolean
  message: string
  error?: string
}

export default function EmailVerificationStep({ 
  onVerify, 
  onResend, 
  loading, 
  message, 
  error 
}: EmailVerificationStepProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [devMode, setDevMode] = useState(false)
  const [devCode, setDevCode] = useState('')

  useEffect(() => {
    setDevMode(process.env.NODE_ENV === 'development')
  }, [])

  useEffect(() => {
    if (devMode) {
      const storedCode = sessionStorage.getItem('dev_verification_code')
      console.log('EmailVerificationStep checking for code:', storedCode)
      
      if (storedCode) {
        setDevCode(storedCode)
        console.log('Found and set verification code from storage:', storedCode)
      } else {
        // If no code in sessionStorage, try to fetch it from API
        const fetchCode = async () => {
          try {
            const user = auth.currentUser
            if (user) {
              const response = await fetch('/api/debug/verification-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid })
              })
              
              if (response.ok) {
                const data = await response.json()
                if (data.data?.emailVerificationCode) {
                  setDevCode(data.data.emailVerificationCode)
                  console.log('Retrieved code from API:', data.data.emailVerificationCode)
                }
              }
            }
          } catch (error) {
            console.error('Error fetching verification code:', error)
          }
        }
        
        fetchCode()
      }
    }
  }, [devMode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting verification code:', verificationCode)
    onVerify(verificationCode)
  }

  const fillDevCode = () => {
    if (devCode) {
      setVerificationCode(devCode)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#222] p-6 rounded-lg">
        <h3 className="text-xl font-medium text-white mb-2">
          Email Verification Required
        </h3>
        <p className="text-gray-300">
          We've sent a verification code to your email address. Please check your inbox and enter the code below.
        </p>
        
        {message && (
          <div className="mt-4 p-3 bg-green-100/10 border border-green-500 text-green-500 rounded-lg">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-100/10 border border-red-500 text-red-500 rounded-lg">
            {error}
          </div>
        )}
        
        {devMode && (
          <div className="mt-4 p-3 bg-yellow-100/10 border border-yellow-500 text-yellow-500 rounded-lg">
            <p className="text-sm">DEVELOPMENT MODE</p>
            {devCode ? (
              <div className="mt-2">
                <p className="text-xs">Verification code: {devCode}</p>
                <button 
                  type="button"
                  onClick={fillDevCode}
                  className="text-xs underline mt-1"
                >
                  Auto-fill code
                </button>
              </div>
            ) : (
              <p className="text-xs">No verification code found</p>
            )}
          </div>
        )}
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 p-2 bg-gray-800 text-xs rounded">
            <p>Debug Info:</p>
            <p>Code being submitted: '{verificationCode}'</p>
            <p>Code from storage: '{devCode}'</p>
            <p>Are they equal: {verificationCode === devCode ? 'Yes' : 'No'}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full mt-1 block bg-[#333] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-4 py-2"
            maxLength={6}
            pattern="[0-9]{6}"
            required
          />
          
          <div className="mt-6 flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full py-3 px-4 text-black bg-[#00ffd5] hover:bg-[#00e6c0] rounded-full disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            
            <button
              type="button"
              onClick={onResend}
              disabled={loading}
              className="text-[#00ffd5] hover:text-[#00e6c0]"
            >
              Resend Verification Code
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 