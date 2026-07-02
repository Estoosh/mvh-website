// Shared normalization helpers for the MVH Control Center module.
// Pure functions, no Airtable dependency — safe to unit test in isolation.
//
// CRITICAL: register-founder.js, add-tour.js, and register-signup.js must
// all import and call these exact functions — never a locally
// re-implemented copy — so the local-format vs. canonical-format
// conversion is only ever handled in one place (Control Center Spec v1,
// Section 10.2 / 11.3).

// Lowercase + trim. Matches the normalization already used ad hoc in
// register-founder.js and add-tour.js, formalized here as the single
// shared version.
export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

// Converts any phone input (local 10-digit Israeli format, already-
// canonical international format, or a loosely formatted string with
// spaces/dashes/plus signs) into the canonical Blocklist format:
// 972501234567 — international, no leading zero, no plus sign, no dashes.
export function normalizePhoneToCanonical(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''

  // Already canonical: starts with 972, 12 digits total (972 + 9 digits).
  if (digits.startsWith('972') && digits.length === 12) {
    return digits
  }

  // Local format: starts with 0, 10 digits total (0 + 9 digits).
  if (digits.startsWith('0') && digits.length === 10) {
    return '972' + digits.slice(1)
  }

  // Missing leading zero, 9 digits (e.g. "501234567") — treat as local
  // without the leading 0.
  if (digits.length === 9) {
    return '972' + digits
  }

  // Anything else is not a recognizable Israeli number in either format.
  // Returned as-is (digits only) rather than guessed at further, so a
  // bad match fails loudly instead of silently succeeding.
  return digits
}

// Converts a canonical international number (972501234567) back to the
// local 10-digit format (0501234567) used by the existing Guides table
// (WhatsApp_Number field) and by register-founder.js / add-tour.js today.
export function normalizePhoneToLocal(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''

  if (digits.startsWith('972') && digits.length === 12) {
    return '0' + digits.slice(3)
  }

  // Already local format.
  if (digits.startsWith('0') && digits.length === 10) {
    return digits
  }

  if (digits.length === 9) {
    return '0' + digits
  }

  return digits
}
