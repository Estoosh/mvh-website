import { getRecord } from '../../lib/airtable'
import { resolveSignupByClerkId } from '../../lib/resolve-signup'

// NEEDS VERIFICATION: this table does not exist yet — inert until created.
const SAVED_TOURS_TABLE_ID = process.env.AIRTABLE_TABLE_SAVED_TOURS

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { clerk_id, saved_entry_id } = req.body || {}

  if (!clerk_id || !saved_entry_id) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  if (!SAVED_TOURS_TABLE_ID) {
    return res.status(500).json({ error: 'saved_tours_table_not_configured' })
  }

  try {
    const signup = await resolveSignupByClerkId(clerk_id)
    if (!signup) {
      return res.status(404).json({ error: 'signup_not_found' })
    }

    const entry = await getRecord(SAVED_TOURS_TABLE_ID, saved_entry_id)
    if (!entry) {
      return res.status(404).json({ error: 'saved_entry_not_found' })
    }

    // Ownership check: a signup can only remove its own saved-tour entries.
    const entrySignupId = Array.isArray(entry.Signup_ID) ? entry.Signup_ID[0] : entry.Signup_ID
    if (entrySignupId !== signup.id) {
      return res.status(403).json({ error: 'not_your_saved_tour' })
    }

    // lib/airtable.js has no delete function today — performing a raw
    // DELETE call here rather than modifying that already-delivered file
    // for the sake of one route.
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${SAVED_TOURS_TABLE_ID}/${saved_entry_id}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    )

    if (!response.ok) {
      const details = await response.json().catch(() => ({}))
      return res.status(502).json({ error: 'delete_failed', details })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
