export default async function handler(req, res) {
  res.status(200).json({
    token_preview: process.env.AIRTABLE_TOKEN ? process.env.AIRTABLE_TOKEN.substring(0, 20) : 'missing'
  })
}
