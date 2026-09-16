import './ThemeToggle.css'
import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          {isDark ? (
            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 3a9 9 0 1 0 8.94 10.2A7 7 0 0 1 12 3Z"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
              <circle cx="12" cy="12" r="4.2" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6" />
              </g>
            </svg>
          )}
        </span>
      </span>
    </button>
  )
}
