export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const { subject, intro, outro, tour_ids } = req.body
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mvh.co.il'

  try {
    const toursRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?pageSize=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const toursData = await toursRes.json()
    const allTours = (toursData.records || []).map(function(r) { return Object.assign({ id: r.id }, r.fields) })
    const tours = tour_ids.map(function(id) { return allTours.find(function(t) { return t.id === id }) }).filter(Boolean)

    const signupsRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/Signups?pageSize=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const signupsData = await signupsRes.json()
    const signups = (signupsData.records || []).map(function(r) { return r.fields })

    const INTRO_DEFAULT = `יש לנו חדשות טובות וחדשות רעות.
החדשות הרעות הן שנגמרו לכם התירוצים להישאר בבית.
החדשות הטובות הן שהוספנו כמה סיורים חדשים במקומות שאם היו מציעים לכם לנסוע אליהם לפני שבוע, כנראה שהייתם אומרים "עזוב, מה יש לעשות שם?"
ואם אתם בכל זאת במצב בטטות ספה, לפחות תקשיבו לפרק החדש בפודקאסט, ובפעם הבאה שמישהו בעבודה ישאל מה עשיתם בסופ"ש, תזרקו שם של מקום שאף אחד לא שמע עליו וכולם יהיו בטוחים שיש לכם חיים מעניינים במיוחד :)`
    const OUTRO_DEFAULT = `נרדמתם באמצע הפרק? לא נורא. המינימום שאתם יכולים לעשות זה להעביר את המייל הזה למישהו שצריך לצאת מהבית יותר מכם.`

    const introText = (intro || INTRO_DEFAULT).replace(/\n/g, '<br/>')
    const outroText = (outro || OUTRO_DEFAULT).replace(/\n/g, '<br/>')

    const toursHtml = tours.map(function(t) {
      var thumb = t.Tour_Images ? t.Tour_Images.split('|')[0] : null
      var fullPrice = Number(t.Price_Per_Person) || 0
      var discountedPrice = Math.round(fullPrice * 0.9)
      var ctaLink = baseUrl + '/api/track-newsletter-click?tour_id=' + t.id + '&current_count=' + (t.Newsletter_Click_Count || 0)
      return `
        <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:24px;">
          ${thumb ? '<img src="' + thumb + '" style="width:100%;height:200px;object-fit:cover;display:block;" />' : ''}
          <div style="padding:16px;direction:rtl;">
            <p style="font-weight:800;font-size:18px;margin-bottom:6px;">${t.Tour_Title}</p>
            <p style="font-size:14px;color:#666;margin-bottom:8px;">${t.Tour_Teaser || ''}</p>
            <p style="font-size:13px;color:#888;margin-bottom:12px;">${t.Cities_Tags || ''} · ${t.Duration_Hours || ''} שעות · ${t.Guide_Name || ''}</p>
            <p style="font-size:14px;margin-bottom:16px;">
              <span style="text-decoration:line-through;color:#999;">${fullPrice} ₪</span>
              &nbsp;<span style="font-weight:700;color:#C4922A;font-size:16px;">${discountedPrice} ₪ לחברי קהילה</span>
            </p>
            <a href="${ctaLink}" style="display:block;background:#C4922A;color:#fff;padding:12px 20px;border-radius:6px;text-align:center;font-weight:700;font-size:14px;text-decoration:none;">מה יש לעשות שם?</a>
          </div>
        </div>
      `
    }).join('')

    const html = `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
        <div style="background:#0A0A0A;padding:20px 24px;text-align:center;">
          <img src="${baseUrl}/logo-light.png" alt="מאז ועד היום" style="height:40px;" />
        </div>
        <div style="padding:32px 24px;">
          <p style="font-size:15px;line-height:1.8;margin-bottom:32px;">${introText}</p>
          ${toursHtml}
          <p style="font-size:14px;line-height:1.8;color:#555;margin-top:32px;">${outroText}</p>
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#888;text-align:center;">
            <strong style="color:#222;">MvH | מאז ועד היום</strong><br/>
            פודקאסט ומורי דרך שיגרמו לכם להבחין בשלטי הכוונה בצבע חום.
          </div>
        </div>
      </div>
    `

    let delivered = 0
    for (var i = 0; i < signups.length; i++) {
      var signup = signups[i]
      if (!signup.Email) continue
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'מאז ועד היום | Trails <no-reply@mvh.co.il>',
            to: signup.Email,
            subject: subject,
            html: html
          })
        })
        delivered++
      } catch(e) {
        console.error('failed to send to', signup.Email)
      }
    }

    await fetch(`https://api.airtable.com/v0/${baseId}/Newsletters`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          Subject: subject,
          Intro_Text: intro || INTRO_DEFAULT,
          Outro_Text: outro || OUTRO_DEFAULT,
          Tours_Included: tour_ids.join(','),
          Sent_At: new Date().toISOString(),
          Recipients_Count: signups.length,
          Delivered_Count: delivered,
        }
      })
    })

    res.status(200).json({ ok: true, delivered })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
