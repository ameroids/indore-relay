import { useCallback, useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../utils/storage'

const THEME_KEY = 'theme'

function getPreferredTheme() {
  const stored = readJSON(THEME_KEY, null)
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getPreferredTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    writeJSON(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
