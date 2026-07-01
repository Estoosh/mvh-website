import { getRecord, fetchAllRecords, createRecord, FINANCE_TABLES } from '../../../lib/airtable'
import { roundCurrency } from '../../../lib/finance-calc'
import { writeAuditLog } from '../../../lib/audit-log'

// The two moderation removal reasons, per Finance Module Spec v1, Section 5.
const VALID_MODERATION_REASONS = [
  'Content inconsistent with community values',
  'Content reported as misleading'
]

// NEEDS VERIFICATION / DECISION: the v1.0 methodology's "Valid Credit
// Scenarios" list does not explicitly include moderation removals. This
// reason value is added here to make the refund representable as a
// Credit, but was not in the original taxonomy — confirm this is the
// intended treatment.
const MODERATION_CREDIT_REASON = 'Tour removed by moderation (community values / misleading content)'

// Credit statuses that block a new Credit on the same invoice, same rule
// as create-credit.js.
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

  const { tour_id, invoice_id, guide_id, moderation_reason, notes, created_by } = req.body || {}

  if (!tour_id || !invoice_id || !guide_id || !moderation_reason || !created_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  if (!VALID_MODERATION_REASONS.includes(moderation_reason)) {
    return res.status(400).json({ error: 'invalid_moderation_reason', allowed: VALID_MODERATION_REASONS })
  }

  if (!FINANCE_TABLES.INVOICES) {
    return res.status(500).json({ error: 'invoices_table_not_configured' })
  }

  try {
    const invoice = await getRecord(FINANCE_TABLES.INVOICES, invoice_id)
    if (!invoice) {
      return res.status(404).json({ error: 'invoice_not_found' })
    }

    // Refund scope is the last billed cycle only (Section 5) — we read the
    // exact amount that was actually charged for this tour on this
    // specific invoice, not the tour's current price.
    let lineItems = []
    try {
      lineItems = JSON.parse(invoice.Line_Items || '[]')
    } catch (e) {
      return res.status(500).json({ error: 'invoice_line_items_unparseable' })
    }

    const line = lineItems.find((l) => l.tour_id === tour_id)
    if (!line) {
      return res.status(404).json({ error: 'tour_not_found_on_invoice' })
    }

    const tourAmount = Number(line.charged_amount) || 0

    await writeAuditLog({
      actor: created_by,
      module: 'Moderation',
      actionType: 'Tour Removed',
      targetType: 'Tour',
      targetId: tour_id,
      reason: moderation_reason,
      afterValue: notes || ''
    })

    if (FINANCE_TABLES.BILLING_EVENTS) {
      await createRecord(FINANCE_TABLES.BILLING_EVENTS, {
        Event_Type: 'Tour Removed - Refund Issued',
        Related_Guide_ID: [guide_id],
        Related_Tour_ID: [tour_id],
        Related_Invoice_ID: [invoice_id],
        Amount: tourAmount,
        Timestamp: new Date().toISOString(),
        Actor: created_by,
        Notes: moderation_reason
      })
    }

    // Nothing was actually charged for this tour on this invoice (e.g. it
    // was already fully covered by a Benefit) — no Credit needed.
    if (tourAmount <= 0) {
      return res.status(200).json({ ok: true, refundIssued: false, amount: 0 })
    }

    if (!FINANCE_TABLES.CREDITS) {
      return res.status(500).json({ error: 'credits_table_not_configured' })
    }

    const existingCredits = await fetchAllRecords(FINANCE_TABLES.CREDITS, {
      filterByFormula: `{Invoice_ID} = '${invoice_id}'`
    })
    const blockingCredit = existingCredits.find((c) => BLOCKING_CREDIT_STATUSES.includes(c.Status))
    if (blockingCredit) {
      return res.status(409).json({
        error: 'credit_already_exists_for_invoice',
        existing: blockingCredit,
        note: 'A Credit already exists on this invoice for another reason. This refund needs manual handling.'
      })
    }

    const invoiceGrandTotal = (Number(invoice.Total_Amount) || 0) + (Number(invoice.VAT_Amount) || 0)
    const derivedPercentage = invoiceGrandTotal > 0
      ? roundCurrency((tourAmount / invoiceGrandTotal) * 100)
      : 0

    const creditFields = {
      Guide_ID: [guide_id],
      Invoice_ID: [invoice_id],
      Credit_Percentage: derivedPercentage,
      Credit_Amount: tourAmount,
      Reason: MODERATION_CREDIT_REASON,
      Created_By: created_by,
      Created_At: new Date().toISOString(),
      Retry_Count: 0,
      Status: 'Pending'
    }
    if (notes) creditFields.Internal_Notes = notes

    const result = await createRecord(FINANCE_TABLES.CREDITS, creditFields)
    if (!result.ok) {
      return res.status(500).json({ error: 'credit_create_failed', details: result.error })
    }

    return res.status(200).json({ ok: true, refundIssued: true, amount: tourAmount, credit: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
