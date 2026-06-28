export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_ACCESS_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE
  const guidesTable = 'tblsJ5Ok1yPSgtvSj'

  if (!token || !baseId) {
    return res.status(500).json({ found: false, error: 'missing_airtable_config' })
  }

  try {
    const recordId = req.query.record_id

    if (recordId) {
      const r = await fetch(
        `https://api.airtable.com/v0/${baseId}/${guidesTable}/${recordId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const d = await r.json()

      if (!r.ok || !d.id) {
        return res.status(200).json({ found: false, error: 'record_not_found' })
      }

      return res.status(200).json({
        found: true,
        airtable_id: d.id,
        guide: {
          id: d.id,
          ...d.fields,
          Guide_bio: d.fields?.Guide_bio || '',
          WhatsApp_Number: d.fields?.WhatsApp_Number || ''
        }
      })
    }

    const clerkId = req.query.clerk_id
    const email = req.query.email

    if (clerkId) {
      const formula = `{Clerk_ID}="${escapeFormula(clerkId)}"`
      const r = await fetch(
        `https://api.airtable.com/v0/${baseId}/${guidesTable}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const d = await r.json()

      if (d.records && d.records.length > 0) {
        const record = d.records[0]
        return res.status(200).json({
          found: true,
          airtable_id: record.id,
          guide: {
            id: record.id,
            ...record.fields,
            Guide_bio: record.fields?.Guide_bio || '',
            WhatsApp_Number: record.fields?.WhatsApp_Number || ''
          }
        })
      }
    }

    if (!email) return res.status(200).json({ found: false })

    const emailFormula = `LOWER({Email})="${escapeFormula(String(email).toLowerCase())}"`
    const r = await fetch(
      `https://api.airtable.com/v0/${baseId}/${guidesTable}?filterByFormula=${encodeURIComponent(emailFormula)}&maxRecords=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    const d = await r.json()

    if (!d.records || d.records.length === 0) {
      return res.status(200).json({ found: false })
    }

    const record = d.records[0]

    if (clerkId) {
      await fetch(
        `https://api.airtable.com/v0/${baseId}/${guidesTable}/${record.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields: { Clerk_ID: clerkId } })
        }
      )
    }

    return res.status(200).json({
      found: true,
      airtable_id: record.id,
      guide: {
        id: record.id,
        ...record.fields,
        Guide_bio: record.fields?.Guide_bio || '',
        WhatsApp_Number: record.fields?.WhatsApp_Number || ''
      }
    })
  } catch (err) {
    return res.status(500).json({ found: false, error: 'internal_error', message: err.message })
  }
}

function escapeFormula(value) {
  return String(value || '').replace(/"/g, '\\"')
}
