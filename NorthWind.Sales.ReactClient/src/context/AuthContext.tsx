import React, { createContext, useContext, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { login as loginService, logout as logoutService } from '../services/authService'

interface AuthContextType {
  user: string | null
  userName: string | null
  token: string | null
  isAuthenticated: boolean
  login: (user: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('user'))
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('userName'))

  const login = async (username: string, password: string) => {
    const response = await loginService(username, password)
    const storedToken = localStorage.getItem('token') || response.token || response.accessToken || ''
    const storedUser = localStorage.getItem('user') || username
    const storedUserName = localStorage.getItem('userName')

    setToken(storedToken)
    setUser(storedUser)
    setUserName(storedUserName)
  }

  const logout = () => {
    logoutService()
    setToken(null)
    setUser(null)
    setUserName(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userName,
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : null
}
