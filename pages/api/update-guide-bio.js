export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    const recordId = req.body && req.body.record_id
    const bio = req.body && req.body.bio

    if (!recordId || !bio || !String(bio).trim()) {
      return res.status(400).json({
        success: false,
        error: 'missing_record_id_or_bio',
        received: {
          record_id: recordId || null,
          hasBio: Boolean(bio)
        }
      })
    }

    const token = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID
    const guidesTable = 'tblsJ5Ok1yPSgtvSj'

    if (!token || !baseId) {
      return res.status(500).json({
        success: false,
        error: 'missing_airtable_config'
      })
    }

    const airtableUrl =
      'https://api.airtable.com/v0/' +
      baseId +
      '/' +
      guidesTable +
      '/' +
      recordId

    const response = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Guide_bio: String(bio).trim()
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: 'airtable_update_failed',
        status: response.status,
        airtable: data
      })
    }

    return res.status(200).json({
      success: true,
      record_id: data.id,
      guide_bio: data.fields && data.fields.Guide_bio ? data.fields.Guide_bio : ''
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'internal_error',
      message: err && err.message ? err.message : String(err)
    })
  }
}
