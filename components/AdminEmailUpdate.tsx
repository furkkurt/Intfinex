'use client'
import { useState } from 'react'

interface AdminEmailUpdateProps {
  userId: string
  currentEmail: string
  onSuccess?: () => void
}

export default function AdminEmailUpdate({ userId, currentEmail, onSuccess }: AdminEmailUpdateProps) {
  const [newEmail, setNewEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      const response = await fetch('/api/admin/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: userId,
          newEmail
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        setNewEmail('')
        if (onSuccess) onSuccess()
      } else {
        setError(data.error || 'Failed to update email')
      }
    } catch (err) {
      setError('An error occurred while updating email')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleUpdateEmail} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Email</label>
          <div className="mt-1 p-2 bg-gray-100 rounded">{currentEmail}</div>
        </div>
        
        <div>
          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
            New Email
          </label>
          <input
            type="email"
            id="newEmail"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">Email updated successfully!</div>}
        
        <button
          type="submit"
          disabled={isLoading || !newEmail}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update Email'}
        </button>
      </form>
    </div>
  )
} 