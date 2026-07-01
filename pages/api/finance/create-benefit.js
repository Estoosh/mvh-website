import { fetchAllRecords, createRecord, FINANCE_TABLES } from '../../../lib/airtable'
import { writeAuditLog } from '../../../lib/audit-log'

// Benefit_Type values that always carry a fixed 100% / lifetime / no-end-date
// configuration, per the "Founder Benefit Preset" and "Podcast Benefit
// Preset" sections of the v1.0 methodology.
const LIFETIME_PRESET_TYPES = ['Founder', 'Podcast']

const VALID_BENEFIT_TYPES = [
  'Founder',
  'Podcast',
  'Strategic Partner',
  'Promotional Campaign',
  'Other'
]

// Benefits never become active immediately — they take effect on the next
// billing cycle, which always begins on the 1st of the following month
// ("Benefit Activation Date" section of the v1.0 methodology).
function nextBillingCycleStart() {
  const now = new Date()
  const year = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
  const month = now.getMonth() === 11 ? 0 : now.getMonth() + 1
  return new Date(year, month, 1).toISOString().split('T')[0]
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const {
    tour_id,
    guide_id,
    discount_percentage,
    benefit_type,
    end_date,
    notes,
    created_by
  } = req.body || {}

  if (!tour_id || !guide_id || !benefit_type || !created_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  if (!VALID_BENEFIT_TYPES.includes(benefit_type)) {
    return res.status(400).json({ error: 'invalid_benefit_type' })
  }

  const isLifetimePreset = LIFETIME_PRESET_TYPES.includes(benefit_type)

  const resolvedDiscountPercentage = isLifetimePreset ? 100 : Number(discount_percentage)
  if (
    !isLifetimePreset &&
    (Number.isNaN(resolvedDiscountPercentage) ||
      resolvedDiscountPercentage <= 0 ||
      resolvedDiscountPercentage > 100)
  ) {
    return res.status(400).json({ error: 'invalid_discount_percentage' })
  }

  if (!FINANCE_TABLES.BENEFITS) {
    return res.status(500).json({ error: 'benefits_table_not_configured' })
  }

  try {
    // Enforce: a Tour may only have one active benefit at any given time
    // ("Single Active Benefit Rule").
    const existingActive = await fetchAllRecords(FINANCE_TABLES.BENEFITS, {
      filterByFormula: `AND({Tour_ID} = '${tour_id}', {Benefit_Status} = 'Active')`
    })

    if (existingActive.length > 0) {
      return res.status(409).json({ error: 'active_benefit_exists', existing: existingActive[0] })
    }

    const fields = {
      Tour_ID: [tour_id],
      Guide_ID: [guide_id],
      Discount_Percentage: resolvedDiscountPercentage,
      Start_Date: nextBillingCycleStart(),
      Lifetime_Benefit: isLifetimePreset ? true : !end_date,
      Benefit_Type: benefit_type,
      Benefit_Status: 'Active',
      Created_By: created_by,
      Created_At: new Date().toISOString()
    }

    if (!isLifetimePreset && end_date) fields.End_Date = end_date
    if (notes) fields.Notes = notes

    const result = await createRecord(FINANCE_TABLES.BENEFITS, fields)

    if (!result.ok) {
      return res.status(500).json({ error: 'benefit_create_failed', details: result.error })
    }

    if (FINANCE_TABLES.BILLING_EVENTS) {
      await createRecord(FINANCE_TABLES.BILLING_EVENTS, {
        Event_Type: 'Benefit Assigned',
        Related_Guide_ID: [guide_id],
        Related_Tour_ID: [tour_id],
        Related_Benefit_ID: [result.record.id],
        Timestamp: new Date().toISOString(),
        Actor: created_by
      })
    }

    await writeAuditLog({
      actor: created_by,
      module: 'Finance',
      actionType: 'Benefit Assigned',
      targetType: 'Benefit',
      targetId: result.record.id,
      afterValue: JSON.stringify(fields),
      reason: notes
    })

    return res.status(200).json({ ok: true, benefit: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
