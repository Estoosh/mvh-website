export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const type = req.query.type

  var tableId
  if (type === 'tours') tableId = 'tbltsGvfPLMAmJ764'
  else if (type === 'guides') tableId = 'tblsJ5Ok1yPSgtvSj'
  else if (type === 'signups') tableId = 'Signups'
  else if (type === 'newsletters') tableId = 'Newsletters'
  else return res.status(400).json({ error: 'invalid type' })

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}?pageSize=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await response.json()
    const records = (data.records || []).map(function(r) { return Object.assign({ id: r.id }, r.fields) })
    res.status(200).json({ records })
  } catch (err) {
    console.error(err)
    res.status(500).json({ records: [] })
  }
}
