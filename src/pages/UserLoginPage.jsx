import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './AuthPage.css'
import Brand from '../components/Brand'
import ITSInput from '../components/ITSInput'
import Alert from '../components/Alert'
import ThemeToggle from '../components/ThemeToggle'
import { validateITS } from '../utils/validators'
import { useUserAuth } from '../hooks/useUserAuth'
import { APP_TAGLINE } from '../config/appConfig'

export default function UserLoginPage() {
  const [its, setIts] = useState('')
  const [formError, setFormError] = useState(null)
  const { login, loading, error, clearError } = useUserAuth()
  const navigate = useNavigate()

  const handleChange = (value) => {
    setIts(value)
    if (formError) setFormError(null)
    if (error) clearError()
  }

  const handleSubmit = async (event, force = false) => {
    if (event) event.preventDefault()
    const result = validateITS(its)
    if (!result.valid) {
      setFormError(result.error)
      return
    }
    try {
      await login(result.value, force)
      navigate('/dashboard', { replace: true })
    } catch {
      // error surfaced via context
    }
  }

  const isAlreadyActiveError = error && error.includes('already logged in on another device')

  const message = formError || error

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
        <p className="auth-card__tagline">{APP_TAGLINE}</p>

        <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
          <ITSInput value={its} onChange={handleChange} autoFocus error={message} />
          <Alert tone="error">{message}</Alert>

          <button type="submit" className="auth-card__submit" disabled={loading}>
            {loading ? <span className="auth-card__spinner" aria-hidden="true" /> : null}
            {loading ? 'Verifying…' : 'Log in'}
          </button>
          
          {isAlreadyActiveError && (
            <button 
              type="button" 
              className="auth-card__submit" 
              style={{ background: 'var(--status-danger-text)', color: '#2a0d09', marginTop: '0.5rem' }}
              onClick={() => handleSubmit(null, true)}
              disabled={loading}
            >
              Disconnect other device & Log in
            </button>
          )}
        </form>

        <p className="auth-card__footnote">
          Access is granted only to ITS numbers authorized by the administrator.
        </p>
      </div>

      <Link className="auth-page__admin-link" to="/admin/login">
        Admin access
      </Link>
    </div>
  )
}
