export default async function handler(req, res) {
  res.status(200).json({
    token_exists: !!process.env.AIRTABLE_TOKEN,
    base_exists: !!process.env.AIRTABLE_BASE_ID,
    token_preview: process.env.AIRTABLE_TOKEN ? process.env.AIRTABLE_TOKEN.substring(0, 10) : 'missing'
  })
}
