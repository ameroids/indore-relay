import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { sessionService } from '../services/sessionService'

const UserAuthContext = createContext(null)

export function UserAuthProvider({ children }) {
  const [session, setSession] = useState(() => sessionService.getSession())
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (itsNumber) => {
    setLoading(true)
    setError(null)
    try {
      const newSession = await sessionService.login(itsNumber)
      setSession(newSession)
      return newSession
    } catch (err) {
      setError(err.message || 'Unable to log in.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await sessionService.logout()
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

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext)
  if (!ctx) throw new Error('useUserAuth must be used within a UserAuthProvider')
  return ctx
}
