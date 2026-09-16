/**
 * Admin credentials for the frontend-only prototype.
 *
 * IMPORTANT: This is NOT secure. Anyone who opens the built JavaScript
 * bundle can read these values. This file exists only so that the
 * credentials live in exactly one place during development, instead of
 * being scattered across components.
 *
 * When a backend (e.g. Supabase Auth) is introduced, delete this file
 * entirely and replace `src/services/adminAuthService.js` with real
 * server-side authentication.
 */
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'IndoreRelay@2026'
}

// How long an admin session stays valid without activity (ms).
export const ADMIN_SESSION_DURATION_MS = 1000 * 60 * 60 * 4 // 4 hours
