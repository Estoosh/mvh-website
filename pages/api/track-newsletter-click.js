export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const { tour_id, current_count } = req.query

  try {
    await fetch(
      `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764/${tour_id}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { Newsletter_Click_Count: (Number(current_count) || 0) + 1 } })
      }
    )
  } catch (err) {
    console.error(err)
  }

  res.redirect(302, '/tours/' + tour_id)
}
