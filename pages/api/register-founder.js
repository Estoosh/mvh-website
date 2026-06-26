export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, phone } = req.body
  if (!name || !email || !phone) return res.status(400).json({ error: 'missing_fields' })

  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  try {
    const createRes = await fetch(`https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          Guide_Name: name,
          Email: email,
          WhatsApp_Number: phone,
          Guide_Status: 'pending',
          Founder_Status: 'Founder',
        }
      })
    })

    const rawText = await createRes.text()

    if (!createRes.ok) {
      return res.status(500).json({ error: 'airtable_error', detail: rawText })
    }

    const data = JSON.parse(rawText)
    return res.status(200).json({ success: true, record_id: data.id })

  } catch(err) {
    return res.status(500).json({ error: 'internal_error', message: err.message })
  }
}
