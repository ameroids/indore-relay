export const APP_NAME = 'Indore Relay'
export const APP_TAGLINE = 'Secure access. Simple relay.'

// How long a user session stays valid without activity (ms).
export const USER_SESSION_DURATION_MS = 1000 * 60 * 60 * 12 // 12 hours

// When true, an ITS that already has an active session on another
// device/tab-session cannot start a second session until the first
// one logs out or expires.
export const ENFORCE_SINGLE_DEVICE_SESSION = true
