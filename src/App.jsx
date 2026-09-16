import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserAuthProvider } from './hooks/useUserAuth'
import { AdminAuthProvider } from './hooks/useAdminAuth'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'
import UserLoginPage from './pages/UserLoginPage'
import UserDashboardPage from './pages/UserDashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <UserAuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<UserLoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<UserLayout />}>
                <Route path="/dashboard" element={<UserDashboardPage />} />
              </Route>
            </Route>

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </UserAuthProvider>
  )
}
