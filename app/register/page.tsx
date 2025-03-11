'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { signInWithCustomToken } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

export default function Register() {
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [errors, setErrors] = useState<{
    email?: string
    phoneNumber?: string
    password?: string
    fullName?: string
    general?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    const newErrors: typeof errors = {}

    // Validate full name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters'
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format'
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Validate phone number
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Invalid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // First validate email and phone
      const validationResponse = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phoneNumber })
      })

      const validationData = await validationResponse.json()

      if (!validationResponse.ok) {
        setErrors(validationData.errors)
        setIsLoading(false)
        return
      }

      // If validation passes, create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with full name
      await updateProfile(user, {
        displayName: fullName
      })

      // Send verification code
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          phoneNumber,
          fullName,
          email,
          uid: user.uid
        })
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setStep(2)
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'Registration failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          phoneNumber,
          code: verificationCode,
          uid: auth.currentUser?.uid
        })
      })

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      if (data.customToken) {
        await signInWithCustomToken(auth, data.customToken)
        router.push('/')
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Verification failed'
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
                  minLength={6}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
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
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-300">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="code"
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00ffd5] focus:border-[#00ffd5] bg-[#1E1E1E] text-white sm:text-sm"
                  />
                </div>
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
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-black bg-[#00ffd5] hover:bg-[#00e6c0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ffd5] transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-300 bg-[#1E1E1E] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-300 bg-[#1E1E1E] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 