export default async function handler(req, res) {
  const token = process.env.TELEGRAM_BOT_TOKEN

  if (!token) {
    return res.status(500).json({
      error: 'missing_telegram_token'
    })
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/getUpdates`
  )

  const data = await response.json()

  return res.status(200).json(data)
}
