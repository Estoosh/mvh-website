import { fetchAllRecords, FINANCE_TABLES } from '../../../../lib/airtable'
import { roundCurrency } from '../../../../lib/finance-calc'

// Read-only. GET only. Reads Guides (existing, read-only) and Invoices
// (Finance table) — never writes anywhere.
//
// NEEDS VERIFICATION / assumptions made, flagged rather than guessed
// silently:
// 1. "Registration date" uses each Guide record's Airtable createdTime
//    metadata, since no dedicated Registration_Date field was found on
//    the Guides table in the codebase.
// 2. "First PAID tour" is proxied by the guide's earliest Invoice that has
//    a non-zero grand total (an invoice only exists once a billing run has
//    included that guide) — not the tour's own creation timestamp, since
//    tours aren't individually timestamped for when they started being
//    billed. FOC-only guides never produce a non-zero invoice, so they are
//    correctly excluded without any extra filtering logic.
const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'
const AIRTABLE_API_URL = 'https://api.airtable.com/v0'

async function fetchGuidesWithCreatedTime() {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!token || !baseId) throw new Error('missing_airtable_config')

  let records = []
  let offset = null
  do {
    const params = new URLSearchParams()
    params.set('pageSize', '100')
    if (offset) params.set('offset', offset)

    const response = await fetch(`${AIRTABLE_API_URL}/${baseId}/${GUIDES_TABLE_ID}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('airtable_fetch_failed')

    const data = await response.json()
    records = records.concat(data.records || [])
    offset = data.offset
  } while (offset)

  return records.map((r) => ({ id: r.id, createdTime: r.createdTime, Guide_Name: r.fields.Guide_Name }))
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })

  if (!FINANCE_TABLES.INVOICES) {
    return res.status(500).json({ error: 'invoices_table_not_configured' })
  }

  try {
    const guides = await fetchGuidesWithCreatedTime()
    const invoices = await fetchAllRecords(FINANCE_TABLES.INVOICES)

    const firstPaidDateByGuideId = new Map()
    invoices.forEach((inv) => {
      const guideId = Array.isArray(inv.Guide_ID) ? inv.Guide_ID[0] : inv.Guide_ID
      if (!guideId) return
      const grandTotal = roundCurrency((Number(inv.Total_Amount) || 0) + (Number(inv.VAT_Amount) || 0))
      if (grandTotal <= 0) return
      if (!inv.Generated_At) return

      const existing = firstPaidDateByGuideId.get(guideId)
      if (!existing || new Date(inv.Generated_At) < new Date(existing)) {
        firstPaidDateByGuideId.set(guideId, inv.Generated_At)
      }
    })

    const potentialCustomers = guides.length
    let payingCustomers = 0
    let totalConversionDays = 0
    const conversions = []

    guides.forEach((guide) => {
      const firstPaidDate = firstPaidDateByGuideId.get(guide.id)
      if (!firstPaidDate) return

      payingCustomers += 1
      const days = Math.max(0, Math.round((new Date(firstPaidDate) - new Date(guide.createdTime)) / (1000 * 60 * 60 * 24)))
      totalConversionDays += days
      conversions.push({ guide_id: guide.id, guide_name: guide.Guide_Name, days_to_convert: days })
    })

    const averageConversionDays = payingCustomers > 0 ? Math.round(totalConversionDays / payingCustomers) : null

    return res.status(200).json({
      ok: true,
      potentialCustomers,
      payingCustomers,
      conversionRate: potentialCustomers > 0 ? roundCurrency((payingCustomers / potentialCustomers) * 100) : 0,
      averageConversionDays,
      conversions
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
