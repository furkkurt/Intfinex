'use client'
import { useState } from 'react'

interface AdminPhoneUpdateProps {
  userId: string
  currentPhone: string
  onSuccess?: () => void
}

export default function AdminPhoneUpdate({ userId, currentPhone, onSuccess }: AdminPhoneUpdateProps) {
  const [newPhone, setNewPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      const response = await fetch('/api/admin/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: userId,
          newPhoneNumber: newPhone
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        if (onSuccess) onSuccess()
      } else {
        setError(data.error || 'Failed to update phone number')
      }
    } catch (err) {
      setError('An error occurred')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleUpdatePhone}>
        <div className="mb-4">
          <label htmlFor="currentPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Current Phone Number
          </label>
          <input
            type="text"
            id="currentPhone"
            value={currentPhone || 'Not set'}
            disabled
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="newPhone" className="block text-sm font-medium text-gray-700 mb-1">
            New Phone Number
          </label>
          <input
            type="tel"
            id="newPhone"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            placeholder="+12345678900"
          />
        </div>
        
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">Phone number updated successfully!</div>}
        
        <button
          type="submit"
          disabled={isLoading || !newPhone}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update Phone Number'}
        </button>
      </form>
    </div>
  )
} 