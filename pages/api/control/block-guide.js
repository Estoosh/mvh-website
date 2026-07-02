import { fetchAllRecords, getRecord, updateRecord, createRecord } from '../../../lib/airtable'
import { normalizeEmail, normalizePhoneToCanonical } from '../../../lib/normalize'
import { writeAuditLog } from '../../../lib/audit-log'

// Existing, Founder-Flow-owned tables. Guide_Status is explicitly
// authorized to be written here (Control Center Spec v1, Section 5/8).
// Tour_Status is never touched — only the new Content_Status fields
// (Section 4/8).
const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'
const TOURS_TABLE_ID = 'tbltsGvfPLMAmJ764'

// NEEDS VERIFICATION: Blocklist table does not exist yet — inert until
// created, same pattern as the other Control Center / Finance files.
const BLOCKLIST_TABLE_ID = process.env.AIRTABLE_TABLE_BLOCKLIST

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { guide_id, reason, created_by } = req.body || {}

  if (!guide_id || !reason || !created_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  try {
    const guide = await getRecord(GUIDES_TABLE_ID, guide_id)
    if (!guide) {
      return res.status(404).json({ error: 'guide_not_found' })
    }

    // 1. Block the guide's account.
    const updateResult = await updateRecord(GUIDES_TABLE_ID, guide_id, { Guide_Status: 'blocked' })
    if (!updateResult.ok) {
      return res.status(500).json({ error: 'guide_status_update_failed', details: updateResult.error })
    }

    // 2. Auto-add the guide's email/phone to the Blocklist.
    let blocklistEntries = []
    if (BLOCKLIST_TABLE_ID) {
      const toCreate = []
      if (guide.Email) {
        toCreate.push({
          Type: 'Email',
          Value: normalizeEmail(guide.Email),
          Reason: reason,
          Block_Source: 'guide_block',
          Created_At: new Date().toISOString(),
          Created_By: created_by,
          Status: 'Active'
        })
      }
      if (guide.WhatsApp_Number) {
        toCreate.push({
          Type: 'Phone',
          Value: normalizePhoneToCanonical(guide.WhatsApp_Number),
          Reason: reason,
          Block_Source: 'guide_block',
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

    // 3. Cascade: hide every currently-active tour belonging to this guide.
    // Joined by Guide_Name text match — the same existing, fragile join
    // already flagged in the Finance module's generate-billing-file.js.
    const allTours = await fetchAllRecords(TOURS_TABLE_ID)
    const guideTours = allTours.filter((t) => t.Guide_Name === guide.Guide_Name && t.Tour_Status === 'paid')

    const hiddenTourIds = []
    for (const tour of guideTours) {
      const r = await updateRecord(TOURS_TABLE_ID, tour.id, {
        Content_Status: 'Hidden',
        Status_Changed_At: new Date().toISOString(),
        Status_Changed_By: created_by,
        Status_Change_Reason: `Cascaded from guide block: ${reason}`
      })
      if (r.ok) hiddenTourIds.push(tour.id)
    }

    await writeAuditLog({
      actor: created_by,
      module: 'Control Center',
      actionType: 'Guide Blocked',
      targetType: 'Guide',
      targetId: guide_id,
      beforeValue: guide.Guide_Status,
      afterValue: 'blocked',
      reason
    })

    return res.status(200).json({
      ok: true,
      guide_id,
      blocklistEntriesCreated: blocklistEntries.length,
      toursHidden: hiddenTourIds.length,
      hiddenTourIds
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
