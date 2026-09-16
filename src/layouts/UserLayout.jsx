import { Outlet, useNavigate } from 'react-router-dom'
import './layouts.css'
import Brand from '../components/Brand'
import ThemeToggle from '../components/ThemeToggle'
import { useUserAuth } from '../hooks/useUserAuth'

export default function UserLayout() {
  const { session, logout } = useUserAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <Brand size="sm" />
        <div className="app-topbar__right">
          {session && <span className="app-topbar__its">ITS {session.its}</span>}
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
