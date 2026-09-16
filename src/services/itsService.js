import { readJSON, writeJSON } from '../utils/storage'
import { isValidITSFormat } from '../utils/validators'
import { generateId } from '../utils/id'

const STORE_KEY = 'authorizedITS'

/**
 * Shape of a stored record:
 * {
 *   id: string,
 *   its: string,            // 8-digit ITS number
 *   active: boolean,
 *   createdAt: string,      // ISO date
 *   activeSession: null | { sessionId, deviceId, issuedAt }
 * }
 *
 * Every method here is async and returns plain data, on purpose:
 * it mirrors the shape a real SupabaseITSService would have, so the
 * UI layer never needs to change when local storage is swapped for a
 * real backend. Only this file (and sessionService's calls into it)
 * would need to be replaced.
 */
class LocalStorageITSService {
  _readAll() {
    return readJSON(STORE_KEY, [])
  }

  _writeAll(records) {
    writeJSON(STORE_KEY, records)
  }

  async list() {
    return [...this._readAll()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }

  async add(itsNumber) {
    const its = String(itsNumber).trim()
    if (!isValidITSFormat(its)) {
      throw new Error('ITS number must be exactly 8 digits, numbers only.')
    }

    const records = this._readAll()
    if (records.some((r) => r.its === its)) {
      throw new Error('This ITS number is already registered.')
    }

    const record = {
      id: generateId('its'),
      its,
      active: true,
      createdAt: new Date().toISOString(),
      activeSession: null
    }

    records.push(record)
    this._writeAll(records)
    return record
  }

  async setActive(id, active) {
    const records = this._readAll()
    const index = records.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('ITS record not found.')

    records[index] = {
      ...records[index],
      active,
      // Disabling an ITS immediately invalidates any live session.
      activeSession: active ? records[index].activeSession : null
    }
    this._writeAll(records)
    return records[index]
  }

  async remove(id) {
    const records = this._readAll().filter((r) => r.id !== id)
    this._writeAll(records)
  }

  async findByITS(itsNumber) {
    const its = String(itsNumber).trim()
    return this._readAll().find((r) => r.its === its) ?? null
  }

  async isAuthorized(itsNumber) {
    const record = await this.findByITS(itsNumber)
    return Boolean(record && record.active)
  }

  /**
   * Attempts to attach a session to an ITS record. Fails if another
   * session is already active on a different device (single-device
   * lock). Returns the updated record.
   */
  async attachSession(itsNumber, { sessionId, deviceId }) {
    const records = this._readAll()
    const index = records.findIndex((r) => r.its === String(itsNumber).trim())
    if (index === -1) throw new Error('ITS record not found.')

    const record = records[index]
    const existing = record.activeSession

    if (existing && existing.deviceId !== deviceId) {
      const err = new Error(
        'This ITS is already logged in on another device. Log out there first.'
      )
      err.code = 'ALREADY_ACTIVE_ELSEWHERE'
      throw err
    }

    records[index] = {
      ...record,
      activeSession: { sessionId, deviceId, issuedAt: new Date().toISOString() }
    }
    this._writeAll(records)
    return records[index]
  }

  async clearSession(itsNumber, sessionId) {
    const records = this._readAll()
    const index = records.findIndex((r) => r.its === String(itsNumber).trim())
    if (index === -1) return

    const record = records[index]
    // Only clear if it matches the session asking to log out, so a
    // stale tab can't wipe out a newer, legitimate session.
    if (record.activeSession && record.activeSession.sessionId === sessionId) {
      records[index] = { ...record, activeSession: null }
      this._writeAll(records)
    }
  }

  async stats() {
    const records = this._readAll()
    const total = records.length
    const active = records.filter((r) => r.active).length
    return { total, active, disabled: total - active }
  }
}

export const itsService = new LocalStorageITSService()
