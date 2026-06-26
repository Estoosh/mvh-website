export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, phone, invite_source } = req.body
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
          Profile_Status: 'incomplete',
          Is_Public: false,
          Founder_Status: 'Founder',
          Founder_Joined_Date: new Date().toISOString().split('T')[0],
          Founder_Free_Tour_Used: false,
          Founder_Email_List: true,
          Founder_Stage: 'registered',
          Invite_Source: invite_source || 'unknown',
          Signup_Source: 'founder_prelaunch',
        }
      })
    })

    const rawText = await createRes.text()
    console.log('Airtable response:', rawText)

    let data
    try {
      data = JSON.parse(rawText)
    } catch(e) {
      return res.status(500).json({ error: 'parse_error', detail: rawText })
    }

    if (!createRes.ok) {
      return res.status(500).json({ error: 'airtable_error', detail: data })
    }

    return res.status(200).json({
      success: true,
      founder_number: data.fields?.Founder_Number || null,
      record_id: data.id
    })
  } catch(err) {
    return res.status(500).json({ error: 'internal_error', message: err.message })
  }
}
