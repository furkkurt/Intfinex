'use client'
import { useState, useEffect, FormEvent } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getFirestore, doc, collection, updateDoc, getDoc } from 'firebase/firestore'
import { auth } from '@/firebase/config'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  userId: number
  fullName: string
  email: string
  phoneNumber: string
  accountStatus: string
  uniqueId: string
  accountAgent: string
  dateOfBirth: string
  products: string
  registrationDate: string
  documents: string
  securityLevel: string
  nationality: string
  [key: string]: any // For other fields
}

const ADMIN_PASSWORD = '123456' // Simple hardcoded password

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<User & { password: string }>>({})
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  
  // New state variables
  const [verificationEnabled, setVerificationEnabled] = useState(true)
  const [isTogglingVerification, setIsTogglingVerification] = useState(false)
  
  // Add these missing state variables
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  
  const db = getFirestore();
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  // If the user has previously authenticated in this session, check local storage
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  // Add this function to handle the SMS verification toggle
  const toggleVerification = async () => {
    try {
      setIsTogglingVerification(true)
      console.log("Toggling verification to:", !verificationEnabled)
      
      const response = await fetch('/api/admin/toggle-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !verificationEnabled }),
      })
      
      const data = await response.json()
      console.log("Toggle response:", data)
      
      if (!response.ok) {
        throw new Error('Failed to toggle verification')
      }
      
      // Don't check directly from Firestore - it will cause permission errors
      // Instead, use our API to check the status
      const statusResponse = await fetch('/api/admin/get-verification-status')
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        console.log("Settings after toggle (from API):", statusData)
        setVerificationEnabled(statusData.enabled)
      } else {
        // Still update the UI state based on what we expect
        setVerificationEnabled(!verificationEnabled)
      }
    } catch (error) {
      console.error('Error toggling verification:', error)
      setError('Failed to toggle verification')
    } finally {
      setIsTogglingVerification(false)
    }
  }

  // Add this after component initialization to fetch the current status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await fetch('/api/admin/get-verification-status')
        if (response.ok) {
          const data = await response.json()
          setVerificationEnabled(data.enabled)
        }
      } catch (error) {
        console.error('Error fetching verification status:', error)
      }
    }
    
    if (isAuthenticated) {
      fetchVerificationStatus()
    }
  }, [isAuthenticated])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/get-users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      console.log('Fetched users:', data.users) // Debug log
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyUser = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'PREMIUM' ? 'BASIC' : 'PREMIUM';
      
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          updates: { accountStatus: newStatus }
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update user verification status')
      }
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, accountStatus: newStatus } : user
      ))
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user verification status')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete user')
      }
      
      // Remove user from the local state
      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Failed to delete user')
    }
  }

  const openEditModal = (user: User) => {
    console.log('Opening edit modal for user:', user)
    setEditingUser(user)
    // Reset password status messages
    setPasswordSuccess('')
    setPasswordError('')
    
    // Ensure all fields are initialized
    setEditFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      accountAgent: user.accountAgent || 'N/A',
      dateOfBirth: user.dateOfBirth || 'N/A',
      products: user.products || 'Information',
      nationality: user.nationality || 'N/A',
      documents: user.documents || 'N/A',
      securityLevel: user.securityLevel || 'Password',
      userId: user.userId || 10000,
      registrationDate: user.registrationDate || new Date().toISOString().split('T')[0],
      accountStatus: user.accountStatus || 'BASIC',
      uniqueId: user.uniqueId || 'N/A',
      password: '' // Add empty password field
    })
    setShowEditModal(true)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess('')
    
    // Add null check to prevent errors
    if (!editingUser) {
      setIsSubmitting(false)
      return
    }
    
    try {
      // Check if email is being updated
      if (editFormData.email !== editingUser.email) {
        // If email is being changed, use the dedicated email update endpoint
        const emailUpdateResponse = await fetch('/api/admin/update-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uid: editingUser.id,
            newEmail: editFormData.email,
          }),
        });
        
        const emailUpdateData = await emailUpdateResponse.json();
        
        if (!emailUpdateData.success) {
          throw new Error(emailUpdateData.error || 'Failed to update email');
        }
        
        console.log('Email updated successfully via dedicated endpoint');
      }
      
      // Handle password update if provided
      if (editFormData.password && editFormData.password.length >= 6) {
        // Call the password reset API
        const passwordUpdateResponse = await fetch('/api/admin/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uid: editingUser.id,
            newPassword: editFormData.password
          }),
        });
        
        if (!passwordUpdateResponse.ok) {
          const passwordData = await passwordUpdateResponse.json();
          setPasswordError(passwordData.error || 'Failed to update password');
          setIsSubmitting(false);
          return;
        }
        
        setPasswordSuccess('Password updated successfully');
      }
      
      // Use the API to update user data
      const userUpdateResponse = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: editingUser.id,
          updates: editFormData
        }),
      });
      
      if (!userUpdateResponse.ok) {
        const errorData = await userUpdateResponse.json();
        throw new Error(errorData.error || 'Failed to update user data');
      }
      
      setSuccess('User updated successfully');
      setShowEditModal(false);
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setAuthError('')
      localStorage.setItem('adminAuth', 'true')
    } else {
      setAuthError('Invalid password')
    }
  }
  
  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminAuth')
  }

  // Add this new function after handleLogin and before handleEditInputChange
  const handleTestEmail = async () => {
    try {
      setError('') // Clear any previous errors
      
      // Call the test email API
      const response = await fetch('/api/auth/test-email')
      const data = await response.json()
      
      if (data.success) {
        alert(`Test email sent successfully! Message ID: ${data.messageId}`)
      } else {
        setError(`Failed to send test email: ${data.error}`)
      }
    } catch (err) {
      console.error('Error sending test email:', err)
      setError('Failed to send test email')
    }
  }

  // Add this new function after handleTestEmail
  const handleTestSMS = async () => {
    try {
      setError('') // Clear any previous errors
      
      // Get a phone number
      const phoneNumber = prompt('Enter phone number with country code (e.g. +1234567890):');
      if (!phoneNumber) return;
      
      // Call the test SMS API
      const response = await fetch(`/api/auth/test-sms?phone=${encodeURIComponent(phoneNumber)}`)
      const data = await response.json()
      
      if (data.success) {
        alert(`Test SMS sent successfully! Message SID: ${data.messageSid}`)
      } else {
        setError(`Failed to send test SMS: ${data.error}`)
      }
    } catch (err) {
      console.error('Error sending test SMS:', err)
      setError('Failed to send test SMS')
    }
  }

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  // Instead of directly returning the admin panel, now we check auth first
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="max-w-md mx-auto mt-20 p-6 bg-[#111] rounded-lg">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white"
                required
              />
            </div>
            {authError && (
              <p className="text-red-500 text-sm mb-4">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-[#00ffd5] hover:bg-[#00e6c0] text-black font-semibold py-2 px-4 rounded"
            >
              Login
            </button>
          </form>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 mb-6 rounded-lg">
            {error}
          </div>
        )}
        
        <button 
          onClick={fetchUsers}
          className="mb-4 px-4 py-2 bg-[#00ffd5] text-black rounded-lg hover:bg-[#00e6c0]"
        >
          Refresh Users
        </button>
        
        <div className="flex items-center justify-between mb-6 bg-[#222] p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-white mr-4">Verification:</span>
            <button
              onClick={toggleVerification}
              disabled={isTogglingVerification}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ffd5] focus:ring-offset-2 ${
                verificationEnabled ? 'bg-[#00ffd5]' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  verificationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="text-sm text-gray-400">
            {verificationEnabled 
              ? 'Verification is enabled - users will receive SMS and email verification' 
              : 'Verification is disabled - SMS and email verification will be skipped'}
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              
              <div className="flex gap-4">
                <button
                  onClick={toggleVerification}
                  disabled={isTogglingVerification}
                  className={`px-4 py-2 rounded-lg ${
                    verificationEnabled ? 'bg-green-600' : 'bg-red-600'
                  } text-white`}
                >
                  {isTogglingVerification ? 'Updating...' : 
                   verificationEnabled ? 'Verification Enabled' : 'Verification Disabled'}
                </button>
                
                <button
                  onClick={handleTestEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Test Email
                </button>
                
                <button
                  onClick={handleTestSMS}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Send Test SMS
                </button>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="text-white">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-white">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#111] rounded-xl overflow-hidden">
              <thead className="bg-[#222]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Unique ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.userId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {user.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.registrationDate || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.accountStatus === 'PREMIUM' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.accountStatus === 'PREMIUM' ? 'Premium' : 'Basic'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.uniqueId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Edit User: {editingUser.fullName || 'N/A'}</h2>
            
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name/Organization Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={editFormData.fullName || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    User ID
                  </label>
                  <input
                    type="number"
                    name="userId"
                    value={editFormData.userId || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Registration Date
                  </label>
                  <input
                    type="text"
                    name="registrationDate"
                    value={editFormData.registrationDate || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editFormData.phoneNumber || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Account Agent
                  </label>
                  <input
                    type="text"
                    name="accountAgent"
                    value={editFormData.accountAgent || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    name="dateOfBirth"
                    value={editFormData.dateOfBirth || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Products
                  </label>
                  <input
                    type="text"
                    name="products"
                    value={editFormData.products || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={editFormData.nationality || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Documents
                  </label>
                  <input
                    type="text"
                    name="documents"
                    value={editFormData.documents || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Security Level
                  </label>
                  <input
                    type="text"
                    name="securityLevel"
                    value={editFormData.securityLevel || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Account Status
                  </label>
                  <select
                    name="accountStatus"
                    value={editFormData.accountStatus || 'BASIC'}
                    onChange={(e) => setEditFormData({...editFormData, accountStatus: e.target.value})}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  >
                    <option value="BASIC">Basic</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Unique ID
                  </label>
                  <input
                    type="text"
                    name="uniqueId"
                    value={editFormData.uniqueId || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password (leave empty to keep current)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editFormData.password || ''}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Must be at least 6 characters long
                  </p>
                  {passwordError && (
                    <div className="text-red-500 text-sm mt-1">{passwordError}</div>
                  )}
                  {passwordSuccess && (
                    <div className="text-green-500 text-sm mt-1">{passwordSuccess}</div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00ffd5] text-black rounded-lg hover:bg-[#00e6c0]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  )
}