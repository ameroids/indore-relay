const ITS_PATTERN = /^[0-9]{8}$/

/**
 * Strips whitespace (including accidental spaces pasted in the middle)
 * and any non-digit characters, then caps the result at 8 characters.
 */
export function sanitizeITSInput(rawValue) {
  const digitsOnly = String(rawValue ?? '').replace(/\s+/g, '').replace(/\D/g, '')
  return digitsOnly.slice(0, 8)
}

export function validateITS(rawValue) {
  const value = String(rawValue ?? '').trim()

  if (!value) {
    return { valid: false, error: 'Enter your ITS number.' }
  }
  if (!/^\d+$/.test(value)) {
    return { valid: false, error: 'ITS number must contain digits only.' }
  }
  if (value.length !== 8) {
    return { valid: false, error: 'ITS number must be exactly 8 digits.' }
  }
  return { valid: true, value }
}

export function isValidITSFormat(value) {
  return ITS_PATTERN.test(String(value ?? '').trim())
}
