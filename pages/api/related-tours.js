export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const { exclude_id, cities, guide_name, periods } = req.query

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?pageSize=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await response.json()
    const allTours = (data.records || []).map(function(r) { return Object.assign({ id: r.id }, r.fields) })
    const others = allTours.filter(function(t) { return t.id !== exclude_id })

    const periodList = periods ? periods.split('|').filter(Boolean) : []

    const sameGuide = others.filter(function(t) { return t.Guide_Name === guide_name })
    const sameCity = others.filter(function(t) { return t.Cities_Tags === cities && t.Guide_Name !== guide_name })
    const samePeriod = others.filter(function(t) {
      if (t.Guide_Name === guide_name || t.Cities_Tags === cities) return false
      var tPeriods = t.Historical_Period || []
      return tPeriods.some(function(p) { return periodList.includes(p) })
    })

    const combined = sameGuide.concat(sameCity).concat(samePeriod).slice(0, 6)

    res.status(200).json({ tours: combined })
  } catch (err) {
    console.error('related-tours error:', err)
    res.status(200).json({ tours: [] })
  }
}
