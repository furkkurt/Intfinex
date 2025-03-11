'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface UserContextType {
  user: User | null
  loading: boolean
  signOut: () => void
}

interface User {
  phoneNumber: string | null
  displayName: string | null
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  signOut: () => {}
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check local storage for user data
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signOut = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, loading, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}