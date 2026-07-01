import { fetchAllRecords, createRecord, FINANCE_TABLES } from '../../../lib/airtable'
import { applyBenefit, calculateInvoiceTotal, roundCurrency } from '../../../lib/finance-calc'
import { writeAuditLog } from '../../../lib/audit-log'

// Existing, Founder-Flow-owned tables. Read-only access — never written to
// by this route.
const TOURS_TABLE_ID = 'tbltsGvfPLMAmJ764'
const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'

// NEEDS VERIFICATION: the exact field name on the Guides table for the
// ID number / business number (ת"ז / ח"פ) required for the payment
// processor to match a stored card. This field's existence was flagged as
// a gap in the Finance Module Spec v1, Section 3 ("Required onboarding
// fields"). Update this constant once the real field name is confirmed.
const GUIDE_ID_NUMBER_FIELD = 'ID_Or_Business_Number'

// NEEDS VERIFICATION: the exact column layout required by Green Invoice /
// Tranzila for manual bulk-charge-by-stored-card import is not yet known
// (Finance Module Spec v1, Section 3 / 13). The CSV below is a generic,
// human-readable export containing every field the processor is expected
// to need. Column names/order must be revised once the real import
// template is obtained — do not treat this as the final file format.
function buildCsv(rows) {
  const headers = [
    'Guide_Full_Name',
    'Phone',
    'Email',
    'Address',
    'ID_Or_Business_Number',
    'Invoice_ID',
    'Billing_Period',
    'Amount_Pre_VAT',
    'VAT_Amount',
    'Total_Amount'
  ]

  const escape = (value) => {
    const str = value === undefined || value === null ? '' : String(value)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }

  const lines = [headers.join(',')]
  rows.forEach((row) => {
    lines.push(headers.map((h) => escape(row[h])).join(','))
  })
  return lines.join('\n')
}

// Forward billing: this snapshot always charges the upcoming full calendar
// month, per "MVH bills forward" (Section 11 of the v1.0 methodology).
// First-month proration (Section 8) is a separate, not-yet-wired concern —
// this route does not apply it. See lib/finance-calc.js for the proration
// functions when that gets connected.
function nextBillingPeriod() {
  const now = new Date()
  const year = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
  const month = now.getMonth() === 11 ? 0 : now.getMonth() + 1
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { generated_by } = req.body || {}
  if (!generated_by) {
    return res.status(400).json({ error: 'missing_generated_by' })
  }

  if (!FINANCE_TABLES.INVOICES) {
    return res.status(500).json({ error: 'invoices_table_not_configured' })
  }

  try {
    const guides = await fetchAllRecords(GUIDES_TABLE_ID)
    // Existing schema links Tours to Guides by Guide_Name text match, not
    // by a linked record ID (confirmed in pages/api/get-guide-tours.js and
    // pages/api/add-tour.js). This is an existing Founder-Flow schema
    // characteristic, not something changed here — but it means this join
    // is only as reliable as Guide_Name being an exact, consistent match.
    const guidesByName = new Map(guides.map((g) => [g.Guide_Name, g]))

    const tours = await fetchAllRecords(TOURS_TABLE_ID)
    const activeTours = tours.filter((t) => t.Tour_Status === 'paid')

    let activeBenefits = []
    if (FINANCE_TABLES.BENEFITS) {
      activeBenefits = await fetchAllRecords(FINANCE_TABLES.BENEFITS, {
        filterByFormula: `{Benefit_Status} = 'Active'`
      })
    }
    const benefitByTourId = new Map()
    activeBenefits.forEach((b) => {
      const tourId = Array.isArray(b.Tour_ID) ? b.Tour_ID[0] : b.Tour_ID
      if (tourId) benefitByTourId.set(tourId, b)
    })

    const unmatchedTours = []
    const lineItemsByGuideId = new Map()

    activeTours.forEach((tour) => {
      const guide = guidesByName.get(tour.Guide_Name)
      if (!guide) {
        unmatchedTours.push({ tour_id: tour.id, guide_name: tour.Guide_Name })
        return
      }

      const basePrice = Number(tour.Price_Per_Person) || 0
      const benefit = benefitByTourId.get(tour.id)
      const chargedAmount = benefit
        ? applyBenefit(basePrice, Number(benefit.Discount_Percentage) || 0)
        : roundCurrency(basePrice)

      if (!lineItemsByGuideId.has(guide.id)) {
        lineItemsByGuideId.set(guide.id, { guide, lines: [] })
      }
      lineItemsByGuideId.get(guide.id).lines.push({
        tour_id: tour.id,
        tour_title: tour.Tour_Title,
        base_price: basePrice,
        benefit_applied: benefit ? benefit.Benefit_Type : null,
        discount_percentage: benefit ? Number(benefit.Discount_Percentage) || 0 : 0,
        charged_amount: chargedAmount
      })
    })

    const period = nextBillingPeriod()
    const batchReference = `billing-file-${new Date().toISOString()}`
    const invoices = []
    const csvRows = []

    for (const { guide, lines } of lineItemsByGuideId.values()) {
      const amounts = lines.map((l) => l.charged_amount)
      const { preVatAmount, vatAmount, totalAmount } = calculateInvoiceTotal(amounts)

      const invoiceFields = {
        Guide_ID: [guide.id],
        Billing_Period_Start: period.start,
        Billing_Period_End: period.end,
        Line_Items: JSON.stringify(lines),
        Total_Amount: preVatAmount,
        VAT_Amount: vatAmount,
        Generated_At: new Date().toISOString(),
        Generated_By: generated_by,
        Export_File_Reference: batchReference,
        Payment_Status: 'Not Yet Marked'
      }

      const result = await createRecord(FINANCE_TABLES.INVOICES, invoiceFields)
      if (!result.ok) {
        return res.status(500).json({ error: 'invoice_create_failed', guide_id: guide.id, details: result.error })
      }

      invoices.push(result.record)

      if (FINANCE_TABLES.BILLING_EVENTS) {
        await createRecord(FINANCE_TABLES.BILLING_EVENTS, {
          Event_Type: 'Invoice Generated',
          Related_Guide_ID: [guide.id],
          Related_Invoice_ID: [result.record.id],
          Amount: totalAmount,
          Timestamp: new Date().toISOString(),
          Actor: generated_by
        })
      }

      // Only guides with an actual amount due need a card charged.
      // Zero-amount invoices (e.g. fully-FOC guides) are still created
      // above for record-keeping and reporting, but are not included in
      // the file sent to the payment processor.
      if (preVatAmount > 0) {
        csvRows.push({
          Guide_Full_Name: guide.Guide_Name,
          Phone: guide.Phone_Number,
          Email: guide.Email,
          Address: guide.Street_Address,
          ID_Or_Business_Number: guide[GUIDE_ID_NUMBER_FIELD] || '',
          Invoice_ID: result.record.id,
          Billing_Period: `${period.start} - ${period.end}`,
          Amount_Pre_VAT: preVatAmount,
          VAT_Amount: vatAmount,
          Total_Amount: totalAmount
        })
      }
    }

    await writeAuditLog({
      actor: generated_by,
      module: 'Finance',
      actionType: 'Billing File Generated',
      targetType: 'Invoice',
      afterValue: JSON.stringify({ batchReference, invoiceCount: invoices.length, unmatchedTours }),
      reason: `Batch ${batchReference}`
    })

    return res.status(200).json({
      ok: true,
      batchReference,
      invoicesCreated: invoices.length,
      guidesInCsv: csvRows.length,
      unmatchedTours,
      csvContent: buildCsv(csvRows)
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
