import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { adminAuthService } from '../services/adminAuthService'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(() => adminAuthService.getSession())
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const newSession = await adminAuthService.login(username, password)
      setSession(newSession)
      return newSession
    } catch (err) {
      setError(err.message || 'Unable to log in.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    adminAuthService.logout()
    setSession(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      loading,
      error,
      login,
      logout,
      clearError
    }),
    [session, loading, error, login, logout, clearError]
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  return ctx
}
