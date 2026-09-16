import { readJSON, writeJSON } from '../utils/storage'
import { generateId } from '../utils/id'

const DEVICE_KEY = 'deviceId'

/**
 * Returns a stable ID for this browser, creating one on first use.
 *
 * LIMITATION: this identifies a *browser profile*, not a physical
 * device or person. It resets if storage is cleared and differs per
 * browser/incognito window. Real single-device enforcement across
 * actual devices needs a server that can see all sessions at once
 * (see README → Security & limitations).
 */
export function getDeviceId() {
  let id = readJSON(DEVICE_KEY, null)
  if (!id) {
    id = generateId('device')
    writeJSON(DEVICE_KEY, id)
  }
  return id
}
