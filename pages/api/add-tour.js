export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const token = process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_ACCESS_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE
  const body = req.body || {}

  if (!token || !baseId) {
    return res.status(500).json({ error: 'missing_airtable_config' })
  }

  const isFounder = body.founder === true || body.founder === 'true'

  const fields = {
    Tour_Title: body.title || '',
    Tour_Teaser: body.teaser || '',
    Tour_Story: body.story || '',
    Tour_Guide_Context: body.guide_context || '',
    Price_Per_Person: Number(body.price) || 0,
    Duration_Hours: Number(body.duration) || 0,
    Cities_Tags: body.cities || '',
    Min_Age: Number(body.min_age) || 0,
    Meeting_Point_Waze: body.meeting_point || '',
    Tour_Status: isFounder ? 'founder_free' : (body.collab_code ? 'collab' : 'paid'),
    Lead_Count: 0,
    Guide_Name: body.guide_name || '',
    Tour_Images: body.image_urls ? body.image_urls.join('|') : '',
    WhatsApp_Number: body.whatsapp_number || '',
    Historical_Period: body.historical_periods || [],
    Is_Public: false
  }

  if (body.entrance_fee_included) {
    fields.Entrance_Fee_Included = true
    fields.Entrance_Fee_Amount = Number(body.entrance_fee_amount) || 0
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(502).json({ error: 'airtable_create_tour_failed', airtable: data })
    }

    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: 'internal_error', message: err.message })
  }
}
