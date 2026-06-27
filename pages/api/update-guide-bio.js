export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { record_id, bio } = req.body

  if (!record_id || !bio || !String(bio).trim()) {
    return res.status(400).json({ error: 'missing_record_id_or_bio' })
  }

  const token = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const guidesTable = 'tblsJ5Ok1yPSgtvSj'

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${guidesTable}/${record_id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            Guide_Bio: String(bio).trim(),
            Profile_Status: 'complete'
          }
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[update-guide-bio] Airtable error:', data)
      return res.status(502).json({ error: 'airtable_update_failed', details: data })
    }

    return res.status(200).json({
      success: true,
      record_id: data.id,
      Guide_Bio: data.fields?.Guide_Bio || ''
    })
  } catch (err) {
    console.error('[update-guide-bio] internal error:', err)
    return res.status(500).json({ error: 'internal_error' })
  }
}
