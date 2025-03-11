'use client'
import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useVerificationStatus } from '@/hooks/useVerificationStatus'

const db = getFirestore()

interface UserDetails {
  userId: number
  displayName: string | null
  accountAgent: string
  dateOfBirth: string
  products: string
  email: string | null
  phoneNumber: string | null
  registrationDate: string
  documents: string
  securityLevel: string
  nationality: string
}

function Dashboard() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [activeTab] = useState('dashboard')
  const { isVerified, isLoading } = useVerificationStatus()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const verificationDoc = doc(db, 'verification', user.uid)
        const unsubscribeDoc = onSnapshot(verificationDoc, (doc) => {
          if (doc.exists()) {
            const data = doc.data()
            setUserDetails({
              userId: data.userId,
              displayName: user.displayName,
              accountAgent: data.accountAgent,
              dateOfBirth: data.dateOfBirth,
              products: data.products,
              email: user.email,
              phoneNumber: user.phoneNumber,
              registrationDate: data.registrationDate,
              documents: data.documents,
              securityLevel: data.securityLevel,
              nationality: data.nationality
            })
          }
        })

        return () => unsubscribeDoc()
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex space-x-4">
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#00ffd5] text-black'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Dashboard
          </button>
          
          {isVerified && (
            <Link
              href="/financial-room"
              className="px-6 py-2 rounded-full text-sm font-medium text-white hover:bg-white/10 transition-all"
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

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-[#1E1E1E] rounded-3xl p-8 md:p-12">
          {userDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <p className="text-gray-400">User ID</p>
                <p className="text-white text-lg">{userDetails.userId}</p>
              </div>
              <div>
                <p className="text-gray-400">Account Agent</p>
                <p className="text-white text-lg">{userDetails.accountAgent}</p>
              </div>
              <div>
                <p className="text-gray-400">Date of Birth / Incorporate</p>
                <p className="text-white text-lg">{userDetails.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-gray-400">Products</p>
                <p className="text-white text-lg">{userDetails.products}</p>
              </div>
              <div>
                <p className="text-gray-400">Nationality / Based</p>
                <p className="text-white text-lg">{userDetails.nationality}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white text-lg">{userDetails.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Registration Date</p>
                <p className="text-white text-lg">{new Date(userDetails.registrationDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Phone Number</p>
                <p className="text-white text-lg">{userDetails.phoneNumber}</p>
              </div>
              <div>
                <p className="text-gray-400">Documents</p>
                <p className="text-white text-lg">{userDetails.documents}</p>
              </div>
              <div>
                <p className="text-gray-400">Security Level</p>
                <p className="text-white text-lg">{userDetails.securityLevel}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-4 mt-8">
          <button className="w-full bg-[#00ffd5] hover:bg-[#00e6c0] text-black p-6 rounded-3xl transition-all text-xl font-bold">
            UPGRADE YOUR ACCOUNT
          </button>
          <button className="w-full bg-[#373737] hover:bg-[#252525] text-white p-6 rounded-3xl transition-all text-xl font-bold border border-gray-800">
            OPEN TICKET
          </button>
        </div>

        {/* Contact Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">CONTACT US</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-[#373737] hover:bg-[#252525] text-white p-4 rounded-2xl transition-all border border-gray-800">
              <h4 className="text-lg font-bold">PHONE</h4>
            </button>
            <button className="bg-[#373737] hover:bg-[#252525] text-white p-4 rounded-2xl transition-all border border-gray-800">
              <h4 className="text-lg font-bold">EMAIL</h4>
            </button>
            <button className="bg-[#373737] hover:bg-[#252525] text-white p-4 rounded-2xl transition-all border border-gray-800">
              <h4 className="text-lg font-bold">WHATSAPP</h4>
            </button>
            <button className="bg-[#373737] hover:bg-[#252525] text-white p-4 rounded-2xl transition-all border border-gray-800">
              <h4 className="text-lg font-bold">TELEGRAM</h4>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default Dashboard 