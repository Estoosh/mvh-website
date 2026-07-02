import { getRecord, updateRecord } from '../../../lib/airtable'
import { writeAuditLog } from '../../../lib/audit-log'

const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { guide_id, updated_by } = req.body || {}

  if (!guide_id || !updated_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  try {
    const guide = await getRecord(GUIDES_TABLE_ID, guide_id)
    if (!guide) {
      return res.status(404).json({ error: 'guide_not_found' })
    }

    if (guide.Guide_Status !== 'blocked') {
      return res.status(409).json({ error: 'guide_not_blocked', current_status: guide.Guide_Status })
    }

    // This route only ever touches Guide_Status. It does NOT restore
    // Content_Status on any tour — restoring visibility is always a
    // separate, manual action (Control Center Spec v1, Section 5).
    const result = await updateRecord(GUIDES_TABLE_ID, guide_id, { Guide_Status: 'active' })
    if (!result.ok) {
      return res.status(500).json({ error: 'guide_status_update_failed', details: result.error })
    }

    await writeAuditLog({
      actor: updated_by,
      module: 'Control Center',
      actionType: 'Guide Unblocked',
      targetType: 'Guide',
      targetId: guide_id,
      beforeValue: 'blocked',
      afterValue: 'active'
    })

    return res.status(200).json({ ok: true, guide: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
