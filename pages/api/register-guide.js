export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const body = req.body

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Guide_Name: body.first_name + ' ' + body.last_name,
          Business_Name: body.business_name,
          Email: body.email,
          Phone_Number: body.phone,
          Street_Address: body.address,
          Account_Status: 'פעיל',
          Clerk_ID: body.clerk_id,
        }
      })
    }
  )

  const data = await response.json()
  res.status(200).json(data)
}
