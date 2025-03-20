'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminEmailUpdate from '@/components/AdminEmailUpdate'
import AdminPhoneUpdate from '@/components/AdminPhoneUpdate'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.id as string
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState(false)
  
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    
    fetchUserData()
  }, [userId])
  
  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/get-user?id=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setFormData({
          fullName: data.fullName || '',
          accountAgent: data.accountAgent || '',
          dateOfBirth: data.dateOfBirth || '',
          products: data.products || '',
          nationality: data.nationality || '',
          documents: data.documents || '',
          securityLevel: data.securityLevel || '',
          accountStatus: data.accountStatus || ''
        })
      } else {
        console.error('Failed to fetch user data')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateError('')
    setUpdateSuccess(false)
    
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: userId,
          updates: formData
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }
      
      setUpdateSuccess(true)
      fetchUserData()
    } catch (error) {
      console.error('Error updating user:', error)
      setUpdateError(
        error instanceof Error ? error.message : 'Failed to update user'
      )
    }
  }
  
  if (loading) return <div className="text-center p-8">Loading user data...</div>
  if (!userData) return <div className="text-center p-8">User not found</div>
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Details</h1>
      
      {/* Display user info or edit form */}
      {isEditing ? (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit User Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            {/* Add other form fields for different user properties */}
            <div>
              <label className="block text-sm font-medium">Account Agent</label>
              <input
                type="text"
                name="accountAgent"
                value={formData.accountAgent}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            {/* Error/success messages */}
            {updateError && <div className="text-red-500">{updateError}</div>}
            {updateSuccess && <div className="text-green-500">User updated successfully</div>}
            
            {/* Form buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">User Information</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              Edit Details
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Full Name</p>
              <p>{userData.fullName || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">User ID</p>
              <p>{userData.userId || userData.id}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p>{userData.email || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone Number</p>
              <p>{userData.phoneNumber || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Account Agent</p>
              <p>{userData.accountAgent || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Date of Birth</p>
              <p>{userData.dateOfBirth || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Products</p>
              <p>{userData.products || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Account Status</p>
              <p>{userData.accountStatus || 'Not set'}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Update Email</h2>
        <AdminEmailUpdate 
          userId={userId} 
          currentEmail={userData.email} 
          onSuccess={() => {
            // Refresh data
            fetchUserData()
          }}
        />
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Update Phone Number</h2>
        <AdminPhoneUpdate 
          userId={userId} 
          currentPhone={userData.phoneNumber} 
          onSuccess={() => {
            // Refresh data
            fetchUserData()
          }}
        />
      </div>
    </div>
  )
} 