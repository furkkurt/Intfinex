'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import AdminEmailUpdate from '@/components/AdminEmailUpdate'
import AdminPhoneUpdate from '@/components/AdminPhoneUpdate'

export default function UserDetailPage() {
  const params = useParams()
  const userId = params?.id as string
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/admin/get-user?id=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        } else {
          console.error('Failed to fetch user data')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [userId])
  
  if (loading) {
    return <div>Loading user data...</div>
  }
  
  if (!userData) {
    return <div>User not found</div>
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Details: {userData.fullName || 'N/A'}</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Update Email</h2>
        <AdminEmailUpdate 
          userId={userId} 
          currentEmail={userData.email} 
          onSuccess={() => {
            // Refresh data
            window.location.reload()
          }}
        />
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Update Phone Number</h2>
        <AdminPhoneUpdate 
          userId={userId} 
          currentPhone={userData.phoneNumber} 
          onSuccess={() => {
            // Refresh data
            window.location.reload()
          }}
        />
      </div>
      
      {/* Rest of your admin user detail page */}
    </div>
  )
} 