import React, { useEffect, useState, createContext, useContext } from 'react'
export interface User {
  id: string
  username: string
  email: string
  role: 'user' | 'admin'
}
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const AuthProvider: React.FC<{
  children: ReactNode
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Check local storage for existing session on mount
    const storedUser = localStorage.getItem('gamecritiq_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('gamecritiq_user')
      }
    }
    setLoading(false)
  }, [])
  const login = async (email: string, password: string) => {
    setLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    let loggedInUser: User
    // Mock authentication logic
    if (email === 'admin@test.com') {
      loggedInUser = {
        id: '0',
        username: 'Admin',
        email,
        role: 'admin'
      }
    } else {
      // Accept any other email with a generic user profile for demo purposes
      loggedInUser = {
        id: '1',
        username: email.split('@')[0] || 'GamerPro',
        email,
        role: 'user'
      }
    }
    setUser(loggedInUser)
    localStorage.setItem('gamecritiq_user', JSON.stringify(loggedInUser))
    setLoading(false)
  }
  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    setLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      role: 'user'
    }
    setUser(newUser)
    localStorage.setItem('gamecritiq_user', JSON.stringify(newUser))
    setLoading(false)
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem('gamecritiq_user')
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
