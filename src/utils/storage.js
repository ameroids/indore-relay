const NAMESPACE = 'indoreRelay'

function keyFor(name) {
  return `${NAMESPACE}:${name}`
}

export function readJSON(name, fallback) {
  try {
    const raw = window.localStorage.getItem(keyFor(name))
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    // Corrupt or blocked storage should never crash the app.
    return fallback
  }
}

export function writeJSON(name, value) {
  try {
    window.localStorage.setItem(keyFor(name), JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function remove(name) {
  try {
    window.localStorage.removeItem(keyFor(name))
  } catch {
    /* no-op */
  }
}
