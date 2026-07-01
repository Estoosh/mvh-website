export function alertsEnabled() {
  return (
    process.env.MVH_MODE === 'prelaunch' ||
    process.env.MVH_MODE === 'production'
  )
}

export async function sendTelegram(message) {
  if (!alertsEnabled()) return { skipped: true, reason: 'alerts_disabled' }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return { ok: false, error: 'missing_telegram_config' }
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })
  })

  const data = await res.json()
  return { ok: res.ok, data }
}

export async function sendEmail({ subject, html }) {
  if (!alertsEnabled()) return { skipped: true, reason: 'alerts_disabled' }

  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'missing_resend_key' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'MVH Alerts <no-reply@mvh.co.il>',
      reply_to: 'ask@mvh.co.il',
      to: process.env.HEALTH_AGENT_EMAIL || 'udi.amrani@gmail.com',
      subject,
      html
    })
  })

  const data = await res.json()
  return { ok: res.ok, data }
}
