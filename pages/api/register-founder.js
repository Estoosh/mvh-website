export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' })
  }

  const { name, email, phone, invite_source } = req.body || {}

  const cleanName = typeof name === 'string' ? name.trim() : ''
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const cleanPhone = String(phone || '').replace(/\D/g, '')
  const cleanInviteSource = typeof invite_source === 'string' ? invite_source.trim() : 'unknown'

  if (!cleanName || !cleanEmail || cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, error: 'missing_or_invalid_fields' })
  }

  const token = process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_ACCESS_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE
  const guidesTable = 'tblsJ5Ok1yPSgtvSj'

  if (!token || !baseId) {
    return res.status(500).json({ success: false, error: 'missing_airtable_config' })
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  try {
    const formula = `OR(LOWER({Email})="${escapeFormula(cleanEmail)}",{WhatsApp_Number}="${escapeFormula(cleanPhone)}")`
    const searchUrl =
      `https://api.airtable.com/v0/${baseId}/${guidesTable}` +
      `?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`

    const searchRes = await fetch(searchUrl, { headers })
    const searchData = await searchRes.json()

    if (!searchRes.ok) {
      return res.status(502).json({ success: false, error: 'airtable_search_failed', airtable: searchData })
    }

    if (searchData.records && searchData.records.length > 0) {
      const existing = searchData.records[0]

      return res.status(200).json({
        success: false,
        error: 'founder_exists',
        existing_founder: true,
        record_id: existing.id,
        founder_number: existing.fields?.Founder_Number || null,
        guide: {
          id: existing.id,
          ...existing.fields,
          Guide_bio: existing.fields?.Guide_bio || ''
        },
        message: 'המייל או מספר הטלפון כבר קיימים במערכת.'
      })
    }

    const payload = {
      Guide_Name: cleanName,
      Email: cleanEmail,
      WhatsApp_Number: cleanPhone,
      Guide_Status: 'pending',
      Founder_Status: 'Founder',
      Founder_Stage: 'registered',
      Invite_Source: cleanInviteSource,
      Guide_bio: '',
      Is_Public: false
    }

    const createRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${guidesTable}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ fields: payload })
      }
    )

    const data = await createRes.json()

    if (!createRes.ok) {
      return res.status(502).json({ success: false, error: 'airtable_create_failed', airtable: data })
    }

    return res.status(200).json({
      success: true,
      existing_founder: false,
      record_id: data.id,
      founder_number: data.fields?.Founder_Number || null,
      guide: {
        id: data.id,
        ...data.fields,
        Guide_bio: data.fields?.Guide_bio || ''
      }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'internal_error', message: err.message })
  }
}

function escapeFormula(value) {
  return String(value || '').replace(/"/g, '\\"')
}
