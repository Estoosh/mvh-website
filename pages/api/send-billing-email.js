export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mvh.co.il'

  try {
    const toursRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?pageSize=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const toursData = await toursRes.json()
    const allTours = (toursData.records || []).map(function(r) { return Object.assign({ id: r.id }, r.fields) })

    const guidesRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj?pageSize=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const guidesData = await guidesRes.json()
    const guides = (guidesData.records || []).map(function(r) { return Object.assign({ id: r.id }, r.fields) })

    const now = new Date()
    const monthName = now.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })

    let sent = 0
    for (var i = 0; i < guides.length; i++) {
      var guide = guides[i]
      if (!guide.Email) continue

      var activeTours = allTours.filter(function(t) {
        return t.Guide_Name === guide.Guide_Name && t.Tour_Status === 'paid'
      })
      if (activeTours.length === 0) continue

      var total = activeTours.reduce(function(acc, t) { return acc + (Number(t.Price_Per_Person) || 0) }, 0)
      var firstName = guide.Guide_Name ? guide.Guide_Name.split(' ')[0] : guide.Guide_Name

      var toursHtml = activeTours.map(function(t) {
        return `<tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0;">${t.Tour_Title}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; text-align: left;">${t.Price_Per_Person} ₪</td>
        </tr>`
      }).join('')

      const html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
          <div style="background: #0A0A0A; padding: 24px; text-align: center;">
            <img src="${baseUrl}/logo-light.png" alt="מאז ועד היום" style="height: 48px;" />
          </div>
          <div style="padding: 32px 24px; line-height: 1.8;">
            <p style="font-size: 16px;">שלום ${firstName},</p>
            <p style="font-size: 16px;">מצורפת החשבונית החודשית עבור הסיורים הפעילים שלך בקהילת המטיילים של "מאז ועד היום".</p>

            <div style="background: #F9F9F9; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="font-size: 13px; color: #888; margin-bottom: 12px;">תקופת חיוב: ${monthName}</p>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #eee;">
                    <th style="padding: 8px 12px; text-align: right; font-size: 13px; color: #888;">סיור</th>
                    <th style="padding: 8px 12px; text-align: left; font-size: 13px; color: #888;">מחיר</th>
                  </tr>
                </thead>
                <tbody>${toursHtml}</tbody>
                <tfoot>
                  <tr>
                    <td style="padding: 12px; font-weight: 800; font-size: 16px;">סה"כ לחיוב</td>
                    <td style="padding: 12px; font-weight: 800; font-size: 16px; text-align: left; color: #C4922A;">${total} ₪</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p style="font-size: 16px;">אגב, אם כבר פתחת את המייל, זו תזכורת ידידותית לכך שבכל רגע אפשר לעדכן את הסיורים שלך באתר, להוסיף חדשים, ולראות כמה אנשים צפו בהם, לחצו עליהם או ביקשו ליצור איתך קשר.</p>
            <p style="font-size: 16px;">אני את שלי עשיתי.</p>
            <p style="font-size: 16px;">נתראה בחודש הבא. 🙂</p>
            <p style="font-size: 16px;">שלך,</p>

            <div style="margin: 24px 0;">
              <a href="${baseUrl}/dashboard" style="background: #0A0A0A; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
                כניסה לאזור האישי
              </a>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
              החשבונית החודשית של MvH
            </div>
          </div>
        </div>
      `

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'מאז ועד היום | Trails <no-reply@mvh.co.il>',
          to: guide.Email,
          subject: firstName + ', נעשה את זה קצר. אני החשבונית החודשית שלך מ-MvH',
          html: html
        })
      })
      sent++
    }

    res.status(200).json({ ok: true, sent })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
