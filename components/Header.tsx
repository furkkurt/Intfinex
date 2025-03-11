'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { useVerificationStatus } from '@/hooks/useVerificationStatus'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isVerified } = useVerificationStatus()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
      setDisplayName(user?.displayName || '')
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    { name: '', href: '/' },
  ]

  return (
    <header className="bg-black border-b border-gray-800">
      <nav className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-white font-bold text-xl">
              Intfinex
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item, index) => (
                isLoggedIn && (
                  <Link
                    key={`${item.name}-${index}`}
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                <span className="text-gray-300">Welcome, {displayName}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#00ffd5] text-black px-6 py-2 rounded-full hover:bg-[#00e6c0] transition-all transform hover:scale-105"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            {isLoggedIn ? (
              <>
                {navItems.map((item, index) => (
                  <Link
                    key={`mobile-${item.name}-${index}`}
                    href={item.href}
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="text-gray-300">Welcome, {displayName}</div>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
} 