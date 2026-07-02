import { fetchAllRecords, getRecord } from '../../lib/airtable'
import { resolveSignupByClerkId } from '../../lib/resolve-signup'

// NEEDS VERIFICATION: this table does not exist yet — inert until created.
const FOLLOWS_TABLE_ID = process.env.AIRTABLE_TABLE_FOLLOWS

const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'
const TOURS_TABLE_ID = 'tbltsGvfPLMAmJ764'
const AIRTABLE_API_URL = 'https://api.airtable.com/v0'

// Tours has no explicit "created at" field (confirmed absent when this
// codebase was mapped for the Funnel report). Uses Airtable's own
// createdTime record metadata instead, same approach as
// pages/api/finance/reports/funnel.js.
async function fetchToursWithCreatedTime() {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  let records = []
  let offset = null
  do {
    const params = new URLSearchParams()
    params.set('pageSize', '100')
    if (offset) params.set('offset', offset)

    const response = await fetch(`${AIRTABLE_API_URL}/${baseId}/${TOURS_TABLE_ID}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('airtable_fetch_failed')

    const data = await response.json()
    records = records.concat(data.records || [])
    offset = data.offset
  } while (offset)

  return records.map((r) => Object.assign({ id: r.id, createdTime: r.createdTime }, r.fields))
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })

  const clerkId = req.query.clerk_id
  if (!clerkId) {
    return res.status(400).json({ error: 'missing_clerk_id' })
  }

  if (!FOLLOWS_TABLE_ID) {
    return res.status(500).json({ error: 'follows_table_not_configured' })
  }

  // NEEDS VERIFICATION: "new" is defined here as added within the last N
  // days (default 14), a reasonable starting point rather than a
  // confirmed product decision.
  const days = Number(req.query.days) || 14

  try {
    const signup = await resolveSignupByClerkId(clerkId)
    if (!signup) {
      return res.status(200).json({ ok: true, tours: [] })
    }

    const follows = await fetchAllRecords(FOLLOWS_TABLE_ID, {
      filterByFormula: `{Signup_ID} = '${signup.id}'`
    })

    if (follows.length === 0) {
      return res.status(200).json({ ok: true, tours: [] })
    }

    const followedGuideNames = new Set()
    for (const follow of follows) {
      const guideId = Array.isArray(follow.Guide_ID) ? follow.Guide_ID[0] : follow.Guide_ID
      if (!guideId) continue
      const guide = await getRecord(GUIDES_TABLE_ID, guideId)
      if (guide && guide.Guide_Name) followedGuideNames.add(guide.Guide_Name)
    }

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const tours = await fetchToursWithCreatedTime()

    const newTours = tours.filter((t) =>
      followedGuideNames.has(t.Guide_Name) &&
      t.Tour_Status === 'paid' &&
      t.Content_Status !== 'Hidden' &&
      t.Content_Status !== 'Removed' &&
      new Date(t.createdTime) >= cutoff
    )

    newTours.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))

    return res.status(200).json({
      ok: true,
      tours: newTours.map((t) => ({
        id: t.id,
        Tour_Title: t.Tour_Title,
        Tour_Teaser: t.Tour_Teaser,
        Cities_Tags: t.Cities_Tags,
        Guide_Name: t.Guide_Name,
        Tour_Images: t.Tour_Images,
        added_at: t.createdTime
      }))
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
