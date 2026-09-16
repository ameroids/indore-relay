import { readJSON, writeJSON, remove } from '../utils/storage'
import { generateId } from '../utils/id'
import { itsService } from './itsService'
import { getDeviceId } from './deviceService'
import { USER_SESSION_DURATION_MS, ENFORCE_SINGLE_DEVICE_SESSION } from '../config/appConfig'

const SESSION_KEY = 'userSession'

function isExpired(session) {
  return !session || new Date(session.expiresAt).getTime() < Date.now()
}

class SessionService {
  /**
   * Validates the ITS, then attempts to open a session for it.
   * Throws with a user-facing message on any failure.
   */
  async login(itsNumber) {
    const record = await itsService.findByITS(itsNumber)
    if (!record || !record.active) {
      const err = new Error('This ITS is not authorized to access Indore Relay.')
      err.code = 'NOT_AUTHORIZED'
      throw err
    }

    const sessionId = generateId('sess')
    const deviceId = getDeviceId()

    if (ENFORCE_SINGLE_DEVICE_SESSION) {
      await itsService.attachSession(itsNumber, { sessionId, deviceId })
    }

    const session = {
      its: record.its,
      sessionId,
      deviceId,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + USER_SESSION_DURATION_MS).toISOString()
    }
    writeJSON(SESSION_KEY, session)
    return session
  }

  getSession() {
    const session = readJSON(SESSION_KEY, null)
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

  async logout() {
    const session = readJSON(SESSION_KEY, null)
    if (session && ENFORCE_SINGLE_DEVICE_SESSION) {
      await itsService.clearSession(session.its, session.sessionId)
    }
    remove(SESSION_KEY)
  }
}

export const sessionService = new SessionService()
