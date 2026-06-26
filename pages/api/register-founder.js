export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, phone, invite_source } = req.body

  console.log('[register-founder] body received:', {
    name,
    email,
    phone,
    invite_source,
  })

  if (!name || !email || !phone) return res.status(400).json({ error: 'missing_fields' })

  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  const payload = {
    Guide_Name: name,
    Email: email,
    WhatsApp_Number: phone,
    Guide_Status: 'pending',
    Founder_Status: 'Founder',
    Founder_Stage: 'registered',
  }

  console.log('[register-founder] airtable payload:', payload)

  try {
    const createRes = await fetch(`https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: payload })
    })

    const rawText = await createRes.text()
    let data
    try { data = JSON.parse(rawText) } catch(e) {
      return res.status(500).json({ error: 'parse_error', detail: rawText })
    }

    if (!createRes.ok) {
      console.error('[register-founder] airtable error:', data)
      return res.status(500).json({ error: 'airtable_error', detail: data })
    }

    console.log('[register-founder] created record:', {
      id: data.id,
      Guide_Name: data.fields?.Guide_Name,
      Email: data.fields?.Email,
      WhatsApp_Number: data.fields?.WhatsApp_Number,
      Founder_Status: data.fields?.Founder_Status,
      Founder_Number: data.fields?.Founder_Number,
    })

    return res.status(200).json({
      success: true,
      founder_number: data.fields?.Founder_Number || null,
      record_id: data.id
    })
  } catch(err) {
    console.error('[register-founder] internal error:', err.message)
    return res.status(500).json({ error: 'internal_error', message: err.message })
  }
}
