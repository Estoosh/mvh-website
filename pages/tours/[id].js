import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'

function ImageGallery({ images }) {
  const [showAll, setShowAll] = useState(false)
  if (!images || images.length === 0) return null

  const visibleCount = 4
  const visible = images.slice(0, visibleCount)
  const remaining = images.length - visibleCount

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
        {visible.map(function(src, i) {
          var isLastVisible = i === visibleCount - 1
          var showPlus = isLastVisible && remaining > 0 && !showAll
          return (
            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', cursor: showPlus ? 'pointer' : 'default' }}
              onClick={function() { if (showPlus) setShowAll(true) }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {showPlus && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 28, fontWeight: 700 }}>
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
              <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
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
    <div style={{ marginTop: 56, paddingTop: 40, borderTop: '1px solid #eee' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>סיורים נוספים שיכולים לעניין אתכם</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {tours.map(function(t) {
          var thumb = t.Tour_Images ? t.Tour_Images.split('|')[0] : null
          return (
            <a key={t.id} href={'/tours/' + t.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: 140, background: '#f5f5f5' }}>
                  {thumb && <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                </div>
                <div style={{ padding: 12 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{t.Tour_Title}</p>
                  <p style={{ fontSize: 12, color: '#888' }}>{t.Cities_Tags} · {t.Guide_Name}</p>
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
    var periodsParam = (tour.Historical_Period || []).join('|')
    var url = '/api/related-tours?exclude_id=' + tour.id +
      '&cities=' + encodeURIComponent(tour.Cities_Tags || '') +
      '&guide_name=' + encodeURIComponent(tour.Guide_Name || '') +
      '&periods=' + encodeURIComponent(periodsParam)
    fetch(url)
      .then(function(r) { return r.json() })
      .then(function(data) { setRelatedTours(data.tours || []) })
  }, [tour])

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.found) { setGuideName(data.guide.Guide_Name); setIsGuide(true) }
      })
    fetch('/api/get-signup?clerk_id=' + user.id)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.found) setIsSignedUpForDiscount(true)
      })
  }, [isLoaded, user])

  if (!tour) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <p>הסיור לא נמצא</p>
        </div>
      </div>
    )
  }

  const phone = tour.WhatsApp_Number ? tour.WhatsApp_Number.replace(/\D/g, '').replace(/^0/, '') : ''
  const guideFirstName = tour.Guide_Name ? tour.Guide_Name.split(' ')[0] : ''
  const fullPrice = Number(tour.Price_Per_Person) || 0
  const discountedPrice = Math.round(fullPrice * 0.9)

  var isOwnTour = guideName && guideName === tour.Guide_Name
  var hasDiscount = (isSignedUpForDiscount || isGuide) && !isOwnTour
  var waMessageText
  if (hasDiscount) {
    waMessageText = 'היי ' + guideFirstName + '! ראיתי את הסיור שלך "' + tour.Tour_Title + '" באתר MvH ואני אשמח להצטרף במחיר המוזל לחברי קהילה - ' + discountedPrice + ' ש"ח (במקום ' + fullPrice + '), שנבדוק מועדים אפשריים?'
  } else {
    waMessageText = 'היי ' + guideFirstName + '! ראיתי את הסיור שלך "' + tour.Tour_Title + '" באתר MvH ואני מתעניין/ת, שנבדוק מועדים אפשריים?'
  }
  const waMessage = encodeURIComponent(waMessageText)
  const waLink = 'https://wa.me/972' + phone + '?text=' + waMessage
  const images = tour.Tour_Images ? tour.Tour_Images.split('|').map(function(s) { return s.trim() }).filter(Boolean) : []

  return (
    <div>
      <Head>
        <title>{tour.Tour_Title} | MvH</title>
      </Head>
      <Header />
      <div style={{ background: '#0f0f0f', padding: '56px 24px', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>{tour.Tour_Title}</h1>
          <p style={{ fontSize: 18, color: '#999999' }}>{tour.Tour_Teaser}</p>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <ImageGallery images={images} />
        <p style={{ fontSize: 16, lineHeight: 1.8, color: '#444444', marginBottom: 32 }}>{tour.Tour_Story}</p>
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{tour.Price_Per_Person} ILS</p>
        <p style={{ marginBottom: 8, color: '#555555' }}>{tour.Cities_Tags}</p>
        <p style={{ marginBottom: 32, color: '#555555' }}>{tour.Guide_Name}</p>
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          onClick={function() {
            if (!isOwnTour) {
              fetch('/api/increment-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tour_id: tour.id, current_count: tour.Lead_Count || 0 })
              })
            }
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', color: '#25D366', border: '2px solid #25D366', padding: '14px 32px', borderRadius: 8, fontSize: 18, fontWeight: 700, textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.8">
            <path d="M3 21l1.65-4.95A8.95 8.95 0 0 1 3 12a9 9 0 1 1 9 9 8.95 8.95 0 0 1-4.05-.96L3 21z" />
            <path d="M8.5 9.5c0 3.5 2.5 6 6 6 .5 0 1-.4 1-1l-.3-1.2c-.1-.4-.5-.6-.9-.5l-1.3.4c-.7-.5-1.7-1.5-2.2-2.2l.4-1.3c.1-.4-.1-.8-.5-.9L9.5 8.5c-.6 0-1 .5-1 1z" />
          </svg>
          WhatsApp
        </a>
        {hasDiscount && (
          <p style={{ fontSize: 13, color: '#C4922A', marginTop: 12 }}>✓ ההודעה תכלול אוטומטית מחיר עם 10% הנחה: {discountedPrice} ש"ח</p>
        )}
        {isOwnTour && (
          <Link href={'/edit-tour/' + tour.id}
            style={{ marginRight: 12, background: '#fff', color: '#0A0A0A', border: '1px solid #0A0A0A', padding: '14px 32px', borderRadius: 8, fontSize: 18, fontWeight: 700, textDecoration: 'none', display: 'inline-block', marginTop: 12 }}>
            ערוך סיור
          </Link>
        )}
        <RelatedTours tours={relatedTours} />
      </div>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764/${params.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) return { props: { tour: null } }
    const record = await response.json()
    const tour = Object.assign({ id: record.id }, record.fields)
    return { props: { tour } }
  } catch(e) {
    return { props: { tour: null } }
  }
}
