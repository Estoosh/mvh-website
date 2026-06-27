export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' })
  }

  const { name, email, phone, invite_source } = req.body || {}

  const cleanName = typeof name === 'string' ? name.trim() : ''
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const cleanPhone = typeof phone === 'string' ? phone.trim() : ''
  const cleanInviteSource = typeof invite_source === 'string' ? invite_source.trim() : 'unknown'

  if (!cleanName || !cleanEmail || !cleanPhone) {
    return res.status(400).json({
      success: false,
      error: 'missing_fields'
    })
  }

  const token =
    process.env.AIRTABLE_TOKEN ||
    process.env.AIRTABLE_API_KEY ||
    process.env.AIRTABLE_ACCESS_TOKEN

  const baseId =
    process.env.AIRTABLE_BASE_ID ||
    process.env.AIRTABLE_BASE

  const guidesTable = 'tblsJ5Ok1yPSgtvSj'

  if (!token || !baseId) {
    return res.status(500).json({
      success: false,
      error: 'missing_airtable_config',
      hasToken: Boolean(token),
      hasBaseId: Boolean(baseId)
    })
  }

  const payload = {
    Guide_Name: cleanName,
    Email: cleanEmail,
    WhatsApp_Number: cleanPhone,
    Guide_Status: 'pending',
    Founder_Status: 'Founder',
    Founder_Stage: 'registered',
    Guide_bio: ''
  }

  try {
    const createRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${guidesTable}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: payload })
      }
    )

    const data = await createRes.json()

    if (!createRes.ok) {
      return res.status(502).json({
        success: false,
        error: 'airtable_create_failed',
        airtable: data
      })
    }

    return res.status(200).json({
      success: true,
      record_id: data.id,
      founder_number: data.fields?.Founder_Number || null,
      guide: {
        id: data.id,
        ...data.fields
      }
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: err.message
    })
  }
}
