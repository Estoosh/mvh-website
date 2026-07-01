import { fetchAllRecords, getRecord, createRecord, FINANCE_TABLES } from '../../../lib/airtable'
import { calculateCreditAmount, CREDIT_PERCENTAGE_PRESETS } from '../../../lib/finance-calc'
import { writeAuditLog } from '../../../lib/audit-log'

// Valid Credit Scenarios, per the v1.0 methodology's "Valid Credit
// Scenarios" section.
const VALID_REASON_CATEGORIES = [
  'Duplicate billing',
  'Incorrect discount application',
  'Billing calculation errors',
  'Incorrect proration calculations',
  'Administrative errors',
  'Technical failures',
  'Strategic goodwill gesture',
  'Exceptional customer support case',
  'Military reserve service compensation',
  'Injury related compensation',
  'Executive management decision'
]

// Credit statuses that count as "attached" to an invoice for the purposes
// of the Single Credit Rule. A Cancelled credit was voided before export
// and does not block a new one from being created.
const BLOCKING_CREDIT_STATUSES = [
  'Pending',
  'Submitted',
  'Completed',
  'Failed',
  'Retry Pending',
  'Manual Review Required'
]

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { invoice_id, guide_id, credit_percentage, reason, internal_notes, created_by } =
    req.body || {}

  if (!invoice_id || !guide_id || !credit_percentage || !reason || !created_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  if (!CREDIT_PERCENTAGE_PRESETS.includes(Number(credit_percentage))) {
    return res.status(400).json({ error: 'invalid_credit_percentage', allowed: CREDIT_PERCENTAGE_PRESETS })
  }

  if (!VALID_REASON_CATEGORIES.includes(reason)) {
    return res.status(400).json({ error: 'invalid_reason_category', allowed: VALID_REASON_CATEGORIES })
  }

  if (!FINANCE_TABLES.CREDITS || !FINANCE_TABLES.INVOICES) {
    return res.status(500).json({ error: 'credits_or_invoices_table_not_configured' })
  }

  try {
    const invoice = await getRecord(FINANCE_TABLES.INVOICES, invoice_id)
    if (!invoice) {
      return res.status(404).json({ error: 'invoice_not_found' })
    }

    // Single Credit Rule: only one (non-cancelled) Credit per invoice.
    const existingCredits = await fetchAllRecords(FINANCE_TABLES.CREDITS, {
      filterByFormula: `{Invoice_ID} = '${invoice_id}'`
    })
    const blockingCredit = existingCredits.find((c) => BLOCKING_CREDIT_STATUSES.includes(c.Status))
    if (blockingCredit) {
      return res.status(409).json({ error: 'credit_already_exists_for_invoice', existing: blockingCredit })
    }

    // NEEDS VERIFICATION: assuming the Credit percentage applies to the
    // invoice's grand total (pre-VAT amount + VAT), since a Credit is a
    // refund-like correction against what was actually charged. Confirm
    // this against the intended accounting treatment before relying on it.
    const invoiceGrandTotal = (Number(invoice.Total_Amount) || 0) + (Number(invoice.VAT_Amount) || 0)
    const creditAmount = calculateCreditAmount(invoiceGrandTotal, Number(credit_percentage))

    const fields = {
      Guide_ID: [guide_id],
      Invoice_ID: [invoice_id],
      Credit_Percentage: Number(credit_percentage),
      Credit_Amount: creditAmount,
      Reason: reason,
      Created_By: created_by,
      Created_At: new Date().toISOString(),
      Retry_Count: 0,
      Status: 'Pending'
    }
    if (internal_notes) fields.Internal_Notes = internal_notes

    const result = await createRecord(FINANCE_TABLES.CREDITS, fields)

    if (!result.ok) {
      return res.status(500).json({ error: 'credit_create_failed', details: result.error })
    }

    if (FINANCE_TABLES.BILLING_EVENTS) {
      await createRecord(FINANCE_TABLES.BILLING_EVENTS, {
        Event_Type: 'Credit Created',
        Related_Guide_ID: [guide_id],
        Related_Invoice_ID: [invoice_id],
        Related_Credit_ID: [result.record.id],
        Amount: creditAmount,
        Timestamp: new Date().toISOString(),
        Actor: created_by
      })
    }

    await writeAuditLog({
      actor: created_by,
      module: 'Finance',
      actionType: 'Credit Created',
      targetType: 'Credit',
      targetId: result.record.id,
      afterValue: JSON.stringify(fields),
      reason
    })

    return res.status(200).json({ ok: true, credit: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
