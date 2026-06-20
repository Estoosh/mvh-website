export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, first_name } = req.body
  if (!email) return res.status(400).json({ error: 'no email' })

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
      <div style="background: #0A0A0A; padding: 24px; text-align: center;">
        <img src="https://mvh.co.il/logo-light.png" alt="מאז ועד היום" style="height: 48px;" />
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; line-height: 1.8;">היי ${first_name || ''},</p>
        <p style="font-size: 16px; line-height: 1.8;">נכון יש את הרגע הזה שמגיע הסופ"ש ואתם אומרים "חייבים לעשות משהו", ושעה אחר כך אתם עדיין מול הנטפליקס, גוללים בטלפון, כי לא נסגרתם על רעיון אחר?</p>
        <p style="font-size: 16px; line-height: 1.8;">אז ברוכים הבאים ל"מאז ועד היום".</p>
        <p style="font-size: 16px; line-height: 1.8;">מדי פעם נשלח לכם פרקים חדשים בפודקאסט, רעיונות לסיורים, ומקומות שלא בהכרח חשבתם לנסוע אליהם, עד שמישהו נתן לכם סיבה טובה.</p>
        <p style="font-size: 16px; line-height: 1.8;">אה, ועוד משהו. סידרנו לכם גם <strong>10% הנחה על כל הסיורים באתר</strong>. ולא, לא צריך להסתבך. קוד ההנחה יישלח אוטומטית למדריך כשתשלחו לו הודעה דרך האתר.</p>
        <p style="font-size: 16px; line-height: 1.8;">ואם יש לכם חברים שכל חמישי שואלים בקבוצה "יאללה, מה עושים בסופ"ש?" ואז לא מציעים שום דבר בעצמם, תשלחו גם להם את הלינק: <a href="https://www.mvh.co.il" style="color: #C4922A;">www.mvh.co.il</a></p>
        <p style="font-size: 16px; line-height: 1.8;">אנחנו כאן כדי לתת לכם תירוצים טובים לצאת מהבית.</p>
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; font-size: 13px; color: #888;">
          <strong style="color: #222;">MvH | מאז ועד היום</strong><br/>
          פודקאסט ומורי דרך שיפילו אתכם מהרגליים. (אבל בקטע טוב)
        </div>
      </div>
    </div>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'מאז ועד היום | Trails <no-reply@mvh.co.il>',
        to: email,
        subject: 'בהלם שנרשמת רק עכשיו, אבל סידרנו לך אחלה תירוץ לצאת מהבית',
        html: html
      })
    })
    const data = await response.json()
    res.status(200).json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
