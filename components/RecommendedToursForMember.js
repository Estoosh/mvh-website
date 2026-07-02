import { useState, useEffect } from 'react'
import Link from 'next/link'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'

// NEEDS VERIFICATION / known limitation: Signups.Regions_Interest stores
// region names (e.g. "צפון", "מרכז"), but Tours only has Cities_Tags
// (specific city names like "חיפה", "ירושלים") — there is no region↔city
// mapping table anywhere in the codebase today. This component does a
// best-effort loose match (checking whether a known city name for a
// region appears in Cities_Tags), and falls back to sorting by View_Count
// when nothing matches. A real mapping table would make this precise.
const REGION_CITY_HINTS = {
  'צפון': ['חיפה', 'צפת', 'טבריה', 'עכו', 'נהריה', 'כרמל'],
  'שפלה': ['ראשון', 'רחובות', 'נס ציונה', 'לוד', 'רמלה'],
  'מרכז': ['תל אביב', 'הרצליה', 'רמת גן', 'פתח תקווה', 'רעננה'],
  'יו"ש': ['גוש עציון', 'אריאל', 'קדומים'],
  'צפון הנגב': ['באר שבע', 'ערד', 'דימונה'],
  'דרום': ['אילת', 'מצפה רמון'],
  'ירושלים': ['ירושלים']
}

function matchesRegions(cityTags, regions) {
  if (!cityTags || !regions || regions.length === 0) return false
  const lower = cityTags.toLowerCase()
  return regions.some((region) => {
    const hints = REGION_CITY_HINTS[region] || []
    return hints.some((hint) => lower.includes(hint.toLowerCase()))
  })
}

export default function RecommendedToursForMember({ regions, excludeTourIds, limit, title }) {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    fetch('/api/tours')
      .then((r) => r.json())
      .then(function(data) {
        const all = (data.records || []).map((r) => Object.assign({ id: r.id }, r.fields))
        const exclude = new Set(excludeTourIds || [])

        const visible = all.filter((t) =>
          t.Tour_Status === 'paid' &&
          t.Content_Status !== 'Hidden' &&
          t.Content_Status !== 'Removed' &&
          !exclude.has(t.id)
        )

        const regional = regions && regions.length > 0
          ? visible.filter((t) => matchesRegions(t.Cities_Tags, regions))
          : []

        const pool = regional.length > 0 ? regional : visible
        const sorted = pool.slice().sort((a, b) => (Number(b.View_Count) || 0) - (Number(a.View_Count) || 0))

        setTours(sorted.slice(0, limit || 4))
      })
      .catch(() => setTours([]))
      .finally(() => setLoading(false))
  }, [regions, excludeTourIds, limit])

  if (loading) return null
  if (tours.length === 0) return null

  return (
    <div>
      {title && <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>{title}</h3>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {tours.map(function(tour) {
          const images = tour.Tour_Images ? tour.Tour_Images.split('|').filter(Boolean) : []
          const thumb = images[0] || null
          return (
            <Link key={tour.id} href={'/tours/' + tour.id} style={{ textDecoration: 'none', color: 'inherit', background: '#fff', borderRadius: 14, border: '1px solid #EDE7DF', overflow: 'hidden', display: 'block' }}>
              <div style={{ height: 130, background: '#e8e0d8' }}>
                {thumb
                  ? <img src={thumb} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#d4c5b0,#c2b09a)' }} />
                }
              </div>
              <div style={{ padding: '14px 16px' }}>
                {tour.Cities_Tags && <p style={{ fontSize: 11, color: BROWN, fontWeight: 700, marginBottom: 4 }}>📍 {tour.Cities_Tags}</p>}
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}>{tour.Tour_Title}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
