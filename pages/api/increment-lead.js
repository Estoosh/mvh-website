export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const { tour_id, current_count } = req.body

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764/${tour_id}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { Lead_Count: (Number(current_count) || 0) + 1 } })
      }
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
