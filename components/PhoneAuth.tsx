'use client'
import { useState, useEffect } from 'react'
import { auth } from '@/firebase/config'
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { FirebaseError } from '@/types/firebase'

export default function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationId, setVerificationId] = useState<ConfirmationResult | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.')
        }
      })
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }
    }
  }, [])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized')
      }

      let formattedPhone = phoneNumber.trim()
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.startsWith('0') 
          ? `${formattedPhone.substring(1)}` 
          : `${formattedPhone}`
      }

      const verifier = window.recaptchaVerifier as RecaptchaVerifier
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        verifier
      )
      setVerificationId(confirmationResult)
      setError('')
    } catch (err) {
      console.error('Error sending code:', err)
      setError(err instanceof Error ? err.message : 'Failed to send verification code')
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined
      }
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!verificationId) {
        throw new Error('No verification ID found')
      }
      await confirmCode()
    } catch (err) {
      const firebaseError = err as FirebaseError
      setError(firebaseError.message)
    }
  }

  const confirmCode = async () => {
    try {
      setVerifying(true)
      
      console.log('Confirming verification code...')
      
      if (!verificationId) {
        throw new Error('No verification ID found')
      }
      
      // Try to confirm the verification code
      await verificationId.confirm(verificationCode)
      
      // Show visible confirmation
      alert('SMS verified! Setting account status...')
      
      // Use EXACTLY the same method as the admin panel
      if (auth.currentUser?.uid) {
        try {
          const response = await fetch('/api/admin/force-set-unverified', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: auth.currentUser.uid })
          })

          if (!response.ok) {
            throw new Error('Failed to set unverified status')
          }

          // Check if it worked
          alert('Status set! Redirecting to dashboard...')
        } catch (error) {
          console.error('Failed to set user as unverified:', error)
          alert('Warning: Failed to set verification status. Please contact support.')
        }
      }
      
      setVerifying(false)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error verifying code:', error)
      setError('Invalid verification code')
      setVerifying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Register with Phone Number
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {!verificationId ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Phone Number (with country code)
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div id="recaptcha-container" className="flex justify-center"></div>
            <button 
              type="submit" 
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Verification Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Verify Code
            </button>
          </form>
        )}
      </div>
    </div>
  )
} 