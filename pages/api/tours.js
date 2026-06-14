export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  const url = `https://api.airtable.com/v0/${baseId}/tblINQoN9zrZCfR93`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  })

  const text = await response.text()
  res.status(200).json({ 
    status: response.status,
    body: text
  })
}
