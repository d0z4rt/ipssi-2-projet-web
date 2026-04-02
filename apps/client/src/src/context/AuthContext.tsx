import React, { createContext, useContext, useEffect, useState } from 'react'

import { authService, type AuthUser } from '../services/api'

export interface User extends AuthUser {}
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    username: string,
    email: string,
    password: string,
    isCurator: boolean
  ) => Promise<void>
  logout: () => void
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const AuthProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = authService.getSession()

    // Keep auth state consistent: a user without token is treated as logged out.
    if (session.user && session.token) {
      setUser(session.user)
    } else if (session.user || session.token) {
      authService.clearSession()
      setUser(null)
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const session = await authService.login({
        mail: email,
        password
      })
      authService.saveSession(session)
      setUser(session.user)
    } catch (error) {
      throw normalizeAuthError(error)
    } finally {
      setLoading(false)
    }
  }
  const register = async (
    username: string,
    email: string,
    password: string,
    isCurator: boolean
  ) => {
    setLoading(true)
    try {
      const session = await authService.register({
        username,
        mail: email,
        password,
        is_curator: isCurator
      })
      authService.saveSession(session)
      setUser(session.user)
    } catch (error) {
      throw normalizeAuthError(error)
    } finally {
      setLoading(false)
    }
  }
  const logout = () => {
    authService.clearSession()
    setUser(null)
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

const normalizeAuthError = (error: unknown) => {
  if (error instanceof Error) {
    return new Error(error.message)
  }

  return new Error('Authentication failed')
}
