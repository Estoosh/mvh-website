async function updateAirtableGuideBio({ token, baseId, guidesTable, record_id, fieldName, bio }) {
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
          [fieldName]: String(bio).trim()
        }
      })
    }
  )

  const data = await response.json()

  return {
    ok: response.ok,
    status: response.status,
    data
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { record_id, bio } = req.body

  if (!record_id || !bio || !String(bio).trim()) {
    return res.status(400).json({
      success: false,
      error: 'missing_record_id_or_bio',
      received: { record_id, hasBio: Boolean(bio) }
    })
  }

  const token = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const guidesTable = 'tblsJ5Ok1yPSgtvSj'

  if (!token || !baseId) {
    return res.status(500).json({ success: false, error: 'missing_airtable_config' })
  }

  try {
    const fieldsToTry = ['Guide_bio', 'Guide_Bio']
    const attempts = []

    for (const fieldName of fieldsToTry) {
      const result = await updateAirtableGuideBio({
        token,
        baseId,
        guidesTable,
        record_id,
        fieldName,
        bio
      })

      attempts.push({
        fieldName,
        status: result.status,
        ok: result.ok,
        error: result.data?.error || null
      })

      if (result.ok) {
        return res.status(200).json({
          success: true,
          record_id: result.data.id,
          field_used: fieldName,
          guide_bio: result.data.fields?.[fieldName] || ''
        })
      }
    }

    return res.status(502).json({
      success: false,
      error: 'airtable_update_failed_all_field_names',
      attempts
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: err.message
    })
  }
}
