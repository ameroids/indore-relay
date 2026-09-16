import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUserAuth } from '../hooks/useUserAuth'

export default function ProtectedRoute() {
  const { isAuthenticated } = useUserAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
