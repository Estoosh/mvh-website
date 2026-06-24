export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const clerkId = req.query.clerk_id

  // חיפוש ראשון לפי Clerk_ID
  const r1 = await fetch(
    `https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj?filterByFormula={Clerk_ID}="${clerkId}"`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const d1 = await r1.json()

  if (d1.records && d1.records.length > 0) {
    return res.status(200).json({ found: true, guide: d1.records[0].fields, airtable_id: d1.records[0].id })
  }

  // לא נמצא לפי Clerk_ID — חפש לפי אימייל (למדריכי שת"פ שנוצרו ידנית)
  const { email } = req.query
  if (!email) return res.status(200).json({ found: false })

  const r2 = await fetch(
    `https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj?filterByFormula={Email}="${email}"`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const d2 = await r2.json()

  if (!d2.records || d2.records.length === 0) return res.status(200).json({ found: false })

  const record = d2.records[0]

  // עדכן את ה-Clerk_ID ברשומה
  await fetch(
    `https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj/${record.id}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { Clerk_ID: clerkId } })
    }
  )

  return res.status(200).json({ found: true, guide: record.fields, airtable_id: record.id })
}
