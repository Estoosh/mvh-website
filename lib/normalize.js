import { createRecord } from '../../../lib/airtable'
import { normalizeEmail, normalizePhoneToCanonical } from '../../../lib/normalize'
import { writeAuditLog } from '../../../lib/audit-log'

// NEEDS VERIFICATION: this table does not exist yet. Inert until the
// Blocklist table is created and this env var is set — same pattern as
// FINANCE_TABLES.
const BLOCKLIST_TABLE_ID = process.env.AIRTABLE_TABLE_BLOCKLIST

const VALID_TYPES = ['Email', 'Phone', 'Guide_ID', 'IP_Address']

// Manual creation is always Block_Source: manual — the other sources
// (guide_block, community_block, spam_detection) are only ever set by
// their own dedicated routes (block-guide.js, block-signup.js, and a
// future spam-detection mechanism), never by this one.
const BLOCK_SOURCE = 'manual'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { type, value, reason, expires_at, created_by } = req.body || {}

  if (!type || !value || !reason || !created_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'invalid_type', allowed: VALID_TYPES })
  }

  if (!BLOCKLIST_TABLE_ID) {
    return res.status(500).json({ error: 'blocklist_table_not_configured' })
  }

  let normalizedValue = String(value).trim()
  if (type === 'Email') normalizedValue = normalizeEmail(value)
  if (type === 'Phone') normalizedValue = normalizePhoneToCanonical(value)

  try {
    const fields = {
      Type: type,
      Value: normalizedValue,
      Reason: reason,
      Block_Source: BLOCK_SOURCE,
      Created_At: new Date().toISOString(),
      Created_By: created_by,
      Status: 'Active'
    }
    if (expires_at) fields.Expires_At = expires_at

    const result = await createRecord(BLOCKLIST_TABLE_ID, fields)
    if (!result.ok) {
      return res.status(500).json({ error: 'blocklist_entry_create_failed', details: result.error })
    }

    await writeAuditLog({
      actor: created_by,
      module: 'Control Center',
      actionType: 'Blocklist Entry Added',
      targetType: 'Blocklist',
      targetId: result.record.id,
      afterValue: JSON.stringify(fields),
      reason
    })

    return res.status(200).json({ ok: true, entry: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
