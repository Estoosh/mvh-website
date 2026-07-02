import { fetchAllRecords, createRecord } from '../../lib/airtable'
import { resolveSignupByClerkId } from '../../lib/resolve-signup'

// NEEDS VERIFICATION: this table does not exist yet — inert until created,
// same pattern as the Finance/Control Center tables.
const SAVED_TOURS_TABLE_ID = process.env.AIRTABLE_TABLE_SAVED_TOURS

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { clerk_id, tour_id, source } = req.body || {}

  if (!clerk_id || !tour_id) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  if (!SAVED_TOURS_TABLE_ID) {
    return res.status(500).json({ error: 'saved_tours_table_not_configured' })
  }

  try {
    const signup = await resolveSignupByClerkId(clerk_id)
    if (!signup) {
      // Not a community member yet (no Signups record) — the front end
      // should fall back to localStorage-only saving for this case, same
      // as it does for fully signed-out visitors.
      return res.status(404).json({ error: 'signup_not_found' })
    }

    // Idempotent: saving an already-saved tour just confirms it, rather
    // than creating a duplicate row.
    const existing = await fetchAllRecords(SAVED_TOURS_TABLE_ID, {
      filterByFormula: `AND({Signup_ID} = '${signup.id}', {Tour_ID} = '${tour_id}')`
    })

    if (existing.length > 0) {
      return res.status(200).json({ ok: true, alreadySaved: true, entry: existing[0] })
    }

    const result = await createRecord(SAVED_TOURS_TABLE_ID, {
      Signup_ID: [signup.id],
      Tour_ID: [tour_id],
      Saved_At: new Date().toISOString(),
      Source: source || 'tour_page'
    })

    if (!result.ok) {
      return res.status(500).json({ error: 'save_tour_failed', details: result.error })
    }

    return res.status(200).json({ ok: true, alreadySaved: false, entry: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
