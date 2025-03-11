'use client'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface UserInfo {
  displayName: string | null
  email: string | null
  phoneNumber: string | null
}

export default function Account() {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    displayName: null,
    email: null,
    phoneNumber: null
  })

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserInfo({
          displayName: user.displayName,
          email: user.email,
          phoneNumber: user.phoneNumber
        })
      }
    })
    return () => unsubscribe()
  }, [])

  // Update the name splitting logic
  const nameParts = userInfo.displayName?.split(' ') || ['', '', '']
  const firstName = nameParts.slice(0, -1).join(' ') // Join all parts except the last one
  const lastName = nameParts[nameParts.length - 1] // Take the last part as surname

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-[#111] rounded-3xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-8">Account Details</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-[#00ffd5] mb-2">Personal Information</h2>
              <div className="bg-[#1E1E1E] rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-gray-400">First Name</p>
                  <p className="text-white text-lg">{firstName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Last Name</p>
                  <p className="text-white text-lg">{lastName}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-[#00ffd5] mb-2">Contact Information</h2>
              <div className="bg-[#1E1E1E] rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="text-white text-lg">{userInfo.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Phone Number</p>
                  <p className="text-white text-lg">{userInfo.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
} 