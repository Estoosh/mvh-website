export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const clerkId = req.query.clerk_id
  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj?filterByFormula={Clerk_ID}="${clerkId}"`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await response.json()
  
  if (!data.records || data.records.length === 0) {
    return res.status(200).json({ found: false })
  }

  res.status(200).json({ 
    found: true, 
    guide: data.records[0].fields,
    airtable_id: data.records[0].id
  })
}
