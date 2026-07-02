// Read-only. GET only. No create/update/delete logic exists in this file.
// Reads only the existing Tours table (read-only) — does not touch Guides
// or Signups, and never writes to Tours.
const AIRTABLE_API_URL = 'https://api.airtable.com/v0'
const TOURS_TABLE_ID = 'tbltsGvfPLMAmJ764'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })

  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!token || !baseId) {
    return res.status(500).json({ error: 'missing_airtable_config' })
  }

  const pageSize = Math.min(Number(req.query.limit) || 50, 100)
  const offset = req.query.offset

  try {
    const params = new URLSearchParams()
    params.set('pageSize', String(pageSize))
    params.set('filterByFormula', "OR({Content_Status}='Hidden',{Content_Status}='Removed')")
    params.set('sort[0][field]', 'Status_Changed_At')
    params.set('sort[0][direction]', 'desc')
    if (offset) params.set('offset', offset)

    const response = await fetch(
      `${AIRTABLE_API_URL}/${baseId}/${TOURS_TABLE_ID}?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!response.ok) {
      const details = await response.json().catch(() => ({}))
      return res.status(502).json({ error: 'airtable_fetch_failed', details })
    }

    const data = await response.json()
    const records = (data.records || []).map((r) => Object.assign({ id: r.id }, r.fields))

    return res.status(200).json({
      ok: true,
      records,
      nextOffset: data.offset || null
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
