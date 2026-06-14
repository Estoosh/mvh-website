export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/Tours`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      const err = await response.json()
      return res.status(response.status).json(err)
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
