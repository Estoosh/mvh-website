import { fetchAllRecords, getRecord } from '../../lib/airtable'
import { resolveSignupByClerkId } from '../../lib/resolve-signup'

// NEEDS VERIFICATION: this table does not exist yet — inert until created.
const SAVED_TOURS_TABLE_ID = process.env.AIRTABLE_TABLE_SAVED_TOURS

// Existing, Founder-Flow-owned table. Read-only — never written to here.
const TOURS_TABLE_ID = 'tbltsGvfPLMAmJ764'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })

  const clerkId = req.query.clerk_id
  if (!clerkId) {
    return res.status(400).json({ error: 'missing_clerk_id' })
  }

  if (!SAVED_TOURS_TABLE_ID) {
    return res.status(500).json({ error: 'saved_tours_table_not_configured' })
  }

  try {
    const signup = await resolveSignupByClerkId(clerkId)
    if (!signup) {
      return res.status(200).json({ ok: true, tours: [] })
    }

    const savedEntries = await fetchAllRecords(SAVED_TOURS_TABLE_ID, {
      filterByFormula: `{Signup_ID} = '${signup.id}'`
    })

    const tours = []
    for (const entry of savedEntries) {
      const tourId = Array.isArray(entry.Tour_ID) ? entry.Tour_ID[0] : entry.Tour_ID
      if (!tourId) continue

      const tour = await getRecord(TOURS_TABLE_ID, tourId)
      if (!tour) continue

      // Skip tours that were hidden/removed by moderation (Control Center)
      // since the signup last saved them — a saved tour shouldn't surface
      // content that's no longer publicly visible.
      if (tour.Content_Status === 'Hidden' || tour.Content_Status === 'Removed') continue

      tours.push({
        saved_entry_id: entry.id,
        saved_at: entry.Saved_At,
        id: tour.id,
        Tour_Title: tour.Tour_Title,
        Tour_Teaser: tour.Tour_Teaser,
        Cities_Tags: tour.Cities_Tags,
        Guide_Name: tour.Guide_Name,
        Price_Per_Person: tour.Price_Per_Person,
        Tour_Images: tour.Tour_Images
      })
    }

    tours.sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at))

    return res.status(200).json({ ok: true, tours })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
