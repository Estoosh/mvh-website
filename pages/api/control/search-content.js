import { fetchAllRecords } from '../../../lib/airtable'

// Read-only. GET only. Reads Tours and Guides (existing, Founder-Flow-
// owned tables) — never writes.
//
// Field names confirmed against pages/api/add-tour.js: Tour_Title,
// Tour_Teaser, Tour_Story (there is no single "Tour_Description" field).
// Guide bio field confirmed as Guide_bio (lowercase b, per
// register-founder.js / add-tour.js).
const TOURS_TABLE_ID = 'tbltsGvfPLMAmJ764'
const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'

function textIncludes(haystack, needle) {
  return String(haystack || '').toLowerCase().includes(needle)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })

  const query = String(req.query.q || '').trim().toLowerCase()
  if (!query) {
    return res.status(400).json({ error: 'missing_query' })
  }

  try {
    const guides = await fetchAllRecords(GUIDES_TABLE_ID)
    const guideByName = new Map(guides.map((g) => [g.Guide_Name, g]))

    const tours = await fetchAllRecords(TOURS_TABLE_ID)

    const matches = tours.filter((tour) => {
      const guide = guideByName.get(tour.Guide_Name)
      return (
        textIncludes(tour.Tour_Title, query) ||
        textIncludes(tour.Tour_Teaser, query) ||
        textIncludes(tour.Tour_Story, query) ||
        textIncludes(tour.Guide_Name, query) ||
        (guide && textIncludes(guide.Guide_bio, query))
      )
    })

    return res.status(200).json({
      ok: true,
      query,
      resultCount: matches.length,
      results: matches.map((t) => ({
        id: t.id,
        tour_title: t.Tour_Title,
        guide_name: t.Guide_Name,
        tour_status: t.Tour_Status,
        content_status: t.Content_Status || 'Visible'
      }))
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
