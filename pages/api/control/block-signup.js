import { getRecord, updateRecord, createRecord } from '../../../lib/airtable'
import { normalizeEmail, normalizePhoneToCanonical } from '../../../lib/normalize'
import { writeAuditLog } from '../../../lib/audit-log'

// Existing, Founder-Flow-owned table, referenced by name in
// register-signup.js. Only the four new fields from Control Center Spec
// v1, Section 7, are written here — nothing else on this table.
const SIGNUPS_TABLE_ID = 'Signups'

// NEEDS VERIFICATION: Blocklist table does not exist yet — inert until
// created.
const BLOCKLIST_TABLE_ID = process.env.AIRTABLE_TABLE_BLOCKLIST

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { signup_id, reason, created_by } = req.body || {}

  if (!signup_id || !reason || !created_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  try {
    const signup = await getRecord(SIGNUPS_TABLE_ID, signup_id)
    if (!signup) {
      return res.status(404).json({ error: 'signup_not_found' })
    }

    // Touches only Signups — the four new fields.
    const updateResult = await updateRecord(SIGNUPS_TABLE_ID, signup_id, {
      Blocked: true,
      Blocked_At: new Date().toISOString(),
      Blocked_By: created_by,
      Blocked_Reason: reason
    })
    if (!updateResult.ok) {
      return res.status(500).json({ error: 'signup_update_failed', details: updateResult.error })
    }

    // Touches only Blocklist.
    let blocklistEntries = []
    if (BLOCKLIST_TABLE_ID) {
      const toCreate = []
      if (signup.Email) {
        toCreate.push({
          Type: 'Email',
          Value: normalizeEmail(signup.Email),
          Reason: reason,
          Block_Source: 'community_block',
          Created_At: new Date().toISOString(),
          Created_By: created_by,
          Status: 'Active'
        })
      }
      if (signup.WhatsApp_Phone) {
        toCreate.push({
          Type: 'Phone',
          Value: normalizePhoneToCanonical(signup.WhatsApp_Phone),
          Reason: reason,
          Block_Source: 'community_block',
          Created_At: new Date().toISOString(),
          Created_By: created_by,
          Status: 'Active'
        })
      }
      for (const fields of toCreate) {
        const r = await createRecord(BLOCKLIST_TABLE_ID, fields)
        if (r.ok) blocklistEntries.push(r.record)
      }
    }

    await writeAuditLog({
      actor: created_by,
      module: 'Control Center',
      actionType: 'Community Member Blocked',
      targetType: 'Signup',
      targetId: signup_id,
      reason
    })

    return res.status(200).json({ ok: true, signup_id, blocklistEntriesCreated: blocklistEntries.length })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
