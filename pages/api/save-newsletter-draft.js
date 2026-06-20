export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const { subject, intro, outro, tour_ids } = req.body

  try {
    await fetch(`https://api.airtable.com/v0/${baseId}/Newsletters`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          Subject: subject,
          Intro_Text: intro,
          Outro_Text: outro,
          Tours_Included: (tour_ids || []).join(','),
          Status: 'Draft',
        }
      })
    })
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
