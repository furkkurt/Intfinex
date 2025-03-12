'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import GetStartedSteps from '@/components/GetStartedSteps'
import Solutions from '@/components/Solutions'
import TradeOnGo from '@/components/TradeOnGo'
import TradingJourney from '@/components/TradingJourney'
import Newsletter from '@/components/Newsletter'
import Achievements from '@/components/Achievements'
import { auth } from '@/firebase/config'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#00ffd5]">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="max-w-6xl mx-auto px-4">
        <Hero />
        <GetStartedSteps />
        <Solutions />
        <TradeOnGo />
        <TradingJourney />
        <Newsletter />
        <Achievements />
      </div>
      <Footer />
    </main>
  )
}
