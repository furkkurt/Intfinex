'use client'
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import Link from 'next/link'
import { auth } from '@/firebase/config'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/')
    } catch (error) {
      setError('Invalid email or password')
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first')
      return
    }
    
    try {
      setIsResettingPassword(true)
      setError('')
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setResetSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset password')
    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-[#111] p-8 rounded-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Sign in to your account</h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResettingPassword}
              className="text-[#00ffd5] hover:text-[#00e6c0]"
            >
              {isResettingPassword ? 'Sending...' : 'Forgot Password?'}
            </button>
          </div>

          {resetSuccess && (
            <p className="text-green-500 text-sm text-center mt-2">
              Check your email for your new password
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 text-black bg-[#00ffd5] hover:bg-[#00e6c0] rounded-full transition-all transform hover:scale-105"
          >
            Sign In
          </button>

          <div className="text-center">
            <Link href="/register" className="text-[#00ffd5] hover:text-[#00e6c0]">
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
} 