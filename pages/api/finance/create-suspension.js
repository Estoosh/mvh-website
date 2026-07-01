import { fetchAllRecords, createRecord, FINANCE_TABLES } from '../../../lib/airtable'
import { writeAuditLog } from '../../../lib/audit-log'

// Fixed reason for this phase — Billing Suspensions have exactly one cause
// (Finance Module Spec v1, Section 4.1). This is intentionally not a free
// text field.
const FIXED_REASON = 'Failed to charge the payment method on file.'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { guide_id, invoice_id, start_date, end_date, notes, created_by } = req.body || {}

  if (!guide_id || !invoice_id || !start_date || !end_date || !created_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  if (new Date(end_date) <= new Date(start_date)) {
    return res.status(400).json({ error: 'end_date_must_be_after_start_date' })
  }

  if (!FINANCE_TABLES.SUSPENSIONS) {
    return res.status(500).json({ error: 'suspensions_table_not_configured' })
  }

  try {
    // Guardrail: don't open a second Active suspension for a guide who
    // already has one. Not explicitly specified in the methodology doc —
    // added here as a safety check, flagged for your review rather than
    // assumed silently.
    const existingActive = await fetchAllRecords(FINANCE_TABLES.SUSPENSIONS, {
      filterByFormula: `AND({Guide_ID} = '${guide_id}', {Status} = 'Active')`
    })
    if (existingActive.length > 0) {
      return res.status(409).json({ error: 'active_suspension_already_exists', existing: existingActive[0] })
    }

    const fields = {
      Guide_ID: [guide_id],
      Invoice_ID: [invoice_id],
      Reason: FIXED_REASON,
      Start_Date: start_date,
      End_Date: end_date,
      Status: 'Active',
      Created_By: created_by,
      Created_At: new Date().toISOString()
    }
    if (notes) fields.Notes = notes

    // This route never reads or writes Tour_Status or any Tours/Guides
    // field — it only creates a Suspension record.
    const result = await createRecord(FINANCE_TABLES.SUSPENSIONS, fields)

    if (!result.ok) {
      return res.status(500).json({ error: 'suspension_create_failed', details: result.error })
    }

    if (FINANCE_TABLES.BILLING_EVENTS) {
      await createRecord(FINANCE_TABLES.BILLING_EVENTS, {
        Event_Type: 'Suspension Started',
        Related_Guide_ID: [guide_id],
        Related_Invoice_ID: [invoice_id],
        Timestamp: new Date().toISOString(),
        Actor: created_by
      })
    }

    await writeAuditLog({
      actor: created_by,
      module: 'Finance',
      actionType: 'Suspension Started',
      targetType: 'Suspension',
      targetId: result.record.id,
      afterValue: JSON.stringify(fields),
      reason: FIXED_REASON
    })

    return res.status(200).json({ ok: true, suspension: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
