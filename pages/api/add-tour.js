export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const body = req.body
  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          Tour_Title: body.title,
          Tour_Teaser: body.teaser,
          Tour_Story: body.story,
          Price_Per_Person: Number(body.price),
          Duration_Hours: Number(body.duration),
          Cities_Tags: body.cities,
          Min_Age: Number(body.min_age) || 0,
          Meeting_Point_Waze: body.meeting_point,
          Tour_Status: body.collab_code ? 'collab' : 'paid',
          Lead_Count: 0,
          Guide_Name: body.guide_name,
          Tour_Images: body.image_urls ? body.image_urls.join(',') : '',
        }
      })
    }
  )
  const data = await response.json()
  res.status(200).json(data)
}
