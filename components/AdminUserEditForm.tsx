'use client'
import { useState, FormEvent } from 'react'

interface User {
  id: string
  fullName?: string
  email?: string
  phoneNumber?: string
  userId?: string
  registrationDate?: string
  accountAgent?: string
  dateOfBirth?: string
  products?: string
  nationality?: string
  documents?: string
  securityLevel?: string
  accountStatus?: string
  uniqueId?: string
  [key: string]: any
}

interface AdminUserEditFormProps {
  user: User
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AdminUserEditForm({ user, onSuccess, onCancel }: AdminUserEditFormProps) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    userId: user.userId || '',
    accountAgent: user.accountAgent || '',
    dateOfBirth: user.dateOfBirth || '',
    products: user.products || '',
    nationality: user.nationality || '',
    documents: user.documents || '',
    securityLevel: user.securityLevel || '',
    accountStatus: user.accountStatus || ''
    // Add any other fields you need to edit
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      // Use server-side API for admin operations 
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: user.id,
          updates: formData
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        if (onSuccess) onSuccess()
      } else {
        setError(data.error || 'Failed to update user')
      }
    } catch (err) {
      setError('An error occurred while updating the user')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Create form fields for each property */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium">Full Name</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md"
        />
      </div>
      
      {/* Add more form fields for all properties */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md"
        />
      </div>
      
      {/* Error and success messages */}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-500 text-sm">User updated successfully!</div>}
      
      {/* Form buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
} 