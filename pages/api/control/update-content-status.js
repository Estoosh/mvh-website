import { fetchAllRecords, getRecord, updateRecord } from '../../../lib/airtable'
import { writeAuditLog } from '../../../lib/audit-log'

const TOURS_TABLE_ID = 'tbltsGvfPLMAmJ764'
const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'

const VALID_STATUSES = ['Visible', 'Hidden', 'Removed']

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { tour_ids, guide_id, content_status, reason, updated_by } = req.body || {}

  if (!content_status || !reason || !updated_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  if (!VALID_STATUSES.includes(content_status)) {
    return res.status(400).json({ error: 'invalid_content_status', allowed: VALID_STATUSES })
  }

  if ((!tour_ids || tour_ids.length === 0) && !guide_id) {
    return res.status(400).json({ error: 'must_provide_tour_ids_or_guide_id' })
  }

  try {
    // Selection method A: by guide — resolve every tour belonging to them.
    // Selection methods B/C (search results, manual multi-select) both
    // arrive as an explicit tour_ids array from the client — this route
    // doesn't need to know which of the two the admin used.
    let targetTourIds = tour_ids || []

    if (guide_id) {
      const guide = await getRecord(GUIDES_TABLE_ID, guide_id)
      if (!guide) {
        return res.status(404).json({ error: 'guide_not_found' })
      }
      const allTours = await fetchAllRecords(TOURS_TABLE_ID)
      const guideTourIds = allTours
        .filter((t) => t.Guide_Name === guide.Guide_Name)
        .map((t) => t.id)
      targetTourIds = targetTourIds.concat(guideTourIds)
    }

    // De-duplicate in case both guide_id and an overlapping tour_ids list
    // were sent together.
    targetTourIds = Array.from(new Set(targetTourIds))

    if (targetTourIds.length === 0) {
      return res.status(200).json({ ok: true, updatedCount: 0, updatedTourIds: [] })
    }

    const updatedTourIds = []
    for (const tourId of targetTourIds) {
      // This route only ever writes Content_Status and its accompanying
      // fields — it never reads or writes Tour_Status.
      const result = await updateRecord(TOURS_TABLE_ID, tourId, {
        Content_Status: content_status,
        Status_Changed_At: new Date().toISOString(),
        Status_Changed_By: updated_by,
        Status_Change_Reason: reason
      })
      if (result.ok) updatedTourIds.push(tourId)
    }

    // One summary Audit_Log entry per batch action, not one per tour, to
    // keep the log readable for bulk operations.
    await writeAuditLog({
      actor: updated_by,
      module: 'Control Center',
      actionType: `Content Status Set to ${content_status}`,
      targetType: 'Tour',
      afterValue: JSON.stringify({ tourIds: updatedTourIds, content_status }),
      reason
    })

    return res.status(200).json({ ok: true, updatedCount: updatedTourIds.length, updatedTourIds })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
