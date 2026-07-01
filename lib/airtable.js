// Shared Airtable read/write helper for the MVH Finance module.
// Used only by the new pages/api/finance/* routes — does not touch,
// import, or refactor any existing API route.
//
// Reuses the same env var names already used by pages/api/admin-data.js,
// pages/api/send-billing-email.js and pages/api/admin-update-tour.js:
// AIRTABLE_TOKEN and AIRTABLE_BASE_ID. No new env vars are introduced
// without being flagged first.

const AIRTABLE_API_URL = 'https://api.airtable.com/v0'

// Table IDs for the six new Finance tables (Benefits, Credits, Invoices,
// Suspensions, Billing_Events, Audit_Log) proposed in the Finance Module
// Spec v1, Section 15 / 18.3.
//
// NEEDS VERIFICATION: these tables do not exist yet. Values below are read
// from env vars that are not yet set — this file is intentionally inert
// until table creation is approved and the corresponding env vars are added.
// Nothing calls these until that happens.
export const FINANCE_TABLES = {
  BENEFITS: process.env.AIRTABLE_TABLE_BENEFITS,
  CREDITS: process.env.AIRTABLE_TABLE_CREDITS,
  INVOICES: process.env.AIRTABLE_TABLE_INVOICES,
  SUSPENSIONS: process.env.AIRTABLE_TABLE_SUSPENSIONS,
  BILLING_EVENTS: process.env.AIRTABLE_TABLE_BILLING_EVENTS,
  AUDIT_LOG: process.env.AIRTABLE_TABLE_AUDIT_LOG
}

function getConfig() {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!token || !baseId) {
    throw new Error('missing_airtable_config')
  }
  return { token, baseId }
}

function recordToObject(record) {
  return Object.assign({ id: record.id }, record.fields)
}

// Fetches all records from a table, following pagination automatically.
// Mirrors the pattern already used in pages/api/founder-stats.js.
export async function fetchAllRecords(tableId, { filterByFormula } = {}) {
  if (!tableId) throw new Error('missing_table_id')
  const { token, baseId } = getConfig()

  let records = []
  let offset = null

  do {
    const params = new URLSearchParams()
    params.set('pageSize', '100')
    if (offset) params.set('offset', offset)
    if (filterByFormula) params.set('filterByFormula', filterByFormula)

    const res = await fetch(`${AIRTABLE_API_URL}/${baseId}/${tableId}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      throw new Error('airtable_fetch_failed')
    }

    const data = await res.json()
    records = records.concat(data.records || [])
    offset = data.offset
  } while (offset)

  return records.map(recordToObject)
}

// Fetches a single record by ID.
export async function getRecord(tableId, recordId) {
  if (!tableId) throw new Error('missing_table_id')
  const { token, baseId } = getConfig()

  const res = await fetch(`${AIRTABLE_API_URL}/${baseId}/${tableId}/${recordId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) return null
  const data = await res.json()
  return recordToObject(data)
}

// Creates a new record. fields is a plain object of Airtable field names to values.
export async function createRecord(tableId, fields) {
  if (!tableId) throw new Error('missing_table_id')
  const { token, baseId } = getConfig()

  const res = await fetch(`${AIRTABLE_API_URL}/${baseId}/${tableId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  })

  const data = await res.json()
  if (!res.ok) {
    return { ok: false, error: data }
  }
  return { ok: true, record: recordToObject(data) }
}

// Updates (PATCHes) an existing record. Only the fields passed are changed.
export async function updateRecord(tableId, recordId, fields) {
  if (!tableId) throw new Error('missing_table_id')
  const { token, baseId } = getConfig()

  const res = await fetch(`${AIRTABLE_API_URL}/${baseId}/${tableId}/${recordId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  })

  const data = await res.json()
  if (!res.ok) {
    return { ok: false, error: data }
  }
  return { ok: true, record: recordToObject(data) }
}
