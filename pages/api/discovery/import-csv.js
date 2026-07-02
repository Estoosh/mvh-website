import { fetchAllRecords, createRecord, updateRecord } from '../../../lib/airtable'
import { writeAuditLog } from '../../../lib/audit-log'

// Existing, Founder-Flow-owned table. Fields written here already exist
// per the founder's confirmation — no schema change.
const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'

// Minimal RFC4180-style CSV parser (no new npm dependency). Handles
// quoted fields, embedded commas, embedded newlines, and doubled-quote
// escaping ("").
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  let i = 0

  // Strip a UTF-8 BOM if present (Airtable's own exports include one,
  // confirmed in the founder's uploaded template).
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1)

  while (i < text.length) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue }
        inQuotes = false; i++; continue
      }
      field += char; i++; continue
    }

    if (char === '"') { inQuotes = true; i++; continue }
    if (char === ',') { row.push(field); field = ''; i++; continue }
    if (char === '\r') { i++; continue }
    if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue }
    field += char; i++
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row) }

  if (rows.length === 0) return []
  const headers = rows[0]
  return rows.slice(1)
    .filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''))
    .map((r) => {
      const obj = {}
      headers.forEach((h, idx) => { obj[h] = r[idx] !== undefined ? r[idx] : '' })
      return obj
    })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { csv_text, created_by } = req.body || {}

  if (!csv_text || !created_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  try {
    const rows = parseCsv(csv_text)
    const existing = await fetchAllRecords(GUIDES_TABLE_ID)

    let created = 0
    let updated = 0
    let skipped = 0
    const errors = []

    for (const row of rows) {
      const guideName = row.Guide_Name
      if (!guideName) { skipped++; continue }

      // Only write fields that are actually present as columns in this
      // CSV and non-empty — direct field-name pass-through, no mapping,
      // per the spec's "No transformation layer" requirement.
      //
      // EXCEPTION, deliberate: Guide_Status is always skipped, even if
      // present in the CSV (the real uploaded template does contain a
      // "discovery" value in this column). Per the founder's explicit
      // decision, Guide_Status must stay blank for Discovery/Lead
      // records and is only ever set by the existing Founder Flow at
      // real registration time.
      const fields = {}
      Object.keys(row).forEach((key) => {
        if (key === 'Guide_Status') return
        if (row[key] !== '' && row[key] !== undefined) fields[key] = row[key]
      })

      const matchByEmail = row.Email
        ? existing.find((g) => g.Guide_Name === guideName && g.Email === row.Email)
        : null
      const matchByPhone = !matchByEmail && row.WhatsApp_Number
        ? existing.find((g) => g.Guide_Name === guideName && g.WhatsApp_Number === row.WhatsApp_Number)
        : null
      const match = matchByEmail || matchByPhone

      if (match) {
        const result = await updateRecord(GUIDES_TABLE_ID, match.id, fields)
        if (result.ok) updated++
        else errors.push({ guide_name: guideName, error: result.error })
      } else {
        const result = await createRecord(GUIDES_TABLE_ID, fields)
        if (result.ok) created++
        else errors.push({ guide_name: guideName, error: result.error })
      }
    }

    await writeAuditLog({
      actor: created_by,
      module: 'Other',
      actionType: 'Discovery CSV Import',
      targetType: 'Guide',
      afterValue: JSON.stringify({ totalRows: rows.length, created, updated, skipped, errorCount: errors.length })
    })

    return res.status(200).json({
      ok: true,
      totalRows: rows.length,
      created,
      updated,
      skipped,
      errors
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
