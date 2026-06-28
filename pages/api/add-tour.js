const GUIDES_TABLE = 'tblsJ5Ok1yPSgtvSj'
const TOURS_TABLE = 'tbltsGvfPLMAmJ764'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const token = process.env.AIRTABLE_TOKEN || process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_ACCESS_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE
  const body = req.body || {}

  if (!token || !baseId) {
    return res.status(500).json({ error: 'missing_airtable_config' })
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  const isFounder = body.founder === true || body.founder === 'true'

  try {
    if (isFounder) {
      return await createFounderAndTour({ req, res, token, baseId, headers, body })
    }

    return await createRegularTour({ res, baseId, headers, body })
  } catch (err) {
    return res.status(500).json({ error: 'internal_error', message: err.message })
  }
}

async function createFounderAndTour({ res, baseId, headers, body }) {
  const founder = body.founder_data || {}

  const cleanName = typeof founder.name === 'string' ? founder.name.trim() : ''
  const cleanEmail = typeof founder.email === 'string' ? founder.email.trim().toLowerCase() : ''
  const cleanPhone = String(founder.phone || body.whatsapp_number || '').replace(/\D/g, '')
  const cleanBio = typeof founder.bio === 'string' ? founder.bio.trim() : ''

  if (!cleanName || !cleanEmail || cleanPhone.length !== 10 || !cleanBio) {
    return res.status(400).json({ error: 'missing_or_invalid_founder_data' })
  }

  const existingFounder = await findExistingFounder({ baseId, headers, email: cleanEmail, phone: cleanPhone })

  if (existingFounder) {
    return res.status(200).json({
      error: 'founder_exists',
      existing_founder: true,
      founder_number: existingFounder.fields?.Founder_Number || null,
      guide_id: existingFounder.id,
      guide: {
        id: existingFounder.id,
        ...existingFounder.fields,
        Guide_bio: existingFounder.fields?.Guide_bio || ''
      }
    })
  }

  const founderNumber = await getNextFounderNumber({ baseId, headers })

  const guideFields = {
    Guide_Name: cleanName,
    Email: cleanEmail,
    WhatsApp_Number: cleanPhone,
    Guide_Status: 'pending',
    Founder_Status: 'Founder',
    Founder_Number: founderNumber,
    Guide_bio: cleanBio,
    Is_Public: false
  }

  const createGuideRes = await fetch(
    `https://api.airtable.com/v0/${baseId}/${GUIDES_TABLE}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields: guideFields })
    }
  )

  const createdGuide = await createGuideRes.json()

  if (!createGuideRes.ok || !createdGuide.id) {
    return res.status(502).json({ error: 'airtable_create_guide_failed', airtable: createdGuide })
  }

  const tourResult = await createTourRecord({
    baseId,
    headers,
    body,
    guideId: createdGuide.id,
    guideName: cleanName,
    whatsappNumber: String(body.whatsapp_number || cleanPhone).replace(/\D/g, ''),
    tourStatus: 'founder_free'
  })

  if (!tourResult.ok) {
    return res.status(502).json({ error: 'airtable_create_tour_failed', airtable: tourResult.data })
  }

  return res.status(200).json({
    success: true,
    id: tourResult.data.id,
    tour_id: tourResult.data.id,
    guide_id: createdGuide.id,
    founder_number: founderNumber,
    guide: {
      id: createdGuide.id,
      ...createdGuide.fields,
      Guide_bio: createdGuide.fields?.Guide_bio || ''
    },
    tour: tourResult.data
  })
}

async function createRegularTour({ res, baseId, headers, body }) {
  const tourStatus = body.collab_code ? 'collab' : 'paid'

  const tourResult = await createTourRecord({
    baseId,
    headers,
    body,
    guideId: body.guide_id || '',
    guideName: body.guide_name || '',
    whatsappNumber: String(body.whatsapp_number || '').replace(/\D/g, ''),
    tourStatus
  })

  if (!tourResult.ok) {
    return res.status(502).json({ error: 'airtable_create_tour_failed', airtable: tourResult.data })
  }

  return res.status(200).json(tourResult.data)
}

async function createTourRecord({ baseId, headers, body, guideId, guideName, whatsappNumber, tourStatus }) {
  const fields = {
    Tour_Title: body.title || '',
    Tour_Teaser: body.teaser || '',
    Tour_Story: body.story || '',
    Tour_Guide_Context: body.guide_context || '',
    Price_Per_Person: Number(body.price) || 0,
    Duration_Hours: Number(body.duration) || 0,
    Cities_Tags: body.cities || '',
    Min_Age: Number(body.min_age) || 0,
    Meeting_Point_Waze: body.meeting_point || '',
    Tour_Status: tourStatus,
    Lead_Count: 0,
    Guide_Name: guideName || '',
    Tour_Images: Array.isArray(body.image_urls) ? body.image_urls.join('|') : '',
    WhatsApp_Number: whatsappNumber || '',
    Historical_Period: Array.isArray(body.historical_periods) ? body.historical_periods : [],
    Is_Public: false
  }

  if (guideId) {
    fields.Guide = [guideId]
  }

  if (body.entrance_fee_included) {
    fields.Entrance_Fee_Included = true
    fields.Entrance_Fee_Amount = Number(body.entrance_fee_amount) || 0
  }

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${TOURS_TABLE}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields })
    }
  )

  const data = await response.json()

  return {
    ok: response.ok,
    data
  }
}

async function findExistingFounder({ baseId, headers, email, phone }) {
  const formula = `AND({Founder_Status}="Founder",OR(LOWER({Email})="${escapeFormula(email)}",{WhatsApp_Number}="${escapeFormula(phone)}"))`

  const url =
    `https://api.airtable.com/v0/${baseId}/${GUIDES_TABLE}` +
    `?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`

  const response = await fetch(url, { headers })
  const data = await response.json()

  if (!response.ok) {
    throw new Error('airtable_founder_lookup_failed')
  }

  if (!data.records || data.records.length === 0) {
    return null
  }

  return data.records[0]
}

async function getNextFounderNumber({ baseId, headers }) {
  const formula = `{Founder_Status}="Founder"`

  const url =
    `https://api.airtable.com/v0/${baseId}/${GUIDES_TABLE}` +
    `?filterByFormula=${encodeURIComponent(formula)}&fields%5B%5D=Founder_Number&pageSize=100`

  let nextUrl = url
  let maxNumber = -1

  while (nextUrl) {
    const response = await fetch(nextUrl, { headers })
    const data = await response.json()

    if (!response.ok) {
      throw new Error('airtable_founder_number_lookup_failed')
    }

    ;(data.records || []).forEach(function(record) {
      const value = Number(record.fields?.Founder_Number)

      if (!Number.isNaN(value) && value > maxNumber) {
        maxNumber = value
      }
    })

    if (data.offset) {
      nextUrl = url + `&offset=${encodeURIComponent(data.offset)}`
    } else {
      nextUrl = null
    }
  }

  return maxNumber + 1
}

function escapeFormula(value) {
  return String(value || '').replace(/"/g, '\\"')
}
