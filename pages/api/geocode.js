export default async function handler(req, res) {
  const { address } = req.query
  if (!address) return res.status(400).json({ error: 'Missing address' })
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=he&region=IL`
    const r = await fetch(url)
    const data = await r.json()
    if (data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location
      return res.status(200).json({ lat: loc.lat, lng: loc.lng })
    }
    return res.status(200).json({ error: 'Not found' })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
