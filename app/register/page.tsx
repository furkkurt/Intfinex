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
import EmailVerificationStep from './components/EmailVerificationStep'
import { User } from 'firebase/auth'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

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
  const [phoneNumberChecked, setPhoneNumberChecked] = useState(false)
  const [success, setSuccess] = useState('')
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
            setMessage('Email verified! Sending SMS verification code...')
            
            // Force send SMS immediately
            try {
              const response = await fetch('/api/auth/sms-verification', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  action: 'send',
                  uid: user.uid,
                  phoneNumber: phoneNumber
                })
              })
              
              const data = await response.json()
              
              if (data.success) {
                console.log('SMS sent successfully after email verification')
                setMessage('SMS verification code sent! Check your phone.')
                setStep(3) // Move to SMS verification step
              } else {
                console.error('Failed to send SMS after email verification:', data.error)
                setErrors({ general: 'Failed to send SMS. Please try resending.' })
                setStep(3) // Still move to SMS step to allow manual resend
              }
            } catch (err) {
              console.error('Error sending SMS after email verification:', err)
              setErrors({ general: 'Failed to send SMS. Please try resending.' })
              setStep(3) // Move to SMS step for manual resend
            }
          }
        }
      }, 2000)
      
      return () => clearInterval(checkVerification)
    }
  }, [step, phoneNumber])

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
    setMessage('')
  }

  const checkPhoneNumber = async (value: string) => {
    if (!value || value.length < 10) return
    
    try {
      const response = await fetch('/api/auth/check-phone-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: value })
      })
      
      const data = await response.json()
      
      if (data.exists) {
        setErrors(prev => ({ ...prev, phoneNumber: 'Phone number already in use' }))
        return false
      } else {
        setErrors(prev => {
          const newErrors = {...prev}
          delete newErrors.phoneNumber
          return newErrors
        })
        setPhoneNumberChecked(true)
        return true
      }
    } catch (error) {
      console.error('Error checking phone:', error)
      return false
    }
  }

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value)
    setPhoneNumberChecked(false)
  }

  const handlePhoneBlur = () => {
    if (phoneNumber) {
      checkPhoneNumber(phoneNumber)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

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

    if (phoneNumber && !phoneNumberChecked) {
      const isPhoneAvailable = await checkPhoneNumber(phoneNumber)
      if (!isPhoneAvailable) return
    }

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
      await sendVerificationEmail(user)
      
      // Get next user ID
      const userIdResponse = await fetch('/api/auth/get-next-user-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!userIdResponse.ok) {
        throw new Error('Failed to get user ID')
      }
      
      const { userId: userIdFromAPI } = await userIdResponse.json()
      
      // Store user data in Firestore
      const userId = await createUserDocuments(user)
      
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

      if (process.env.NODE_ENV === 'development') {
        // Store the last verification code in sessionStorage for testing
        const response = await fetch('/api/auth/get-last-verification-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid })
        });
        
        if (response.ok) {
          const { code } = await response.json();
          console.log('DEV MODE - Verification code:', code);
          // You could even auto-fill the code in development
          // setEmailVerificationCode(code);
        }
      }

      // Make sure phone is linked to Auth
      try {
        const phoneResponse = await fetch('/api/auth/link-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid, 
            phoneNumber: phoneNumber
          }),
        });
        
        if (!phoneResponse.ok) {
          const phoneError = await phoneResponse.json();
          throw new Error(phoneError.error || 'Failed to link phone number');
        }
      } catch (error) {
        console.error('Error linking phone number:', error);
        setIsLoading(false);
        setErrors({ general: 'Failed to link phone number. Please try again.' });
        return;
      }
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

  const sendVerificationEmail = async (user: User) => {
    try {
      console.log('Sending verification email to:', user.email);
      
      // Generate a verification code here on the client side
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Generated verification code:', verificationCode);
      
      // First create or update the verification document
      const verificationRef = doc(db, 'users', user.uid);
      await setDoc(verificationRef, {
        emailVerificationCode: verificationCode,
        emailVerificationSentAt: new Date().toISOString(),
        emailVerificationAttempts: 0,
        // Store email to help with debugging
        email: user.email
      }, { merge: true });
      
      // Store in sessionStorage immediately for dev mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Storing verification code persistently...');
        localStorage.setItem('dev_verification_code', verificationCode);
        sessionStorage.setItem('dev_verification_code', verificationCode);
      }
      
      // Then send the email with the same code
      const response = await fetch('/api/auth/email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          uid: user.uid,
          email: user.email,
          code: verificationCode
        })
      });
      
      const data = await response.json();
      console.log('Email API response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }
      
      setMessage('Verification code sent to your email!');
      console.log('Verification email sent successfully');
      
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      setErrors({
        general: 'Failed to send verification email. Please try again.'
      });
      return false;
    }
  };

  const verifyEmailCode = async (code: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not found');
      
      const response = await fetch('/api/auth/email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          uid: user.uid,
          code
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to verify email');
      }
      
      // Update the user object to reflect the verified status
      await user.reload();
      
      setMessage('Email verified! You can now proceed to SMS verification.');
      return true;
    } catch (error) {
      console.error('Error verifying email:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to verify email'
      });
      return false;
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
    
    try {
      // This function is for SMS verification, not email verification
      console.log('Verifying SMS code:', verificationCode)
      
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
    await handleSendSmsVerification();
  }

  const handleSendSmsVerification = async () => {
    setErrors({});
    setIsLoading(true);
    
    try {
      console.log('Sending SMS verification...');
      
      // Log the user object to make sure we have the current UID
      console.log('Current user:', auth.currentUser?.uid);
      
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }
      
      // Make sure the phone is properly formatted for Twilio
      let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      console.log('Sending SMS verification to:', formattedPhone.replace(/\d(?=\d{4})/g, "*"));
      
      // Call the SMS verification API
      const response = await fetch('/api/auth/sms-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'send',
          uid: auth.currentUser.uid,
          phoneNumber: formattedPhone
        })
      });
      
      const data = await response.json();
      console.log('SMS verification response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to send SMS verification');
      }
      
      setMessage('SMS verification code sent to your phone.');
      
      // For development, save the code to help testing
      if (process.env.NODE_ENV === 'development' && data.devCode) {
        console.log('Dev SMS code:', data.devCode);
        sessionStorage.setItem('dev_sms_code', data.devCode);
      }
    } catch (err) {
      console.error('SMS verification error:', err);
      setErrors({
        general: err instanceof Error ? err.message : 'Failed to send SMS verification'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const checkForStoredCode = () => {
        const storedCode = localStorage.getItem('dev_verification_code') || 
                          sessionStorage.getItem('dev_verification_code');
        console.log('DEV MODE - Verification code check:', storedCode || 'not found');
        
        // Re-store it in case it was lost
        if (storedCode) {
          sessionStorage.setItem('dev_verification_code', storedCode);
          localStorage.setItem('dev_verification_code', storedCode);
        }
      };
      
      checkForStoredCode();
      // Run periodically to ensure it persists
      const interval = setInterval(checkForStoredCode, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleVerifySMS = async () => {
    setErrors({});
    setIsLoading(true);
    
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch('/api/auth/sms-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'verify',
          uid: auth.currentUser.uid,
          code: verificationCode
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to verify SMS code');
      }
      
      // Also update the emailAndSmsVerified status directly here for redundancy
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, {
          emailAndSmsVerified: true
        });
      } catch (dbError) {
        console.error('Warning: Could not update user document directly:', dbError);
        // We continue anyway since the API should have updated it
      }
      
      // Set verification complete flag
      sessionStorage.setItem('verificationComplete', 'true');
      
      // Remove temporary data
      sessionStorage.removeItem('pendingRegistration');
      sessionStorage.removeItem('dev_sms_code');
      sessionStorage.removeItem('dev_verification_code');
      
      // Add a success message before redirecting
      setMessage('Verification successful! Redirecting to dashboard...');
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('SMS verification error:', err);
      setErrors({
        general: err instanceof Error ? err.message : 'Failed to verify SMS code'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugSms = async () => {
    setErrors({});
    setIsLoading(true);
    
    try {
      console.log('Attempting to send debug SMS...');
      
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }
      
      // Call the debug SMS endpoint
      const response = await fetch('/api/auth/debug-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: auth.currentUser.uid,
          phoneNumber: phoneNumber
        })
      });
      
      const data = await response.json();
      console.log('Debug SMS response:', data);
      
      if (data.success) {
        setMessage(`SMS sent successfully!`);
        // Save the code in session storage for easy testing
        sessionStorage.setItem('dev_sms_code', data.code);
        
        // After successful SMS, move to verification step
        setStep(3);
      } else {
        throw new Error(data.error || 'Failed to send debug SMS');
      }
    } catch (err) {
      console.error('Debug SMS error:', err);
      setErrors({
        general: err instanceof Error ? err.message : 'Failed to send SMS verification'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createUserDocuments = async (user: User) => {
    try {
      // Call the API to create user documents
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: user.uid,
          email,
          phoneNumber,
          fullName,
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create user documents');
      }
      
      console.log('User documents created successfully with ID:', data.userId);
      return data.userId;
    } catch (error) {
      console.error('Error creating user documents:', error);
      throw error;
    }
  };

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

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <PhoneInput
                  country={'tr'}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  inputStyle={{
                    width: '100%',
                    backgroundColor: '#222',
                    color: 'white',
                    borderColor: '#4B5563',
                    borderRadius: '0.5rem',
                  }}
                  buttonStyle={{
                    backgroundColor: '#222',
                    borderColor: '#4B5563',
                    borderRadius: '0.5rem 0 0 0.5rem',
                  }}
                  dropdownStyle={{
                    backgroundColor: '#222',
                    color: 'white',
                  }}
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
            <EmailVerificationStep
              onVerify={async (code: string) => {
                setIsLoading(true);
                try {
                  const success = await verifyEmailCode(code);
                  if (success) {
                    moveToStep3();
                  }
                } finally {
                  setIsLoading(false);
                }
              }}
              onResend={async () => {
                try {
                  const user = auth.currentUser;
                  if (user) {
                    await sendVerificationEmail(user);
                    setMessage('Verification code resent!');
                  }
                } catch (error) {
                  setErrors({
                    general: 'Failed to resend verification code'
                  });
                }
              }}
              loading={isLoading}
              message={message}
              error={errors.general}
            />
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

              {message && (
                <div className="text-green-500 text-sm bg-green-900/20 p-2 rounded">
                  {message}
                </div>
              )}

              {errors.general && (
                <div className="text-red-500 text-sm bg-red-900/20 p-2 rounded">
                  {errors.general}
                </div>
              )}

              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={handleVerifySMS}
                  disabled={isLoading || !verificationCode}
                  className="w-full py-3 px-4 text-black bg-[#00ffd5] hover:bg-[#00e6c0] rounded-full disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify SMS Code"}
                </button>
                
                <button
                  type="button"
                  onClick={handleDebugSms}
                  disabled={isLoading}
                  className="text-[#00ffd5] hover:text-[#00e6c0] text-sm"
                >
                  Resend Verification Code
                </button>
              </div>
            </div>
          ) : step === 4 ? (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-green-500 mb-4">
                  <CheckCircleIcon className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">
                  Verification Complete
                </h3>
                <p className="text-gray-300">
                  Your account has been successfully verified. Redirecting to dashboard...
                </p>
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