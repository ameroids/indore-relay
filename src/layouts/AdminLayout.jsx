import { Outlet, useNavigate } from 'react-router-dom'
import './layouts.css'
import Brand from '../components/Brand'
import ThemeToggle from '../components/ThemeToggle'
import { useAdminAuth } from '../hooks/useAdminAuth'

export default function AdminLayout() {
  const { logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-topbar__brand-group">
          <Brand size="sm" />
          <span className="app-topbar__pill">Admin</span>
        </div>
        <div className="app-topbar__right">
          <ThemeToggle />
          <button type="button" className="app-topbar__logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
