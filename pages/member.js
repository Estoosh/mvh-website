import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'

const TOUR_IMAGES = {
  'אפולוניה': '/Tour-Apolonia.jpg',
  'עיר דוד': '/Tour-Davidcity.jpg',
  'עין גדי': '/Tour-EinGedi.jpg',
  'ירושלים': '/Tour-Churches.jpg',
  'כנסיות': '/Tour-Churches.jpg',
  'צפת': '/Tour-Safed.jpg',
}

function getTourImage(tour) {
  const title = tour.Tour_Title || ''
  const city = tour.Cities_Tags || ''
  for (const [key, val] of Object.entries(TOUR_IMAGES)) {
    if (title.includes(key) || city.includes(key)) return val
  }
  return null
}

function TourRow({ tour }) {
  const thumb = (tour.Tour_Images ? tour.Tour_Images.split('|')[0] : null) || getTourImage(tour)
  const price = Number(tour.Price_Per_Person) || 0
  const isCollab = tour.Tour_Status === 'collab'
  const title = tour.Tour_Title || 'סיור'

  return (
    <a href={'/tours/' + tour.id} style={{ textDecoration: 'none', color: 'inherit', display: 'grid', gridTemplateColumns: '150px 1fr 110px', background: '#fff', borderRadius: 12, border: '1px solid #EDE7DF', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ height: 120, background: '#1a0d06' }}>
        {thumb
          ? <img src={thumb} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#3a1a08,#1a0d06)' }} />
        }
      </div>
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#222', marginBottom: 5, fontFamily: 'Heebo, Arial, sans-serif' }}>{title}</p>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#888', marginBottom: 6, fontFamily: 'Heebo, Arial, sans-serif' }}>
          {tour.Cities_Tags && <span>📍 {tour.Cities_Tags}</span>}
          {tour.Duration_Hours && <span>🕐 {tour.Duration_Hours} שעות</span>}
        </div>
        {tour.Tour_Teaser && <p style={{ fontSize: 12, color: '#999', lineHeight: 1.55, fontFamily: 'Heebo, Arial, sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tour.Tour_Teaser}</p>}
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #F0EAE2' }}>
        {isCollab
          ? <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 16, fontFamily: 'Heebo, Arial, sans-serif', textAlign: 'center' }}>🎙 MvH</span>
          : <span style={{ fontSize: 17, fontWeight: 800, color: BROWN, fontFamily: 'Heebo, Arial, sans-serif' }}>{price} ₪</span>
        }
        <span style={{ fontSize: 11, color: BROWN, fontWeight: 600, fontFamily: 'Heebo, Arial, sans-serif', marginTop: 5 }}>לפרטים ←</span>
      </div>
    </a>
  )
}

export default function GuidePage({ guide, tours }) {
  const { user, isLoaded } = useUser()
  const [following, setFollowing] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(function() {
    if (!isLoaded || !user || !guide) return
    fetch('/api/get-following?clerk_id=' + user.id)
      .then((r) => r.json())
      .then(function(data) {
        const match = (data.guides || []).find(function(g) { return g.id === guide.id })
        if (match) setFollowing(true)
      })
      .catch(function() {})
  }, [isLoaded, user, guide])

  const toggleFollow = async function() {
    if (!user) {
      window.location.href = '/sign-up'
      return
    }
    setToggling(true)
    try {
      const endpoint = following ? '/api/unfollow-guide' : '/api/follow-guide'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerk_id: user.id, guide_id: guide.id })
      })
      const data = await res.json()
      if (data.ok) setFollowing(!following)
    } catch (e) {}
    setToggling(false)
  }

  if (!guide) return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header /><main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#6B6B6B' }}>המדריך לא נמצא</p></main><Footer />
    </div>
  )

  const tags = guide.Guide_Tags ? guide.Guide_Tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const photo = guide.Guide_Photo || null
  const name = guide.Guide_Name || ''
  const firstName = name.split(' ')[0]
  const guideTitle = guide.Guide_Title || guide.Guide_title || ''
  const bio = guide.Guide_Bio || guide.Guide_bio || ''
  const region = guide.Guide_Region || ''

  const socialLinks = [
    guide.Website && { label: 'אתר', href: guide.Website, icon: '🌐' },
    guide.Facebook && { label: 'Facebook', href: guide.Facebook, icon: '📘' },
    guide.Instagram && { label: 'Instagram', href: guide.Instagram, icon: '📷' },
    guide.TikTok && { label: 'TikTok', href: guide.TikTok, icon: '♪' },
  ].filter(Boolean)

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#FAFAF8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>{name} | מאז ועד היום</title>
        <meta name="description" content={bio} />
      </Head>
      <Header />

      <main style={{ flex: 1, maxWidth: 820, margin: '0 auto', padding: '32px 24px', width: '100%' }}>

        {/* TOP */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 32, alignItems: 'start' }}>

          {/* photo */}
          <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '3/4', background: '#e8e0d8', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            {photo
              ? <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />
              : <div style={{ width: '100%', height: '100%', background: '#ddd4c8' }} />
            }
          </div>

          {/* info card */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #EDE7DF', display: 'flex', flexDirection: 'column', gap: 12 }}>

            <div>
              <p style={{ fontSize: 10, color: '#C0B8AE', marginBottom: 5, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>מורה דרך</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2a2a2a', marginBottom: 3, letterSpacing: '-0.2px' }}>{name}</h1>
                <button onClick={toggleFollow} disabled={toggling}
                  style={{ background: following ? '#FBF7F1' : '#111', color: following ? BROWN : '#fff', border: '1px solid ' + (following ? '#EDE7DF' : '#111'), padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: toggling ? 'not-allowed' : 'pointer', fontFamily: 'Heebo, Arial, sans-serif', opacity: toggling ? 0.7 : 1 }}>
                  {following ? '✓ עוקב' : '+ עקבו'}
                </button>
              </div>
              {guideTitle && <p style={{ fontSize: 13, color: BROWN, fontWeight: 600 }}>{guideTitle}</p>}
            </div>

            {(region || tags.length > 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {region && <p style={{ fontSize: 12, color: '#888' }}>📍 {region}</p>}
                {tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {tags.map(t => (
                      <span key={t} style={{ background: 'rgba(126,72,33,0.06)', color: '#9a6040', border: '1px solid rgba(126,72,33,0.12)', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 16 }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {bio && (
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, borderTop: '1px solid #F0EAE2', paddingTop: 12 }}>{bio}</p>
            )}

            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 4 }}>
                {socialLinks.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#666', textDecoration: 'none', background: '#F7F1EA', border: '1px solid #EDE7DF', padding: '4px 10px', borderRadius: 16 }}>
                    {s.icon} {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TOURS */}
        <div>
          <p style={{ fontSize: 11, color: '#B0A89E', marginBottom: 12, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>הסיורים של {firstName}</p>
          {tours.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, padding: 36, textAlign: 'center', border: '1px solid #EDE7DF' }}>
              <p style={{ color: '#C0B8AE', fontSize: 13 }}>עדיין אין סיורים פעילים</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tours.map(t => <TourRow key={t.id} tour={t} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID

    const guideRes = await fetch(`https://api.airtable.com/v0/${baseId}/tblsJ5Ok1yPSgtvSj/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!guideRes.ok) return { props: { guide: null, tours: [] } }
    const guideRecord = await guideRes.json()
    const guide = Object.assign({ id: guideRecord.id }, guideRecord.fields)

    let tours = []
    if (guide.Guide_Name) {
      const toursRes = await fetch(`https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764?filterByFormula={Guide_Name}="${guide.Guide_Name}"`, { headers: { Authorization: `Bearer ${token}` } })
      const toursData = await toursRes.json()
      tours = (toursData.records || []).map(r => Object.assign({ id: r.id }, r.fields)).filter(t => t.Tour_Status === 'paid' || t.Tour_Status === 'collab')
    }

    return { props: { guide, tours } }
  } catch(e) { return { props: { guide: null, tours: [] } } }
}
