export default async function handler(req, res) {
  const token = process.env.TELEGRAM_BOT_TOKEN

  const response = await fetch(
    `https://api.telegram.org/bot${token}/getUpdates`
  )

  const data = await response.json()

  return res.status(200).json(data)
}
