export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const { subject, message } = req.body || {}

  if (!message || String(message).trim().length < 2) {
    return res.status(400).json({ error: 'missing_message' })
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'missing_resend_key' })
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'מאז ועד היום <no-reply@mvh.co.il>',
      reply_to: 'ask@mvh.co.il',
      to: 'ask@mvh.co.il',
      subject: subject || 'פנייה דרך מאז ועד היום',
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:16px;line-height:1.8">${String(message).replace(/\n/g, '<br />')}</div>`
    })
  })

  const data = await response.json()

  if (!response.ok) {
    return res.status(500).json({ error: 'send_failed', details: data })
  }

  return res.status(200).json({ success: true })
}
