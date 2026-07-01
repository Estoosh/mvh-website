import { getRecord, updateRecord, createRecord, FINANCE_TABLES } from '../../../lib/airtable'
import { writeAuditLog } from '../../../lib/audit-log'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { suspension_id, updated_by } = req.body || {}

  if (!suspension_id || !updated_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  if (!FINANCE_TABLES.SUSPENSIONS) {
    return res.status(500).json({ error: 'suspensions_table_not_configured' })
  }

  try {
    const suspension = await getRecord(FINANCE_TABLES.SUSPENSIONS, suspension_id)
    if (!suspension) {
      return res.status(404).json({ error: 'suspension_not_found' })
    }

    if (suspension.Status !== 'Active') {
      return res.status(409).json({ error: 'suspension_not_active', current_status: suspension.Status })
    }

    // This route only ever touches the Suspensions table.
    const result = await updateRecord(FINANCE_TABLES.SUSPENSIONS, suspension_id, {
      Status: 'Ended'
    })

    if (!result.ok) {
      return res.status(500).json({ error: 'suspension_update_failed', details: result.error })
    }

    if (FINANCE_TABLES.BILLING_EVENTS) {
      await createRecord(FINANCE_TABLES.BILLING_EVENTS, {
        Event_Type: 'Suspension Ended',
        Related_Guide_ID: suspension.Guide_ID,
        Related_Invoice_ID: suspension.Invoice_ID,
        Timestamp: new Date().toISOString(),
        Actor: updated_by
      })
    }

    await writeAuditLog({
      actor: updated_by,
      module: 'Finance',
      actionType: 'Suspension Ended',
      targetType: 'Suspension',
      targetId: suspension_id,
      beforeValue: 'Active',
      afterValue: 'Ended'
    })

    return res.status(200).json({ ok: true, suspension: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
