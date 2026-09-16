import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './AuthPage.css'
import Brand from '../components/Brand'
import Alert from '../components/Alert'
import ThemeToggle from '../components/ThemeToggle'
import { useAdminAuth } from '../hooks/useAdminAuth'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAdminAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await login(username, password)
      navigate('/admin/dashboard', { replace: true })
    } catch {
      // error surfaced via context
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__toggle">
        <ThemeToggle />
      </div>
      <div className="auth-page__arches" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className="auth-page__arch" />
        ))}
      </div>

      <div className="auth-card">
        <Brand size="lg" />
        <p className="auth-card__tagline">Administrator sign-in</p>

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          <label className="auth-card__field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (error) clearError()
              }}
              autoComplete="username"
              autoFocus
              required
            />
          </label>
          <label className="auth-card__field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) clearError()
              }}
              autoComplete="current-password"
              required
            />
          </label>

          <Alert tone="error">{error}</Alert>

          <button type="submit" className="auth-card__submit" disabled={loading}>
            {loading ? <span className="auth-card__spinner" aria-hidden="true" /> : null}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <Link className="auth-page__admin-link" to="/login">
        User access
      </Link>
    </div>
  )
}
