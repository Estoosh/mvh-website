export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, first_name } = req.body
  if (!email) return res.status(400).json({ error: 'no email' })

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
      <div style="background: #0A0A0A; padding: 24px; text-align: center;">
        <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'https://mvh.co.il'}/logo-light.png" alt="מאז ועד היום" style="height: 48px;" />
      </div>
      <div style="padding: 32px 24px; line-height: 1.8;">
        <p style="font-size: 16px;">היי ${first_name || ''},</p>
        <p style="font-size: 16px;">יש אנשים שיודעים בדיוק למי לפנות כשהם רוצים לטייל באזור מסוים. אחרים מחפשים בגוגל, ברשתות החברתיות, או פשוט שואלים מנוע AI: "מה יש לעשות שם?"</p>
        <p style="font-size: 16px;">הרגע נרשמתם ל"מאז ועד היום", וזה מגדיל את הסיכוי שבפעם הבאה שהם ישאלו את השאלה הזאת, הם יגיעו דווקא אליכם.</p>
        <p style="font-size: 16px;">בין אם זה דרך הסיורים באתר, הניוזלטר שלנו או הפודקאסט. אנשים שלא הכירו אתכם אתמול, יכולים למצוא את עצמם מטיילים איתכם כבר מחר.</p>
        <p style="font-size: 16px;">אז תשלימו את הפרופיל, תעלו סיורים בכמה קליקים עם בינה שיוצרת את התוכן בשבילכם, ותנו לנו להתחיל לעבוד.</p>
        <p style="font-size: 16px;">יאללה, צאו לדרך. 🙂</p>
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; font-size: 13px; color: #888;">
          <strong style="color: #222;">אודי עמרני</strong><br/>
          MvH | מאז ועד היום
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
        subject: 'לא מבטיחים ניסים, אבל יש מצב שמישהו בדיוק מחפש מדריך כמוך.',
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
