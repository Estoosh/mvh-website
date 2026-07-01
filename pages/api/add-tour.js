import { sendTelegram } from '../../lib/notify'
const GUIDES_TABLE = 'Guides'
const TOURS_TABLE = 'Tours'

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

  try {
    const isFounder = body.founder === true || body.founder === 'true'

    if (isFounder) {
      return await createFounderFlow(res, baseId, headers, body)
    }

    return await createRegularTour(res, baseId, headers, body)
  } catch (err) {
    console.error('ADD_TOUR_INTERNAL_ERROR', err)
    return res.status(500).json({ error: 'internal_error', message: err.message })
  }
}

async function createFounderFlow(res, baseId, headers, body) {
  const founder = body.founder_data || {}

  const guideName = cleanText(founder.name)
  const email = cleanText(founder.email).toLowerCase()
  const phone = cleanPhone(founder.phone || body.whatsapp_number)
  const bio = cleanText(founder.bio)
  const guidePhoto = cleanText(body.guide_photo)
  const tourTitle = cleanText(body.title)

  if (!guideName || !email || phone.length !== 10 || !bio || !tourTitle) {
    return res.status(400).json({
      error: 'missing_or_invalid_founder_data',
      received: {
        guideName: Boolean(guideName),
        email: Boolean(email),
        phoneLength: phone.length,
        bio: Boolean(bio),
        tourTitle: Boolean(tourTitle)
      }
    })
  }

  const existingFounder = await findExistingFounder(baseId, headers, email, phone)

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

  const founderNumber = await getNextFounderNumber(baseId, headers)

  const guideFields = {
    Guide_Name: guideName,
    Email: email,
    WhatsApp_Number: phone,
    Guide_Status: 'pending',
    Founder_Status: 'Founder',
   
    Guide_bio: bio
  }

  if (guidePhoto) {
    guideFields.Guide_Photo = guidePhoto
  }

  const guideRes = await fetch(
    `https://api.airtable.com/v0/${baseId}/${GUIDES_TABLE}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields: guideFields })
    }
  )

  const guideData = await guideRes.json()

  if (!guideRes.ok || !guideData.id) {
    console.error('AIRTABLE_CREATE_GUIDE_FAILED', JSON.stringify({
      airtable: guideData,
      sent_fields: guideFields
    }, null, 2))

    return res.status(502).json({
      error: 'airtable_create_guide_failed',
      airtable: guideData,
      sent_fields: guideFields
    })
  }

  const tourResult = await createTourRecord(baseId, headers, body, {
  guideId: guideData.id,
  guideName,
  whatsappNumber: cleanPhone(body.whatsapp_number || phone),
  tourStatus: 'founder_free'
})

  if (!tourResult.ok || !tourResult.data?.id) {
    console.error('AIRTABLE_CREATE_TOUR_FAILED', JSON.stringify({
      airtable: tourResult.data,
      sent_body_title: body.title
    }, null, 2))

    return res.status(502).json({
      error: 'airtable_create_tour_failed',
      airtable: tourResult.data
    })
  }

  await sendFounderConfirmationEmail({
    to: email,
    guideName,
    founderNumber: guideData.fields?.Founder_Number || founderNumber,
    tourTitle
  })
const telegramResult = await sendTelegram(
  `🎉 Founder חדש הצטרף

Founder #${guideData.fields?.Founder_Number || founderNumber}

👤 ${guideName}
📧 ${email}
📱 ${phone}

🗺️ ${tourTitle}

🆔 Guide ID:
${guideData.id}

🎯 Status:
founder_free`
)

console.log('FOUNDER_TELEGRAM_RESULT', JSON.stringify(telegramResult, null, 2))
  return res.status(200).json({
    success: true,
    id: tourResult.data.id,
    tour_id: tourResult.data.id,
    guide_id: guideData.id,
    founder_number: guideData.fields?.Founder_Number || founderNumber,
    guide: {
      id: guideData.id,
      ...guideData.fields,
      Guide_bio: guideData.fields?.Guide_bio || ''
    },
    tour: tourResult.data
  })
}

async function createRegularTour(res, baseId, headers, body) {
  const tourStatus = body.collab_code ? 'collab' : 'paid'

 const tourResult = await createTourRecord(baseId, headers, body, {
  guideId: body.guide_id || '',
  guideName: body.guide_name || '',
  whatsappNumber: cleanPhone(body.whatsapp_number),
  tourStatus
})

  if (!tourResult.ok || !tourResult.data?.id) {
    console.error('AIRTABLE_CREATE_REGULAR_TOUR_FAILED', JSON.stringify(tourResult.data, null, 2))

    return res.status(502).json({
      error: 'airtable_create_tour_failed',
      airtable: tourResult.data
    })
  }

  return res.status(200).json(tourResult.data)
}

async function createTourRecord(baseId, headers, body, options) {
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
    Tour_Status: options.tourStatus,
    Lead_Count: 0,
    Guide_Name: options.guideName || '',
Guide: options.guideId ? [options.guideId] : [],
    Tour_Images: Array.isArray(body.image_urls) ? body.image_urls.join('|') : '',
    WhatsApp_Number: options.whatsappNumber || '',
    Historical_Period: Array.isArray(body.historical_periods) ? body.historical_periods : [],
    Is_Public: false
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

async function findExistingFounder(baseId, headers, email, phone) {
  const formula = `AND({Founder_Status}="Founder",OR(LOWER({Email})="${escapeFormula(email)}",{WhatsApp_Number}="${escapeFormula(phone)}"))`

  const url =
    `https://api.airtable.com/v0/${baseId}/${GUIDES_TABLE}` +
    `?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`

  const response = await fetch(url, { headers })
  const data = await response.json()

  if (!response.ok) {
    console.error('AIRTABLE_FIND_EXISTING_FOUNDER_FAILED', JSON.stringify(data, null, 2))
    throw new Error('airtable_find_existing_founder_failed')
  }

  if (!data.records || data.records.length === 0) {
    return null
  }

  return data.records[0]
}

async function getNextFounderNumber(baseId, headers) {
  const formula = `{Founder_Status}="Founder"`

  const baseUrl =
    `https://api.airtable.com/v0/${baseId}/${GUIDES_TABLE}` +
    `?filterByFormula=${encodeURIComponent(formula)}` +
    `&fields%5B%5D=Founder_Number&pageSize=100`

  let nextUrl = baseUrl
  let maxNumber = -1

  while (nextUrl) {
    const response = await fetch(nextUrl, { headers })
    const data = await response.json()

    if (!response.ok) {
      console.error('AIRTABLE_GET_NEXT_FOUNDER_NUMBER_FAILED', JSON.stringify(data, null, 2))
      throw new Error('airtable_get_next_founder_number_failed')
    }

    ;(data.records || []).forEach(function(record) {
      const value = Number(record.fields?.Founder_Number)

      if (!Number.isNaN(value) && value > maxNumber) {
        maxNumber = value
      }
    })

    nextUrl = data.offset ? baseUrl + `&offset=${encodeURIComponent(data.offset)}` : null
  }

  return maxNumber + 1
}

async function sendFounderConfirmationEmail({ to, guideName, founderNumber, tourTitle }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY_MISSING')
    return
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mvh.co.il'
  const shareLink = `${baseUrl}/founders`
  const firstName = String(guideName || '').trim().split(' ')[0] || guideName || ''

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #222; background: #ffffff;">
      <div style="background: #0A0A0A; padding: 26px; text-align: center;">
        <img src="https://mvh.co.il/logo-light.png" alt="מאז ועד היום" style="height: 48px;" />
      </div>

      <div style="padding: 34px 26px; line-height: 1.9;">
        <p style="font-size: 16px;">שלום ${escapeHtml(firstName)},</p>

        <p style="font-size: 16px;">יש מקומות שאנחנו עוברים לידם כל החיים ולא באמת רואים.</p>

        <p style="font-size: 16px;">יש סיפורים שמחכים שמישהו יספר אותם מחדש.</p>

        <p style="font-size: 16px;">ויש אנשים שכשהם מתחילים לדבר על מקום, אנשים סביבם מפסיקים להסתכל בטלפון ורוצים להיות שם בעצמם.</p>

        <p style="font-size: 16px;">זו בדיוק הסיבה שבגללה הקמנו את <strong>מאז ועד היום</strong>.</p>

        <p style="font-size: 16px;">היום הפכתם לחלק מהפרק הראשון של הסיפור הזה.</p>

        <div style="background: #F7F1EA; border: 1px solid #EDE7DF; border-radius: 14px; padding: 20px 22px; margin: 26px 0;">
          <p style="font-size: 13px; color: #7E4821; font-weight: 800; margin: 0 0 8px;">הסיור הראשון שלכם נשמר</p>
          <p style="font-size: 19px; font-weight: 800; color: #111; margin: 0;">${escapeHtml(tourTitle)}</p>
        </div>

        <p style="font-size: 16px;">מספר המייסד שלכם הוא:</p>

        <div style="font-size: 30px; font-weight: 900; color: #B97A45; letter-spacing: 1px; margin: 10px 0 26px;">
          Founder #${escapeHtml(founderNumber)}
        </div>

        <p style="font-size: 16px;">כשהאתר יושק נשלח לכם מייל נוסף עם אפשרות להגדיר סיסמה ולקבל גישה מלאה לחשבון האישי ולסיור שהעליתם.</p>

        <p style="font-size: 16px;">עד אז תוכלו לדעת שהסיור שלכם כבר נמצא בין האבנים הראשונות שעליהן נבנית הקהילה הזו.</p>

        <div style="background: #FBF7F1; border: 1px solid #EDE7DF; border-radius: 14px; padding: 20px 22px; margin: 30px 0;">
          <p style="font-size: 16px; font-weight: 800; margin: 0 0 10px;">מכירים מורי דרך סטוריטלרים כמוכם?</p>
          <p style="font-size: 16px; margin: 0 0 18px;">שתפו את לינק ההרשמה עם שלושה כאלה. אנחנו לא מחפשים את קהילת המייסדים הגדולה ביותר. אנחנו מחפשים את קהילת המייסדים הטובה ביותר.</p>
          <a href="${shareLink}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 800;">
            שתפו את לינק ההרשמה
          </a>
        </div>

        <p style="font-size: 16px;">נתראה בקרוב,</p>
        <p style="font-size: 16px;">צוות מאז ועד היום</p>

        <div style="margin-top: 34px; padding-top: 22px; border-top: 1px solid #eee; font-size: 13px; color: #888;">
          אפשר להשיב למייל הזה בכל שאלה: ask@mvh.co.il
        </div>
      </div>
    </div>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'מאז ועד היום | קהילת המייסדים <no-reply@mvh.co.il>',
        reply_to: 'ask@mvh.co.il',
        to,
        subject: 'הצטרפת לקהילת המייסדים של מאז ועד היום',
        html
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('RESEND_FOUNDER_EMAIL_FAILED', JSON.stringify(data, null, 2))
    }
  } catch (err) {
    console.error('RESEND_FOUNDER_EMAIL_ERROR', err)
  }
}

function cleanText(value) {
  return String(value || '').trim()
}

function cleanPhone(value) {
  return String(value || '').replace(/\D/g, '')
}

function escapeFormula(value) {
  return String(value || '').replace(/"/g, '\\"')
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
// deployment test 28-06
