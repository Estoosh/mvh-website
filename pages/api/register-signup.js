import { isBlocked } from '../../lib/blocklist-check'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const body = req.body

  // First blocking/duplicate check of any kind in this file (Control
  // Center Spec v1, Section 10.1 / 11.3). Uses the same shared
  // isBlocked() as register-founder.js and add-tour.js.
  try {
    const blockCheck = await isBlocked({ email: body.email, phone: body.whatsapp_phone })
    if (blockCheck.blocked) {
      return res.status(403).json({ error: 'blocked', message: 'לא ניתן להשלים את ההרשמה.' })
    }
  } catch (err) {
    console.error('BLOCKLIST_CHECK_FAILED', err)
    // Fail open on an unexpected error — consistent with the same
    // decision made in register-founder.js.
  }

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

  if (data.id && body.email) {
    fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, first_name: body.first_name })
    }).catch(function(err) { console.error('welcome email error:', err) })
  }

  res.status(200).json(data)
}
