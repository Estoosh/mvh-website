import { fetchAllRecords } from '../../../lib/airtable'

// Existing, Founder-Flow-owned table. Read-only. All fields used here
// (Business_Name, Guide_title, Invite_Source, Profile_Status,
// Founder_Stage, Signup_Source, Public_Profile_Link, "Summary (Guide_bio)")
// already exist on this table per the founder's confirmation — no schema
// change involved in this route.
const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'

// NEEDS VERIFICATION / Phase 2 dependency, flagged rather than faked:
// "Ready For Outreach", "Already Contacted", and "Published First Tour"
// filters from the spec depend on Communication History and a Tours
// cross-reference, neither of which exist yet (both are later phases).
// Only the filters computable from fields that exist today are
// implemented here.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' })

  const {
    has_whatsapp,
    has_email,
    missing_contact,
    founder_candidate,
    registered,
    search
  } = req.query

  try {
    const all = await fetchAllRecords(GUIDES_TABLE_ID)

    // Default scope: Discovery/Lead records only (Guide_Status blank —
    // per the founder's decision, Guide_Status stays untouched by
    // Discovery and only gets set once someone actually registers
    // through the existing Founder Flow). The "registered" filter
    // below is the explicit opt-in to also see already-registered guides.
    let records = all.filter((g) => !g.Guide_Status)

    if (registered === 'true') {
      records = all.filter((g) => !!g.Guide_Status)
    }

    if (has_whatsapp === 'true') records = records.filter((g) => !!g.WhatsApp_Number)
    if (has_email === 'true') records = records.filter((g) => !!g.Email)
    if (missing_contact === 'true') records = records.filter((g) => !g.WhatsApp_Number && !g.Email)
    if (founder_candidate === 'true') records = records.filter((g) => !!g.Founder_Stage)

    if (search) {
      const q = String(search).toLowerCase()
      records = records.filter((g) =>
        (g.Guide_Name || '').toLowerCase().includes(q) ||
        (g.Business_Name || '').toLowerCase().includes(q) ||
        (g.Email || '').toLowerCase().includes(q) ||
        (g.WhatsApp_Number || '').includes(q) ||
        (g.Tours || '').toLowerCase().includes(q)
      )
    }

    const result = records.map((g) => ({
      id: g.id,
      Guide_Name: g.Guide_Name,
      Business_Name: g.Business_Name,
      Guide_title: g.Guide_title,
      Email: g.Email,
      WhatsApp_Number: g.WhatsApp_Number,
      Invite_Source: g.Invite_Source,
      Profile_Status: g.Profile_Status,
      Guide_Status: g.Guide_Status,
      Founder_Status: g.Founder_Status,
      Founder_Stage: g.Founder_Stage,
      Public_Profile_Link: g.Public_Profile_Link,
      Tours: g.Tours
    }))

    return res.status(200).json({ ok: true, count: result.length, records: result })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
