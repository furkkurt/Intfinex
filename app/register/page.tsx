'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { signInWithCustomToken } from 'firebase/auth'
import { auth, db } from '@/firebase/config'
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc, getDoc, increment, runTransaction, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'

export default function Register() {
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [emailVerificationCode, setEmailVerificationCode] = useState('')
  const [errors, setErrors] = useState<{
    email?: string
    phoneNumber?: string
    password?: string
    confirmPassword?: string
    fullName?: string
    general?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const router = useRouter()

  useEffect(() => {
    if (step === 2) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [step])

  useEffect(() => {
    if (step === 2) {
      const checkVerification = setInterval(async () => {
        const user = auth.currentUser
        if (user) {
          await user.reload()
          if (user.emailVerified) {
            clearInterval(checkVerification)
            setMessage('Email verified! You can now proceed to SMS verification.')
          }
        }
      }, 3000) // Check every 3 seconds

      return () => clearInterval(checkVerification)
    }
  }, [step])

  useEffect(() => {
    const checkVerificationSetting = async () => {
      try {
        // Use the API route instead of direct Firestore access
        const response = await fetch('/api/auth/get-settings')
        const settings = await response.json()
        
        // Use the settings here
        if (!settings.verificationEnabled) {
          // Handle disabled verification
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    
    checkVerificationSetting()
  }, [])

  useEffect(() => {
    // Skip cleanup for completed registrations or step 1
    if (step === 1) return;
    
    // Handle page navigation/closing
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only prompt if in a verification stage
      if (step === 2 || step === 3) {
        const message = "Leaving this page will cancel your registration. Are you sure?";
        e.returnValue = message;
        return message;
      }
    };
    
    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Return cleanup function that runs when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [step]);

  const moveToStep2 = () => {
    setStep(2)
    setTimeLeft(60)
  }

  const moveToStep3 = () => {
    setStep(3)
  }

  const validateForm = () => {
    const newErrors: { 
      email?: string; 
      phoneNumber?: string; 
      password?: string; 
      confirmPassword?: string;
      fullName?: string 
    } = {}

    if (!fullName) {
      newErrors.fullName = 'Full name is required'
    }

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setIsLoading(true)
      setErrors({})
      
      // Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Store reference to the newly created user
      const uid = user.uid
      
      // Update profile with full name
      await updateProfile(user, {
        displayName: fullName
      })
      
      // Send email verification
      await sendEmailVerification(user)
      
      // Get next user ID
      const userIdResponse = await fetch('/api/auth/get-next-user-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!userIdResponse.ok) {
        throw new Error('Failed to get user ID')
      }
      
      const { userId } = await userIdResponse.json()
      
      // Store user data in Firestore
      await setDoc(doc(db, 'verification', uid), {
        userId,
        fullName,
        email,
        phoneNumber,
        registrationDate: new Date().toISOString().split('T')[0],
        securityLevel: 'Password',
        products: 'Information',
        dateOfBirth: 'N/A',
        accountAgent: 'N/A',
        nationality: 'N/A',
        documents: 'N/A',
        accountStatus: 'BASIC',
        uniqueId: 'N/A',
        mailAndSmsVerification: false, // Add new verification tracker field
        createdAt: serverTimestamp()
      })
      
      // Store registration data for later steps
      sessionStorage.setItem('pendingRegistration', JSON.stringify({
        uid,
        email,
        fullName,
        phoneNumber,
        userId
      }))
      
      setMessage('Verification email sent! Please check your inbox.')
      moveToStep2()
    } catch (error) {
      console.error('Registration error:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          setErrors({ email: 'Email is already in use' })
        } else if (error.message.includes('invalid-email')) {
          setErrors({ email: 'Email address is invalid' })
        } else if (error.message.includes('weak-password')) {
          setErrors({ password: 'Password is too weak' })
        } else {
          setErrors({ general: error.message })
        }
      } else {
        setErrors({ general: 'An unexpected error occurred' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
    
    try {
      console.log('Verifying code:', verificationCode)
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          code: verificationCode,
          uid: auth.currentUser?.uid
        }),
      })

      const data = await response.json()
      console.log('Verification response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }
      
      // Set a flag to prevent cleanup on unmount
      sessionStorage.setItem('verificationComplete', 'true')
      
      // After successful verification, remove temporary data
      sessionStorage.removeItem('pendingRegistration')
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Verification error:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to verify SMS code'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendSMSCode = async () => {
    console.log('Attempting to send SMS code...')
    try {
      setIsLoading(true)
      const storedData = sessionStorage.getItem('pendingRegistration')
      console.log('Stored data:', storedData)
      
      if (!storedData) {
        throw new Error('Registration data not found')
      }

      const user = auth.currentUser
      if (user) {
        // Reload user to get latest emailVerified status
        await user.reload()
        console.log('Email verified status:', user.emailVerified)
      }
      
      if (!user?.emailVerified) {
        throw new Error('Please verify your email first')
      }

      const { phoneNumber, fullName } = JSON.parse(storedData)
      console.log('Sending SMS verification for:', { phoneNumber, fullName })

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          phoneNumber,
          firstName: fullName.split(' ')[0],
          lastName: fullName.split(' ')[1],
          uid: user.uid
        })
      })

      const data = await response.json()
      console.log('API response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS code')
      }

      setStep(3)
    } catch (error) {
      console.error('SMS verification error:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to send SMS code'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-white">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111] py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
                  Personal Name / Company Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white"
                  required
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                  Phone Number
                </label>
                <PhoneInput
                  country={'tr'}
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  inputClass="!w-full !bg-[#222] !text-white !border-gray-700 text-white"
                  buttonClass="!bg-[#222] !border-gray-700"
                  dropdownClass="!bg-[#222] !text-white"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white"
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {errors.general && (
                <div className="text-red-500 text-sm">
                  {errors.general}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 text-black bg-[#00ffd5] hover:bg-[#00e6c0] rounded-full transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Continue'}
                </button>
              </div>
            </form>
          ) : step === 2 ? (
            <div className="space-y-6">
              <div className="bg-[#222] p-6 rounded-lg">
                <h3 className="text-xl font-medium text-white mb-2">
                  Email Verification Required
                </h3>
                <p className="text-gray-300">
                  We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                </p>
                <p className="text-gray-400 mt-4">
                  Once you've verified your email, click continue to proceed with SMS verification.
                </p>
                <div className="mt-2 text-center">
                  <span className="text-[#00ffd5]">Time remaining: {timeLeft}s</span>
                </div>
                <div className="mt-6 flex flex-col space-y-4">
                  <button
                    onClick={handleSendSMSCode}
                    disabled={isLoading}
                    className="w-full py-3 px-4 text-black bg-[#00ffd5] hover:bg-[#00e6c0] rounded-full disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Continue to SMS Verification'}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const user = auth.currentUser
                        if (user) {
                          await sendEmailVerification(user)
                          setMessage('Verification email resent!')
                        }
                      } catch (error) {
                        setErrors({
                          general: 'Failed to resend verification email'
                        })
                      }
                    }}
                    className="text-[#00ffd5] hover:text-[#00e6c0]"
                  >
                    Resend Verification Email
                  </button>
                </div>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="smsCode" className="block text-sm font-medium text-gray-300">
                  SMS Verification Code
                </label>
                <input
                  type="text"
                  id="smsCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="mt-1 block w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white"
                  required
                />
              </div>

              {errors.general && (
                <div className="text-red-500 text-sm">
                  {errors.general}
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isLoading}
                  className="w-full py-3 px-4 text-black bg-[#00ffd5] hover:bg-[#00e6c0] rounded-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify SMS Code'}
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-300 bg-[#1E1E1E] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
            >
              Sign In
            </Link>
            {step === 2 || step === 3 ? (
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-300 bg-[#1E1E1E] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                onClick={async (e) => {
                  // Prevent default navigation
                  e.preventDefault();
                  
                  if (auth.currentUser) {
                    try {
                      const uid = auth.currentUser.uid;
                      console.log('User clicked Home during verification. Cleaning up user:', uid);
                      
                      // Use an API endpoint to handle the deletion instead of doing it client-side
                      const response = await fetch('/api/auth/cancel-registration', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid })
                      });
                      
                      if (response.ok) {
                        console.log('User cleanup successful');
                      } else {
                        console.error('User cleanup failed');
                      }
                      
                      // Remove from session storage
                      sessionStorage.removeItem('pendingRegistration');
                      
                      // Navigate home
                      window.location.href = "/";
                    } catch (error) {
                      console.error('Error during Home button cleanup:', error);
                      // Still navigate home even if cleanup fails
                      window.location.href = "/";
                    }
                  } else {
                    // If no user, just navigate home
                    window.location.href = "/";
                  }
                }}
              >
                Home
              </Link>
            ) : (
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-300 bg-[#1E1E1E] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 