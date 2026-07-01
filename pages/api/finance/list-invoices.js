import { FINANCE_TABLES } from '../../../lib/airtable'

// Read-only. GET only. No create/update/delete logic exists in this file.
// Reads only the Invoices table (new Finance table) — does not touch
// Guides or Tours.
const AIRTABLE_API_URL = 'https://api.airtable.com/v0'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })

  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  if (!token || !baseId) {
    return res.status(500).json({ error: 'missing_airtable_config' })
  }

  if (!FINANCE_TABLES.INVOICES) {
    return res.status(500).json({ error: 'invoices_table_not_configured' })
  }

  const pageSize = Math.min(Number(req.query.limit) || 50, 100)
  const offset = req.query.offset

  try {
    const params = new URLSearchParams()
    params.set('pageSize', String(pageSize))
    params.set('sort[0][field]', 'Generated_At')
    params.set('sort[0][direction]', 'desc')
    if (offset) params.set('offset', offset)

    const response = await fetch(
      `${AIRTABLE_API_URL}/${baseId}/${FINANCE_TABLES.INVOICES}?${params.toString()}`,
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
