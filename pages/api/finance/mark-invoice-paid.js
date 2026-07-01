import { getRecord, updateRecord, createRecord, FINANCE_TABLES } from '../../../lib/airtable'
import { writeAuditLog } from '../../../lib/audit-log'

const VALID_STATUSES = ['Paid', 'Not Paid']

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { invoice_id, payment_status, updated_by } = req.body || {}

  if (!invoice_id || !payment_status || !updated_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  if (!VALID_STATUSES.includes(payment_status)) {
    return res.status(400).json({ error: 'invalid_payment_status', allowed: VALID_STATUSES })
  }

  if (!FINANCE_TABLES.INVOICES) {
    return res.status(500).json({ error: 'invoices_table_not_configured' })
  }

  try {
    const invoice = await getRecord(FINANCE_TABLES.INVOICES, invoice_id)
    if (!invoice) {
      return res.status(404).json({ error: 'invoice_not_found' })
    }

    const previousStatus = invoice.Payment_Status

    // This route only ever touches the Invoices table. It does not create
    // a Suspension and does not read or write Tour_Status — that is a
    // separate, deliberate action via create-suspension.js.
    const result = await updateRecord(FINANCE_TABLES.INVOICES, invoice_id, {
      Payment_Status: payment_status,
      Marked_Paid_At: new Date().toISOString(),
      Marked_Paid_By: updated_by
    })

    if (!result.ok) {
      return res.status(500).json({ error: 'invoice_update_failed', details: result.error })
    }

    if (FINANCE_TABLES.BILLING_EVENTS) {
      await createRecord(FINANCE_TABLES.BILLING_EVENTS, {
        Event_Type: payment_status === 'Paid' ? 'Payment Marked Paid' : 'Payment Marked Not Paid',
        Related_Guide_ID: invoice.Guide_ID,
        Related_Invoice_ID: [invoice_id],
        Amount: invoice.Total_Amount,
        Timestamp: new Date().toISOString(),
        Actor: updated_by
      })
    }

    await writeAuditLog({
      actor: updated_by,
      module: 'Finance',
      actionType: 'Invoice Payment Status Updated',
      targetType: 'Invoice',
      targetId: invoice_id,
      beforeValue: previousStatus,
      afterValue: payment_status
    })

    return res.status(200).json({ ok: true, invoice: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
