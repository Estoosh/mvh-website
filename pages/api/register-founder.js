import { isBlocked } from '../../lib/blocklist-check'

const GUIDES_TABLE = 'tblsJ5Ok1yPSgtvSj'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' })
  }

  const { email, phone } = req.body || {}

  const cleanEmail = String(email || '').trim().toLowerCase()
  const cleanPhone = String(phone || '').replace(/\D/g, '')

  if (!cleanEmail || cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, error: 'missing_or_invalid_fields' })
  }

  // Early UX check only — this is NOT the real enforcement point. The
  // actual enforcement happens in add-tour.js (createFounderFlow) right
  // before the Guide record is created. See Control Center Spec v1,
  // Section 11.3.
  try {
    const blockCheck = await isBlocked({ email: cleanEmail, phone: cleanPhone })
    if (blockCheck.blocked) {
      return res.status(403).json({
        success: false,
        error: 'blocked',
        message: 'לא ניתן להשלים את ההרשמה.'
      })
    }
  } catch (err) {
    console.error('BLOCKLIST_CHECK_FAILED', err)
    // Fail open on an unexpected error here — this is only the early UX
    // check; the real gate in add-tour.js still applies.
  }

  const token =
    process.env.AIRTABLE_TOKEN ||
    process.env.AIRTABLE_API_KEY ||
    process.env.AIRTABLE_ACCESS_TOKEN

  const baseId = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE

  if (!token || !baseId) {
    return res.status(500).json({ success: false, error: 'missing_airtable_config' })
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  try {
    const formula =
      `AND({Founder_Status}="Founder",OR(LOWER({Email})="${escapeFormula(cleanEmail)}",{WhatsApp_Number}="${escapeFormula(cleanPhone)}"))`

    const url =
      `https://api.airtable.com/v0/${baseId}/${GUIDES_TABLE}` +
      `?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`

    const response = await fetch(url, { headers })
    const data = await response.json()

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: 'airtable_search_failed',
        airtable: data
      })
    }

    if (data.records && data.records.length > 0) {
      const existing = data.records[0]

      return res.status(200).json({
        success: false,
        existing_founder: true,
        error: 'founder_exists',
        founder_number: existing.fields?.Founder_Number || null,
        guide: {
          id: existing.id,
          ...existing.fields,
          Guide_bio: existing.fields?.Guide_bio || ''
        },
        message: `אתם כבר רשומים כ־Founder מספר ${existing.fields?.Founder_Number || ''}. נשלח אליכם עדכון לקראת ההשקה.`
      })
    }

    return res.status(200).json({
      success: true,
      existing_founder: false
    })
  } catch (err) {
    console.error('REGISTER_FOUNDER_CHECK_FAILED', err)

    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: err.message
    })
  }
}

function escapeFormula(value) {
  return String(value || '').replace(/"/g, '\\"')
}
