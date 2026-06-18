export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const body = req.body

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/Signups`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          Clerk_ID: body.clerk_id,
          First_Name: body.first_name,
          Last_Name: body.last_name,
          Email: body.email,
          WhatsApp_Phone: body.whatsapp_phone,
          WhatsApp_Group_Consent: !!body.whatsapp_group_consent,
          Regions_Interest: (body.regions || []).join(', '),
          Tour_Types_Interest: (body.tour_types || []).join(', '),
          Travel_With: (body.travel_with || []).join(', '),
          Signup_Date: new Date().toISOString().split('T')[0],
        }
      })
    }
  )
  const data = await response.json()
  res.status(200).json(data)
}
