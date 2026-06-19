import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'no message' })

  try {
    await resend.emails.send({
      from: 'no-reply@mvh.co.il',
      to: 'ask@mvh.co.il',
      subject: 'בקשה חדשה ממבקר באתר',
      html: '<div dir="rtl"><p>מישהו לא מצא מה שחיפש וכתב:</p><blockquote>' + message + '</blockquote></div>'
    })
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
