export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' })
  }

  const { record_id, bio } = req.body || {}

  if (!record_id || !String(record_id).startsWith('rec')) {
    return res.status(400).json({ success: false, error: 'invalid_record_id' })
  }

  const cleanBio = typeof bio === 'string' ? bio.trim() : ''

  const token =
    process.env.AIRTABLE_API_KEY ||
    process.env.AIRTABLE_TOKEN ||
    process.env.AIRTABLE_ACCESS_TOKEN

  const baseId =
    process.env.AIRTABLE_BASE_ID ||
    process.env.AIRTABLE_BASE

  const guidesTable = 'tblsJ5Ok1yPSgtvSj'

  if (!token || !baseId) {
    return res.status(500).json({
      success: false,
      error: 'missing_airtable_config',
      hasToken: Boolean(token),
      hasBaseId: Boolean(baseId)
    })
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${guidesTable}/${record_id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            Guide_bio: cleanBio
          }
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: 'airtable_update_failed',
        airtable: data
      })
    }

    return res.status(200).json({
      success: true,
      record_id: data.id,
      Guide_bio: data.fields?.Guide_bio || ''
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: err.message
    })
  }
}
