import { readJSON, writeJSON, remove } from '../utils/storage'
import { generateId } from '../utils/id'
import { ADMIN_CREDENTIALS, ADMIN_SESSION_DURATION_MS } from '../config/adminConfig'

const ADMIN_SESSION_KEY = 'adminSession'

function isExpired(session) {
  return !session || new Date(session.expiresAt).getTime() < Date.now()
}

class AdminAuthService {
  async login(username, password) {
    const ok =
      username.trim() === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password

    if (!ok) {
      const err = new Error('Incorrect username or password.')
      err.code = 'INVALID_CREDENTIALS'
      throw err
    }

    const session = {
      token: generateId('admin'),
      username: ADMIN_CREDENTIALS.username,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ADMIN_SESSION_DURATION_MS).toISOString()
    }
    writeJSON(ADMIN_SESSION_KEY, session)
    return session
  }

  getSession() {
    const session = readJSON(ADMIN_SESSION_KEY, null)
    if (!session) return null
    if (isExpired(session)) {
      this.logout()
      return null
    }
    return session
  }

  isAuthenticated() {
    return Boolean(this.getSession())
  }

  logout() {
    remove(ADMIN_SESSION_KEY)
  }
}

export const adminAuthService = new AdminAuthService()
