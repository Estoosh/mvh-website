export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { guide_id, action } = req.body
  if (!guide_id || !action) return res.status(400).json({ error: 'Missing fields' })
  const status = action === 'approve' ? 'active' : 'rejected'
  try {
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID
    const r = await fetch(`https://api.airtable.com/v0/${baseId}/tblGuides/${guide_id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { Guide_Status: status } })
    })
    const data = await r.json()
    return res.status(200).json({ success: true, status, record: data })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
