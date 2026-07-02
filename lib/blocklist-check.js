import { fetchAllRecords } from './airtable'
import { normalizeEmail, normalizePhoneToCanonical } from './normalize'

// NEEDS VERIFICATION: this table does not exist yet. Read from an env var
// that is not yet set — inert until the Blocklist table is created and
// approved, same pattern as FINANCE_TABLES in lib/airtable.js.
const BLOCKLIST_TABLE_ID = process.env.AIRTABLE_TABLE_BLOCKLIST

// Read-only. Never writes — creating a Blocklist entry is a separate,
// explicit action (add-blocklist-entry.js, block-guide.js, block-signup.js).
//
// DECISION, flagged rather than assumed silently: if the Blocklist table
// isn't configured yet (BLOCKLIST_TABLE_ID unset), this fails OPEN
// (blocked: false) rather than throwing — since nothing can legitimately
// be blocked before the table exists. Once the table is live, a
// misconfigured env var would also fail open, which is worth knowing.
export async function isBlocked({ email, phone }) {
  if (!BLOCKLIST_TABLE_ID) {
    return { blocked: false, checked: false, reason: 'blocklist_table_not_configured' }
  }

  const normalizedEmail = email ? normalizeEmail(email) : null
  const normalizedPhone = phone ? normalizePhoneToCanonical(phone) : null

  if (!normalizedEmail && !normalizedPhone) {
    return { blocked: false, checked: true, match: null }
  }

  const conditions = []
  if (normalizedEmail) {
    conditions.push(`AND({Type} = 'Email', {Value} = '${normalizedEmail}')`)
  }
  if (normalizedPhone) {
    conditions.push(`AND({Type} = 'Phone', {Value} = '${normalizedPhone}')`)
  }

  const formula = `AND({Status} = 'Active', OR(${conditions.join(',')}))`

  const matches = await fetchAllRecords(BLOCKLIST_TABLE_ID, { filterByFormula: formula })

  if (matches.length === 0) {
    return { blocked: false, checked: true, match: null }
  }

  return { blocked: true, checked: true, match: matches[0] }
}
