'use client'
import { useState, useEffect } from 'react'
import { auth } from '@/firebase/config'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'
import AuthenticatedLayout from '../../components/AuthenticatedLayout'
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
  const { isVerified, isLoading } = useVerificationStatus()
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')

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

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    // This will be non-functioning for now, just close the modal
    setShowTicketModal(false)
    setTicketSubject('')
    setTicketMessage('')
    // Show a confirmation message
    alert('Your ticket has been submitted.')
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-[#1E1E1E] rounded-3xl p-8 md:p-12">
            {userDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            <a 
              href="https://form.jotform.com/intfinex/intfinex-application-form" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full bg-[#00ffd5] hover:bg-[#00e6c0] text-black p-6 rounded-3xl transition-all text-xl font-bold block text-center"
            >
              UPGRADE YOUR ACCOUNT
            </a>
            <button 
              onClick={() => setShowTicketModal(true)} 
              className="w-full bg-[#373737] hover:bg-[#252525] text-white p-6 rounded-3xl transition-all text-xl font-bold border border-gray-800"
            >
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
      </div>
      
      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-white mb-4">Open Support Ticket</h2>
            
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:ring-[#00ffd5] focus:border-[#00ffd5]"
                  required
                />
              </div>
              
              <div>
                <textarea
                  placeholder="Describe your issue..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:ring-[#00ffd5] focus:border-[#00ffd5] h-32"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00ffd5] text-black rounded-lg hover:bg-[#00e6c0]"
                >
                  Send Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  )
}

export default Dashboard 