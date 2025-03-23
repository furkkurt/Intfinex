'use client'
import { useState, useEffect } from 'react'
import { auth } from '@/firebase/config'
import { getFirestore, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore'
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
  accountStatus: string
  uniqueId: string
}

function Dashboard() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const { isVerified, isLoading } = useVerificationStatus()
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false)
  const [passwordResetError, setPasswordResetError] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const checkForPendingFix = async () => {
      const needsFixUid = localStorage.getItem('needsVerificationFix')
      
      if (needsFixUid) {
        console.log('Found pending verification fix in localStorage for:', needsFixUid)
        alert('Found pending verification fix - applying now')
        
        try {
          // Make the API call from the dashboard
          const response = await fetch('/api/auth/emergency-fix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: needsFixUid,
              source: 'dashboard'
            })
          })
          
          console.log('Dashboard emergency fix response:', response.ok)
          
          // Clear the localStorage item only if successful
          if (response.ok) {
            localStorage.removeItem('needsVerificationFix')
            alert('Verification fix complete!')
          }
        } catch (error) {
          console.error('Dashboard fix error:', error)
        }
      }
    }
    
    // Run immediately
    checkForPendingFix()
  }, [])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const verificationDoc = doc(db, 'users', user.uid)
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
              phoneNumber: data.phoneNumber || 'N/A',
              registrationDate: data.registrationDate,
              documents: data.documents,
              securityLevel: data.securityLevel,
              nationality: data.nationality,
              accountStatus: data.accountStatus,
              uniqueId: data.uniqueId || 'N/A'
            })
          }
        })

        return () => unsubscribeDoc()
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const monitorVerificationStatus = async () => {
      const user = auth.currentUser
      if (user) {
        try {
          const db = getFirestore()
          const userDocRef = doc(db, 'users', user.uid)
          
          // Check current verification status
          const docSnap = await getDoc(userDocRef)
          
          if (docSnap.exists()) {
            console.log('User verification status on dashboard load:', {
              verified: docSnap.data().verified,
              initiallySetTo: docSnap.data()._initiallySetTo || null,
              uid: user.uid
            })
          }
        } catch (error) {
          console.error('Error checking verification status:', error)
        }
      }
    }
    
    monitorVerificationStatus()
  }, [])

  useEffect(() => {
    const fixNewUserVerificationStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) return;
        
        const userData = docSnap.data();
        
        // Check if this is a new registration (within last 60 seconds)
        const registrationDate = userData.registrationDate;
        const today = new Date().toISOString().split('T')[0];
        
        const isNewRegistration = registrationDate === today;
        
        // Get the timestamp if available
        const createdAt = userData._createdAt?.toDate();
        const now = new Date();
        const isWithinTimeWindow = createdAt && 
          (now.getTime() - createdAt.getTime() < 60000); // 60 seconds
        
        // Either it was registered today and has no timestamp,
        // or it was registered within the time window
        if (isNewRegistration && (!createdAt || isWithinTimeWindow)) {
          console.log('New user detected - fixing verification status...');
          
          // Direct update through Firestore (client-side)
          try {
            await updateDoc(userDocRef, {
              verified: false,
              _fixedAt: new Date().toISOString(),
              _fixSource: 'dashboard-detection'
            });
            console.log('Successfully set verified to false');
          } catch (firestoreError) {
            console.error('Firestore update failed, trying API...', firestoreError);
            
            // Backup approach: API call
            const response = await fetch('/api/admin/force-set-unverified', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uid: user.uid })
            });
            
            if (response.ok) {
              console.log('API fix successful');
            } else {
              console.error('API fix failed');
            }
          }
        }
      } catch (error) {
        console.error('Error fixing verification status:', error);
      }
    };
    
    // Execute immediately
    fixNewUserVerificationStatus();
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      // Add validation feedback if needed
      return;
    }
    
    try {
      const response = await fetch('/api/support/submit-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: ticketSubject,
          message: ticketMessage,
          userEmail: userDetails?.email,
          userName: userDetails?.displayName,
          userId: auth.currentUser?.uid
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Your support ticket has been submitted. We will get back to you soon.');
        setTicketSubject('');
        setTicketMessage('');
        setShowTicketModal(false);
      } else {
        alert('Failed to submit support ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('An error occurred while submitting your ticket. Please try again.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    
    try {
      setIsResettingPassword(true)
      setPasswordError('')
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          uid: auth.currentUser?.uid,
          newPassword 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setPasswordResetSuccess(true)
      setShowPasswordModal(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="max-w-6xl mx-auto px-4 py-12">

            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-[#00ffd5] text-black rounded-lg hover:bg-[#00e6c0]"
            >
              Change Password
            </button>
            {passwordResetSuccess && (
              <p className="text-green-500 mt-2">Password changed successfully!</p>
            )}
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
                <div>
                  <p className="text-gray-400">Account Status</p>
                  <p className={`text-white text-lg ${userDetails.accountStatus === 'PREMIUM' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {userDetails.accountStatus === 'PREMIUM' ? 'Premium' : 'Basic'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">ID Number</p>
                  <p className="text-white text-lg">{userDetails.uniqueId}</p>
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:ring-[#00ffd5] focus:border-[#00ffd5]"
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:ring-[#00ffd5] focus:border-[#00ffd5]"
                  required
                />
              </div>
              
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-white hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="px-4 py-2 bg-[#00ffd5] text-black rounded-lg hover:bg-[#00e6c0] disabled:opacity-50"
                >
                  {isResettingPassword ? 'Changing...' : 'Change Password'}
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