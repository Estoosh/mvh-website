import { createRecord } from '../../../lib/airtable'
import { writeAuditLog } from '../../../lib/audit-log'

// Existing, Founder-Flow-owned table. All fields written here already
// exist per the founder's confirmation — no schema change.
const GUIDES_TABLE_ID = 'tblsJ5Ok1yPSgtvSj'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const {
    guide_name,
    business_name,
    email,
    whatsapp_number,
    guide_title,
    guide_bio,
    public_profile_link,
    tours,
    invite_source,
    summary,
    created_by
  } = req.body || {}

  if (!guide_name || !created_by) {
    return res.status(400).json({ error: 'missing_required_fields' })
  }

  try {
    // Guide_Status is intentionally NOT set here — it stays blank until
    // the person actually registers through the existing Founder Flow
    // (add-tour.js sets it to 'pending' at that point). This is how
    // Discovery/Lead records are distinguished from registered guides
    // (Control Center Discovery Spec, "Guide_Status decision").
    const fields = { Guide_Name: guide_name }
    if (business_name) fields.Business_Name = business_name
    if (email) fields.Email = email
    if (whatsapp_number) fields.WhatsApp_Number = whatsapp_number
    if (guide_title) fields.Guide_title = guide_title
    if (guide_bio) fields.Guide_bio = guide_bio
    if (public_profile_link) fields.Public_Profile_Link = public_profile_link
    if (tours) fields.Tours = tours
    if (invite_source) fields.Invite_Source = invite_source
    if (summary) fields['Summary (Guide_bio)'] = summary

    const result = await createRecord(GUIDES_TABLE_ID, fields)
    if (!result.ok) {
      return res.status(500).json({ error: 'create_failed', details: result.error })
    }

    await writeAuditLog({
      actor: created_by,
      module: 'Other',
      actionType: 'Discovery Lead Added (manual)',
      targetType: 'Guide',
      targetId: result.record.id,
      afterValue: JSON.stringify(fields)
    })

    return res.status(200).json({ ok: true, record: result.record })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
