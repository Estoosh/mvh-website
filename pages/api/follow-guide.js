import { fetchAllRecords, createRecord } from '../../lib/airtable'
import { resolveSignupByClerkId } from '../../lib/resolve-signup'

// NEEDS VERIFICATION: this table does not exist yet — inert until created,
// same pattern as Saved_Tours and the Finance/Control Center tables.
const FOLLOWS_TABLE_ID = process.env.AIRTABLE_TABLE_FOLLOWS

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { clerk_id, guide_id } = req.body || {}

  if (!clerk_id || !guide_id) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  if (!FOLLOWS_TABLE_ID) {
    return res.status(500).json({ error: 'follows_table_not_configured' })
  }

  try {
    const signup = await resolveSignupByClerkId(clerk_id)
    if (!signup) {
      return res.status(404).json({ error: 'signup_not_found' })
    }

    // Idempotent, same pattern as save-tour.js.
    const existing = await fetchAllRecords(FOLLOWS_TABLE_ID, {
      filterByFormula: `AND({Signup_ID} = '${signup.id}', {Guide_ID} = '${guide_id}')`
    })

    if (existing.length > 0) {
      return res.status(200).json({ ok: true, alreadyFollowing: true, entry: existing[0] })
    }

    const result = await createRecord(FOLLOWS_TABLE_ID, {
      Signup_ID: [signup.id],
      Guide_ID: [guide_id],
      Followed_At: new Date().toISOString()
    })

    if (!result.ok) {
      return res.status(500).json({ error: 'follow_failed', details: result.error })
    }

    return res.status(200).json({ ok: true, alreadyFollowing: false, entry: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
