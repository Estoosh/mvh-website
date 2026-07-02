import { fetchAllRecords } from '../../lib/airtable'
import { resolveSignupByClerkId } from '../../lib/resolve-signup'

// NEEDS VERIFICATION: this table does not exist yet — inert until created.
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

    // Find this signup's own Follows entry for this guide — ownership is
    // implicit in the lookup (we only ever search within this signup's
    // own entries), same protective intent as remove-saved-tour.js's
    // explicit check.
    const existing = await fetchAllRecords(FOLLOWS_TABLE_ID, {
      filterByFormula: `AND({Signup_ID} = '${signup.id}', {Guide_ID} = '${guide_id}')`
    })

    if (existing.length === 0) {
      return res.status(200).json({ ok: true, wasFollowing: false })
    }

    // lib/airtable.js has no delete function — raw DELETE call here,
    // same approach as remove-saved-tour.js.
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${FOLLOWS_TABLE_ID}/${existing[0].id}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    )

    if (!response.ok) {
      const details = await response.json().catch(() => ({}))
      return res.status(502).json({ error: 'unfollow_failed', details })
    }

    return res.status(200).json({ ok: true, wasFollowing: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
