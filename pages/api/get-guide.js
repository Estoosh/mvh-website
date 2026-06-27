export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  console.log('[get-guide] query:', {
    clerk_id: req.query.clerk_id,
    email: req.query.email,
    record_id: req.query.record_id,
  })

  // חיפוש לפי record_id — מייסדים שמגיעים מ-/founders
  const recordId = req.query.record_id
  if (recordId) {
    const r = await fetch(
      `https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj/${recordId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const d = await r.json()
    if (d.id) {
      console.log('[get-guide] found by record_id:', {
        id: d.id,
        Guide_Name: d.fields?.Guide_Name,
        WhatsApp_Number: d.fields?.WhatsApp_Number,
      })
      return res.status(200).json({ found: true, guide: d.fields, airtable_id: d.id })
    }
    return res.status(200).json({ found: false })
  }

  // חיפוש לפי Clerk_ID
  const clerkId = req.query.clerk_id
  if (clerkId) {
    const r1 = await fetch(
      `https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj?filterByFormula={Clerk_ID}="${clerkId}"`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const d1 = await r1.json()
    if (d1.records && d1.records.length > 0) {
      const record = d1.records[0]
      console.log('[get-guide] found by Clerk_ID:', {
        id: record.id,
        Guide_Name: record.fields?.Guide_Name,
        WhatsApp_Number: record.fields?.WhatsApp_Number,
      })
      return res.status(200).json({ found: true, guide: record.fields, airtable_id: record.id })
    }
  }

  // חיפוש לפי אימייל
  const { email } = req.query
  if (!email) return res.status(200).json({ found: false })

  const r2 = await fetch(
    `https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj?filterByFormula={Email}="${email}"`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const d2 = await r2.json()

  if (!d2.records || d2.records.length === 0) {
    console.log('[get-guide] not found')
    return res.status(200).json({ found: false })
  }

  const record = d2.records[0]
  console.log('[get-guide] found by email:', {
    id: record.id,
    Guide_Name: record.fields?.Guide_Name,
    WhatsApp_Number: record.fields?.WhatsApp_Number,
  })

  // עדכן Clerk_ID
  if (clerkId) {
    await fetch(
      `https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj/${record.id}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { Clerk_ID: clerkId } })
      }
    )
  }

  return res.status(200).json({ found: true, guide: record.fields, airtable_id: record.id })
}
