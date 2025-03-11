'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useVerificationStatus } from '@/hooks/useVerificationStatus'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TradingViewChart from '@/components/TradingViewChart'
import MarketTicker from '@/components/MarketTicker'
import MarketEvents from '@/components/MarketEvents'
import MarketTimeline from '@/components/MarketTimeline'

export default function FinancialRoom() {
  const router = useRouter()
  const { isVerified, isLoading } = useVerificationStatus()

  useEffect(() => {
    if (!isLoading && !isVerified) {
      router.push('/dashboard')
    }
  }, [isVerified, isLoading, router])

  // Show loading state while checking verification
  if (isLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </main>
    )
  }

  // If not verified, don't render the content (user will be redirected)
  if (!isVerified) {
    return null
  }

  // Render financial room content for verified users
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="py-8">
        <MarketTicker />
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <TradingViewChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <MarketEvents />
            <MarketTimeline />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
} 