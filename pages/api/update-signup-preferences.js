import { updateRecord } from '../../lib/airtable'
import { resolveSignupByClerkId } from '../../lib/resolve-signup'

// Existing, Founder-Flow-owned table, referenced by name (same as
// register-signup.js and block-signup.js). Only updates fields that
// already exist on this table today — Regions_Interest, Tour_Types_Interest,
// Travel_With — the same three fields register-signup.js writes at
// creation. No schema change.
const SIGNUPS_TABLE_ID = 'Signups'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { clerk_id, regions, tour_types, travel_with } = req.body || {}

  if (!clerk_id) {
    return res.status(400).json({ error: 'missing_clerk_id' })
  }

  try {
    const signup = await resolveSignupByClerkId(clerk_id)
    if (!signup) {
      return res.status(404).json({ error: 'signup_not_found' })
    }

    const fields = {}
    if (Array.isArray(regions)) fields.Regions_Interest = regions.join(', ')
    if (Array.isArray(tour_types)) fields.Tour_Types_Interest = tour_types.join(', ')
    if (Array.isArray(travel_with)) fields.Travel_With = travel_with.join(', ')

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'nothing_to_update' })
    }

    const result = await updateRecord(SIGNUPS_TABLE_ID, signup.id, fields)
    if (!result.ok) {
      return res.status(500).json({ error: 'update_failed', details: result.error })
    }

    return res.status(200).json({ ok: true, signup: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
