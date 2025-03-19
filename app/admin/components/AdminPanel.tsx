'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState(null)
  const [formData, setFormData] = useState({})
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/get-users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
        console.log('Fetched users:', data)
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditUser = (user) => {
    console.log('Opening edit modal for user:', user)
    setEditUser(user)
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      accountAgent: user.accountAgent || '',
      dateOfBirth: user.dateOfBirth || '',
      products: user.products || '',
      nationality: user.nationality || '',
      documents: user.documents || '',
      securityLevel: user.securityLevel || '',
      accountStatus: user.accountStatus || ''
    })
    setFormError('')
    setFormSuccess(false)
  }

  const handleEditFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess(false)
    
    try {
      // Use a server API endpoint instead of direct Firestore operation
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: editUser.id,
          updates: formData
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setFormSuccess(true)
        fetchUsers() // Refresh the user list
        setTimeout(() => {
          setEditUser(null)
        }, 1500)
      } else {
        setFormError(data.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setFormError('An error occurred while updating user')
    }
  }

  const handleViewUserDetails = (userId) => {
    router.push(`/admin/users/${userId}`)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* User List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Users</h2>
          <button
            onClick={fetchUsers}
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
          >
            Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="p-4">Loading users...</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map(user => (
              <li key={user.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.fullName || 'No Name'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">ID: {user.userId || user.id}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleViewUserDetails(user.id)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit User: {editUser.fullName}</h2>
            
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Agent</label>
                <input
                  type="text"
                  name="accountAgent"
                  value={formData.accountAgent}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                <select
                  name="accountStatus"
                  value={formData.accountStatus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              {formSuccess && <div className="text-green-500 text-sm">User updated successfully!</div>}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 