import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useVerificationStatus } from '@/hooks/useVerificationStatus'

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname()
  const { isVerified, isLoading } = useVerificationStatus()

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Tabs Navigation */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex space-x-4">
          <Link
            href="/dashboard"
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              pathname === '/dashboard'
                ? 'bg-[#00ffd5] text-black'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Dashboard
          </Link>
          
          {isVerified && (
            <Link
              href="/financial-room"
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                pathname === '/financial-room'
                  ? 'bg-[#00ffd5] text-black'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Financial Room
            </Link>
          )}
          
          {!isVerified && !isLoading && (
            <div className="px-6 py-2 rounded-full text-sm font-medium text-gray-500 cursor-not-allowed">
              Financial Room (Verification Required)
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main>
        {children}
      </main>

      <Footer />
    </div>
  )
} 