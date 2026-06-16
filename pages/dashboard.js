export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const guideName = req.query.guide_name

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?filterByFormula={Guide_Name}="${guideName}"`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  const data = await response.json()
  const tours = (data.records || []).map(function(r) {
    return Object.assign({ id: r.id }, r.fields)
  })

  res.status(200).json({ tours })
}
