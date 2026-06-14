export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  const url = `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  const data = await response.json()
  res.status(200).json(data)
}
