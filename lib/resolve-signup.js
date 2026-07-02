// Shared helper for the Member Area routes. Mirrors the lookup already
// used in pages/api/get-signup.js — same table, same filter — just
// centralized so save-tour.js, get-saved-tours.js, and
// remove-saved-tour.js don't each re-implement it.
const SIGNUPS_TABLE = 'Signups'

export async function resolveSignupByClerkId(clerkId) {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  const url =
    `https://api.airtable.com/v0/${baseId}/${SIGNUPS_TABLE}?filterByFormula=` +
    encodeURIComponent(`{Clerk_ID}="${clerkId}"`)

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const data = await response.json()

  if (!data.records || data.records.length === 0) {
    return null
  }

  return { id: data.records[0].id, fields: data.records[0].fields }
}
