export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const clerkId = req.query.clerk_id

  if (!clerkId) return res.status(400).json({ error: 'clerk_id required' })

  const url = `https://api.airtable.com/v0/${baseId}/Signups?filterByFormula=` + encodeURIComponent(`{Clerk_ID}="${clerkId}"`)
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await response.json()

  if (data.records && data.records.length > 0) {
    return res.status(200).json({ found: true, signup: data.records[0].fields })
  }
  return res.status(200).json({ found: false })
}
