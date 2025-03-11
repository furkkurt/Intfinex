'use client'
import { useState, useEffect } from 'react'
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface User {
  id: string
  userId: number
  displayName?: string
  email?: string
  phoneNumber?: string
  verified: boolean
  registrationDate: string
  products: string
  securityLevel: string
  documents: string
  accountAgent: string
  dateOfBirth: string
  nationality: string
  editing?: boolean
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<Partial<User>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === '123456') {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Invalid password')
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    try {
      console.log('Fetching users...')
      const q = query(collection(db, 'verification'))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('Got snapshot:', snapshot.size, 'documents')
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as User[]
        
        setUsers(usersData)
        setLoading(false)
      }, (error) => {
        console.error('Detailed snapshot error:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        })
        setError('Failed to fetch users')
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Setup error:', error)
      setError('Failed to set up user listener')
      setLoading(false)
    }
  }, [isAuthenticated])

  const handleVerifyUser = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, verified: !currentStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update verification status')
      }
    } catch (error) {
      console.error('Error updating verification status:', error)
      alert('Failed to update verification status')
    }
  }

  const handleEdit = (userId: string) => {
    const userToEdit = users.find(user => user.id === userId)
    if (!userToEdit) return

    setEditingUser({
      id: userToEdit.id,
      displayName: userToEdit.displayName || '',
      email: userToEdit.email || '',
      phoneNumber: userToEdit.phoneNumber || '',
      accountAgent: userToEdit.accountAgent || '',
      dateOfBirth: userToEdit.dateOfBirth || '',
      nationality: userToEdit.nationality || '',
      documents: userToEdit.documents || '',
      products: userToEdit.products || '',
      securityLevel: userToEdit.securityLevel || '',
    })

    setUsers(users.map(user => ({
      ...user,
      editing: user.id === userId
    })))
  }

  const handleSave = async (userId: string) => {
    try {
      const updates = {
        ...(editingUser.userId && { userId: editingUser.userId }),
        ...(editingUser.registrationDate && { registrationDate: editingUser.registrationDate }),
        ...(editingUser.displayName && { displayName: editingUser.displayName }),
        ...(editingUser.email && { email: editingUser.email }),
        ...(editingUser.phoneNumber && { phoneNumber: editingUser.phoneNumber }),
        ...(editingUser.accountAgent && { accountAgent: editingUser.accountAgent }),
        ...(editingUser.dateOfBirth && { dateOfBirth: editingUser.dateOfBirth }),
        ...(editingUser.nationality && { nationality: editingUser.nationality }),
        ...(editingUser.documents && { documents: editingUser.documents }),
        ...(editingUser.products && { products: editingUser.products }),
        ...(editingUser.securityLevel && { securityLevel: editingUser.securityLevel }),
      }

      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update user')
      }

      setUsers(users.map(user => ({
        ...user,
        ...(user.id === userId ? { ...user, ...updates } : {}),
        editing: false
      })))

      setEditingUser({})
    } catch (error) {
      console.error('Error updating user:', error)
      alert(error instanceof Error ? error.message : 'Failed to update user')
    }
  }

  const handleCancel = (userId: string) => {
    setUsers(users.map(user => ({
      ...user,
      editing: false
    })))
    setEditingUser({})
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      // The user will be automatically removed from the list due to our Firestore listener
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full bg-[#111] rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
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
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#00ffd5] text-black rounded-full hover:bg-[#00e6c0] transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">User Management</h1>
        
        {loading && (
          <div className="text-white">Loading users...</div>
        )}

        {error && (
          <div className="text-red-500 bg-red-500/10 border border-red-500 rounded p-4 mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-[#111] rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#1E1E1E]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-sm text-gray-300">{user.userId}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{user.displayName}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{user.phoneNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{user.products}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.verified ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {user.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="text-[#00ffd5] hover:text-[#00e6c0] mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleVerifyUser(user.id, user.verified)}
                        className={`${
                          user.verified 
                            ? 'text-yellow-500 hover:text-yellow-400' 
                            : 'text-green-500 hover:text-green-400'
                        } mr-3`}
                      >
                        {user.verified ? 'Unverify' : 'Verify'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-400"
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

        {/* Edit Modal */}
        {users.find(u => u.editing) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="relative bg-[#111] rounded-3xl p-8 max-w-md w-full my-8">
              <h2 className="text-xl font-bold text-white mb-6">Edit User Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    User ID
                  </label>
                  <input
                    type="number"
                    value={editingUser.userId || ''}
                    onChange={(e) => setEditingUser({...editingUser, userId: parseInt(e.target.value)})}
                    className="w-full bg-[#222] text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Registration Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editingUser.registrationDate ? new Date(editingUser.registrationDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingUser({...editingUser, registrationDate: new Date(e.target.value).toISOString()})}
                    className="w-full bg-[#222] text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Personal Name / Company Name
                  </label>
                  <input
                    type="text"
                    value={editingUser.displayName || ''}
                    onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                    className="w-full bg-[#222] text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full bg-[#222] text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Account Agent
                  </label>
                  <input
                    type="text"
                    value={editingUser.accountAgent || ''}
                    onChange={(e) => setEditingUser({...editingUser, accountAgent: e.target.value})}
                    className="w-full bg-[#222] text-white px-3 py-2 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date of Birth / Incorporate
                  </label>
                  <input
                    type="date"
                    value={editingUser.dateOfBirth ? new Date(editingUser.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingUser({
                      ...editingUser, 
                      dateOfBirth: e.target.value ? new Date(e.target.value).toISOString() : ''
                    })}
                    className="w-full bg-[#222] text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Products
                  </label>
                  <input
                    type="text"
                    value={editingUser.products || ''}
                    onChange={(e) => setEditingUser({...editingUser, products: e.target.value})}
                    className="w-full bg-[#222] text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nationality / Based
                  </label>
                  <input
                    type="text"
                    value={editingUser.nationality || ''}
                    onChange={(e) => setEditingUser({...editingUser, nationality: e.target.value})}
                    className="w-full bg-[#222] text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Security Level
                  </label>
                  <input
                    type="text"
                    value={editingUser.securityLevel || ''}
                    onChange={(e) => setEditingUser({...editingUser, securityLevel: e.target.value})}
                    className="w-full bg-[#222] text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Documents
                  </label>
                  <input
                    type="text"
                    value={editingUser.documents || ''}
                    onChange={(e) => setEditingUser({...editingUser, documents: e.target.value})}
                    className="w-full bg-[#222] text-white px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editingUser.phoneNumber || ''}
                    onChange={(e) => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                    className="w-full bg-[#222] text-white px-3 py-2 rounded"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleCancel(users.find(u => u.editing)?.id!)}
                    className="px-4 py-2 bg-red-500 text-black rounded-full text-sm hover:bg-red-400 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave(users.find(u => u.editing)?.id!)}
                    className="px-4 py-2 bg-green-500 text-black rounded-full text-sm hover:bg-green-400 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}