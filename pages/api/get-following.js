import { fetchAllRecords, getRecord } from '../../lib/airtable'
import { resolveSignupByClerkId } from '../../lib/resolve-signup'

// NEEDS VERIFICATION: this table does not exist yet — inert until created.
const FOLLOWS_TABLE_ID = process.env.AIRTABLE_TABLE_FOLLOWS

// Existing, Founder-Flow-owned table. Read-only.
const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })

  const clerkId = req.query.clerk_id
  if (!clerkId) {
    return res.status(400).json({ error: 'missing_clerk_id' })
  }

  if (!FOLLOWS_TABLE_ID) {
    return res.status(500).json({ error: 'follows_table_not_configured' })
  }

  try {
    const signup = await resolveSignupByClerkId(clerkId)
    if (!signup) {
      return res.status(200).json({ ok: true, guides: [] })
    }

    const follows = await fetchAllRecords(FOLLOWS_TABLE_ID, {
      filterByFormula: `{Signup_ID} = '${signup.id}'`
    })

    const guides = []
    for (const follow of follows) {
      const guideId = Array.isArray(follow.Guide_ID) ? follow.Guide_ID[0] : follow.Guide_ID
      if (!guideId) continue

      const guide = await getRecord(GUIDES_TABLE_ID, guideId)
      if (!guide) continue

      guides.push({
        id: guide.id,
        Guide_Name: guide.Guide_Name,
        Guide_Photo: guide.Guide_Photo,
        followed_at: follow.Followed_At
      })
    }

    return res.status(200).json({ ok: true, guides })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
