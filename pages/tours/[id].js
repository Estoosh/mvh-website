import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const BROWN = '#7E4821'

function ImageGallery({ images }) {
  const [showAll, setShowAll] = useState(false)
  if (!images || images.length === 0) return null
  const visibleCount = 4
  const visible = images.slice(0, visibleCount)
  const remaining = images.length - visibleCount
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
        {visible.map(function(src, i) {
          var isLast = i === visibleCount - 1
          var showPlus = isLast && remaining > 0 && !showAll
          return (
            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', cursor: showPlus ? 'pointer' : 'default' }}
              onClick={function() { if (showPlus) setShowAll(true) }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {showPlus && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 900 }}>
                  +{remaining}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {showAll && images.length > visibleCount && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 8 }}>
          {images.slice(visibleCount).map(function(src, i) {
            return (
              <div key={i} style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RelatedTours({ tours }) {
  if (!tours || tours.length === 0) return null
  return (
    <div style={{ marginTop: 56, paddingTop: 40, borderTop: '1px solid #EDE7DF' }}>
      <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20, letterSpacing: '-0.5px' }}>סיורים נוספים שיכולים לעניין אתכם</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {tours.map(function(t) {
          var thumb = t.Tour_Images ? t.Tour_Images.split('|')[0] : null
          return (
            <a key={t.id} href={'/tours/' + t.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #EDE7DF', borderRadius: 12, overflow: 'hidden', background: '#fff', transition: 'box-shadow 0.2s' }}>
                <div style={{ width: '100%', height: 140, background: '#F7F1EA' }}>
                  {thumb && <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                </div>
                <div style={{ padding: 14 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{t.Tour_Title}</p>
                  <p style={{ fontSize: 12, color: '#6B6B6B' }}>{t.Cities_Tags} · {t.Guide_Name}</p>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default function TourPage({ tour }) {
  const { user, isLoaded } = useUser()
  const [guideName, setGuideName] = useState(null)
  const [isSignedUpForDiscount, setIsSignedUpForDiscount] = useState(false)
  const [isGuide, setIsGuide] = useState(false)
  const [relatedTours, setRelatedTours] = useState([])

  useEffect(function() {
    if (!tour) return
    fetch('/api/track-view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tour_id: tour.id, current_count: tour.View_Count || 0 }) })
    var periodsParam = (tour.Historical_Period || []).join('|')
    fetch('/api/related-tours?exclude_id=' + tour.id + '&cities=' + encodeURIComponent(tour.Cities_Tags || '') + '&guide_name=' + encodeURIComponent(tour.Guide_Name || '') + '&periods=' + encodeURIComponent(periodsParam))
      .then(function(r) { return r.json() })
      .then(function(data) { setRelatedTours(data.tours || []) })
  }, [tour])

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id).then(r => r.json()).then(function(data) {
      if (data.found) { setGuideName(data.guide.Guide_Name); setIsGuide(true) }
    })
    fetch('/api/get-signup?clerk_id=' + user.id).then(r => r.json()).then(function(data) {
      if (data.found) setIsSignedUpForDiscount(true)
    })
  }, [isLoaded, user])

  if (!tour) return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B6B6B', fontSize: 16 }}>הסיור לא נמצא</p>
      </main>
      <Footer />
    </div>
  )

  const phone = tour.WhatsApp_Number ? tour.WhatsApp_Number.replace(/\D/g, '').replace(/^0/, '') : ''
  const guideFirstName = tour.Guide_Name ? tour.Guide_Name.split(' ')[0] : ''
  const fullPrice = Number(tour.Price_Per_Person) || 0
  const discountedPrice = Math.round(fullPrice * 0.9)
  const isOwnTour = guideName && guideName === tour.Guide_Name
  const hasDiscount = (isSignedUpForDiscount || isGuide) && !isOwnTour

  const waMessageText = hasDiscount
    ? 'היי ' + guideFirstName + '! ראיתי את הסיור שלך "' + tour.Tour_Title + '" באתר MvH ואני אשמח להצטרף במחיר המוזל לחברי קהילה - ' + discountedPrice + ' ש"ח (במקום ' + fullPrice + '), שנבדוק מועדים אפשריים?'
    : 'היי ' + guideFirstName + '! ראיתי את הסיור שלך "' + tour.Tour_Title + '" באתר MvH ואני מתעניין/ת, שנבדוק מועדים אפשריים?'
  const waLink = 'https://wa.me/972' + phone + '?text=' + encodeURIComponent(waMessageText)
  const images = tour.Tour_Images ? tour.Tour_Images.split('|').map(s => s.trim()).filter(Boolean) : []

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>{tour.Tour_Title} | מאז ועד היום</title>
        <meta name="description" content={tour.Tour_Teaser || ''} />
      </Head>
      <Header />

      {/* Hero */}
      <div style={{ background: '#111', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {tour.Cities_Tags && (
              <span style={{ background: 'rgba(126,72,33,0.25)', color: '#D4956A', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                📍 {tour.Cities_Tags}
              </span>
            )}
            {tour.Duration_Hours && (
              <span style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                🕐 {tour.Duration_Hours} שעות
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: '#fff', marginBottom: 14, letterSpacing: '-1px', lineHeight: 1.1 }}>{tour.Tour_Title}</h1>
          {tour.Tour_Teaser && <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{tour.Tour_Teaser}</p>}
        </div>
      </div>

      <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        <ImageGallery images={images} />

        {/* story */}
        {tour.Tour_Story && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', marginBottom: 28, border: '1px solid #EDE7DF', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 16, lineHeight: 1.9, color: '#444', whiteSpace: 'pre-line' }}>{tour.Tour_Story}</p>
          </div>
        )}

        {/* price + CTA card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', marginBottom: 28, border: '1px solid #EDE7DF', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>מורה הדרך</p>
              <p style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>{tour.Guide_Name}</p>
              {hasDiscount ? (
                <div>
                  <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 2 }}>מחיר לחברי קהילה</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <s style={{ color: '#B0A89E', fontSize: 15 }}>{fullPrice} ₪</s>
                    <span style={{ fontSize: 28, fontWeight: 900, color: BROWN }}>{discountedPrice} ₪</span>
                    <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>10% הנחה</span>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 2 }}>מחיר לאדם</p>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#111' }}>{fullPrice} ₪</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
              {!isOwnTour && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  onClick={function() {
                    fetch('/api/increment-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tour_id: tour.id, current_count: tour.Lead_Count || 0 }) })
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#25D366', color: '#fff', padding: '14px 24px', borderRadius: 10, fontSize: 16, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M3 21l1.65-4.95A8.95 8.95 0 0 1 3 12a9 9 0 1 1 9 9 8.95 8.95 0 0 1-4.05-.96L3 21z"/>
                    <path d="M8.5 9.5c0 3.5 2.5 6 6 6 .5 0 1-.4 1-1l-.3-1.2c-.1-.4-.5-.6-.9-.5l-1.3.4c-.7-.5-1.7-1.5-2.2-2.2l.4-1.3c.1-.4-.1-.8-.5-.9L9.5 8.5c-.6 0-1 .5-1 1z"/>
                  </svg>
                  שלחו וואטסאפ
                </a>
              )}
              {isOwnTour && (
                <Link href={'/edit-tour/' + tour.id}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', padding: '14px 24px', borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                  ✏️ ערוך סיור
                </Link>
              )}
              {!hasDiscount && !isOwnTour && (
                <Link href="/discount"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#F7F1EA', color: BROWN, border: '1.5px solid #EDE7DF', padding: '12px 24px', borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                  קבלו 10% הנחה ←
                </Link>
              )}
            </div>
          </div>

          {hasDiscount && (
            <p style={{ fontSize: 13, color: '#22c55e', marginTop: 16, fontWeight: 700 }}>
              ✓ ההודעה תכלול אוטומטית מחיר עם 10% הנחה: {discountedPrice} ש"ח
            </p>
          )}
        </div>

        <RelatedTours tours={relatedTours} />
      </main>
      <Footer />
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) return { props: { tour: null } }
    const record = await response.json()
    const tour = Object.assign({ id: record.id }, record.fields)
    return { props: { tour } }
  } catch(e) { return { props: { tour: null } } }
}
