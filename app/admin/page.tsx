'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getFirestore, doc, collection, updateDoc, getDoc } from 'firebase/firestore'
import { auth } from '@/firebase/config'

interface User {
  id: string
  userId: number
  fullName: string
  email: string
  phoneNumber: string
  verified: boolean
  accountAgent: string
  dateOfBirth: string
  products: string
  registrationDate: string
  documents: string
  securityLevel: string
  nationality: string
  [key: string]: any // For other fields
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<User>>({})
  
  const db = getFirestore();

  useEffect(() => {
    fetchUsers()
  }, [])

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

  const handleVerifyUser = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          updates: { verified: !currentStatus } 
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update user verification status')
      }
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, verified: !currentStatus } : user
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
    console.log('Opening edit modal for user:', user) // Debug log
    setEditingUser(user)
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
      verified: user.verified === undefined ? false : user.verified
    })
    setShowEditModal(true)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser) return
    
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: editingUser.id, 
          updates: editFormData 
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update user')
      }
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === editingUser.id ? { ...user, ...editFormData } : user
      ))
      
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user')
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>
        
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
                      {user.verified ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-green-900/30 text-green-500 rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold bg-red-900/30 text-red-500 rounded-full">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                      <button
                        onClick={() => handleVerifyUser(user.id, user.verified)}
                        className={`px-3 py-1 rounded-full text-xs ${
                          user.verified
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                            : 'bg-[#00ffd5] hover:bg-[#00e6c0] text-black'
                        }`}
                      >
                        {user.verified ? 'Unverify' : 'Verify'}
                      </button>
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
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
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
                    Verified
                  </label>
                  <select
                    name="verified"
                    value={editFormData.verified ? 'true' : 'false'}
                    onChange={(e) => setEditFormData({...editFormData, verified: e.target.value === 'true'})}
                    className="w-full bg-[#222] border-gray-700 rounded-lg shadow-sm focus:ring-[#00ffd5] focus:border-[#00ffd5] text-white px-3 py-2"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
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