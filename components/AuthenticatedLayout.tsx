import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Tabs Navigation */}
      <div className="border-b border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/dashboard"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                pathname === '/dashboard'
                  ? 'border-[#00ffd5] text-[#00ffd5]'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/financial-room"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                pathname === '/financial-room'
                  ? 'border-[#00ffd5] text-[#00ffd5]'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Financial Room
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <Footer />
    </div>
  )
} 