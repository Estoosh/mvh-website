import { fetchAllRecords, FINANCE_TABLES } from '../../../../lib/airtable'
import { applyBenefit, roundCurrency, calculateInvoiceTotal } from '../../../../lib/finance-calc'

// Read-only. GET only. This is a PREVIEW of what generate-billing-file.js
// would produce — it never creates Invoice, Billing_Events, or Audit_Log
// records. Use generate-billing-file.js when you actually want to commit
// a billing run.
const TOURS_TABLE_ID = 'tbltsGvfPLMAmJ764'
const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })

  try {
    const guides = await fetchAllRecords(GUIDES_TABLE_ID)
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

    const preview = []
    let grandPreVat = 0
    let grandVat = 0

    for (const { guide, lines } of lineItemsByGuideId.values()) {
      const amounts = lines.map((l) => l.charged_amount)
      const { preVatAmount, vatAmount, totalAmount } = calculateInvoiceTotal(amounts)
      grandPreVat = roundCurrency(grandPreVat + preVatAmount)
      grandVat = roundCurrency(grandVat + vatAmount)

      preview.push({
        guide_id: guide.id,
        guide_name: guide.Guide_Name,
        tour_count: lines.length,
        lines,
        pre_vat_amount: preVatAmount,
        vat_amount: vatAmount,
        total_amount: totalAmount
      })
    }

    return res.status(200).json({
      ok: true,
      guideCount: preview.length,
      grandTotalPreVat: grandPreVat,
      grandTotalVat: grandVat,
      grandTotal: roundCurrency(grandPreVat + grandVat),
      unmatchedTours,
      guides: preview
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
