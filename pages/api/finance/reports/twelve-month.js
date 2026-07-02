import { fetchAllRecords, FINANCE_TABLES } from '../../../../lib/airtable'
import { roundCurrency } from '../../../../lib/finance-calc'

// Read-only. GET only. Reads only Invoices and Credits (Finance tables) —
// does not touch Guides or Tours.
//
// NEEDS VERIFICATION: "amount charged" per month is computed as the
// invoice's grand total (pre-VAT + VAT) — i.e. what was actually charged
// to the customer — consistent with the same assumption used in
// create-credit.js and remove-tour-refund.js. Confirm this matches the
// intended reporting definition.

function monthKey(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function lastTwelveMonthKeys() {
  const keys = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })

  if (!FINANCE_TABLES.INVOICES) {
    return res.status(500).json({ error: 'invoices_table_not_configured' })
  }

  try {
    const invoices = await fetchAllRecords(FINANCE_TABLES.INVOICES)

    let credits = []
    if (FINANCE_TABLES.CREDITS) {
      credits = await fetchAllRecords(FINANCE_TABLES.CREDITS)
    }

    const creditTotalByGuideId = new Map()
    credits.forEach((c) => {
      const guideId = Array.isArray(c.Guide_ID) ? c.Guide_ID[0] : c.Guide_ID
      if (!guideId) return
      const amount = Number(c.Credit_Amount) || 0
      creditTotalByGuideId.set(guideId, (creditTotalByGuideId.get(guideId) || 0) + amount)
    })

    const invoicesByGuideId = new Map()
    invoices.forEach((inv) => {
      const guideId = Array.isArray(inv.Guide_ID) ? inv.Guide_ID[0] : inv.Guide_ID
      if (!guideId) return
      if (!invoicesByGuideId.has(guideId)) invoicesByGuideId.set(guideId, [])
      invoicesByGuideId.get(guideId).push(inv)
    })

    const monthKeys = lastTwelveMonthKeys()
    const rows = []

    for (const [guideId, guideInvoices] of invoicesByGuideId.entries()) {
      const monthly = {}
      monthKeys.forEach((k) => { monthly[k] = { productCount: 0, amountCharged: 0 } })

      let lifetimeGross = 0
      let payingMonthsCount = 0

      guideInvoices.forEach((inv) => {
        const preVat = Number(inv.Total_Amount) || 0
        const vat = Number(inv.VAT_Amount) || 0
        const grandTotal = roundCurrency(preVat + vat)
        lifetimeGross = roundCurrency(lifetimeGross + grandTotal)

        if (grandTotal > 0) payingMonthsCount += 1

        const key = inv.Billing_Period_Start ? monthKey(inv.Billing_Period_Start) : null
        if (key && monthly[key]) {
          let productCount = 0
          try {
            productCount = JSON.parse(inv.Line_Items || '[]').length
          } catch (e) {
            productCount = 0
          }
          monthly[key].productCount += productCount
          monthly[key].amountCharged = roundCurrency(monthly[key].amountCharged + grandTotal)
        }
      })

      const totalCredits = creditTotalByGuideId.get(guideId) || 0
      const lifetimeNetEarnings = roundCurrency(lifetimeGross - totalCredits)

      rows.push({
        guide_id: guideId,
        months: monthKeys.map((k) => Object.assign({ month: k }, monthly[k])),
        paying_tenure_months: payingMonthsCount,
        lifetime_gross_earnings: lifetimeGross,
        lifetime_credits_issued: roundCurrency(totalCredits),
        lifetime_net_earnings: lifetimeNetEarnings
      })
    }

    return res.status(200).json({ ok: true, monthKeys, rows })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
