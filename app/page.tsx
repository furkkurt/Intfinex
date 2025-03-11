'use client'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import Dashboard from '@/components/Dashboard'
import Hero from '@/components/Hero'
import GetStartedSteps from '@/components/GetStartedSteps'
import Solutions from '@/components/Solutions'
import TradeOnGo from '@/components/TradeOnGo'
import TradingJourney from '@/components/TradingJourney'
import Newsletter from '@/components/Newsletter'
import Achievements from '@/components/Achievements'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#00ffd5]">Loading...</div>
      </div>
    )
  }

  if (isLoggedIn) {
    return(
      <main className="min-h-screen bg-black">
        <Dashboard />
      </main>
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
