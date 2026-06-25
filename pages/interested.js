import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'

function formatDate(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
  } catch(e) { return '' }
}

export default function Interested() {
  const [tours, setTours] = useState(null)

  useEffect(function() {
    try {
      const saved = JSON.parse(localStorage.getItem('mvh_interested_tours') || '[]')
      setTours(saved)
    } catch(e) {
      setTours([])
    }
  }, [])

  function removeTour(id) {
    try {
      const updated = (tours || []).filter(function(t) { return t.id !== id })
      localStorage.setItem('mvh_interested_tours', JSON.stringify(updated))
      setTours(updated)
    } catch(e) {}
  }

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>הדברים שסימנתם | מאז ועד היום</title>
        <meta name="description" content="הסיורים שתפסו לכם את העין" />
      </Head>
      <Header />

      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '48px 24px 64px', width: '100%' }}>

        {/* page header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, color: BROWN, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>הרשימה שלכם</p>
          <h1 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#1a1a1a', marginBottom: 12, letterSpacing: '-0.3px' }}>
            הדברים שסימנתם כמעניינים
          </h1>
          <p style={{ fontSize: 16, color: '#6B6B6B', lineHeight: 1.75, maxWidth: 580 }}>
            עדיין לא צריך להחליט. שמרנו כאן את הסיורים שתפסו לכם את העין, כדי שתוכלו לחזור אליהם כשיגיע הרגע לצאת מהבית.
          </p>
        </div>

        {/* loading state */}
        {tours === null && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#B0A89E', fontSize: 15 }}>
            טוען...
          </div>
        )}

        {/* empty state */}
        {tours !== null && tours.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 20, border: '1px solid #EDE7DF' }}>
            <p style={{ fontSize: 36, marginBottom: 18 }}>❤️</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>
              עוד לא סימנתם סיורים שמעניינים אתכם
            </h2>
            <p style={{ fontSize: 15, color: '#6B6B6B', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 28px' }}>
              כשתראו סיור שתרצו לחזור אליו אחר כך, לחצו על "❤️ זה מעניין אותי" והוא יופיע כאן.
            </p>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', background: BROWN, color: '#fff', padding: '13px 26px', borderRadius: 999, fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
              גלו סיורים ←
            </Link>
          </div>
        )}

        {/* tour cards */}
        {tours !== null && tours.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {tours.map(function(tour) {
              const dateStr = formatDate(tour.savedAt)
              return (
                <div key={tour.id} style={{ background: '#fff', borderRadius: 18, border: '1px solid #EDE7DF', overflow: 'hidden', display: 'grid', gridTemplateColumns: '220px 1fr', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                  {/* image */}
                  <div style={{ height: 200, background: '#e8e0d8', position: 'relative' }}>
                    {tour.tourImage
                      ? <img src={tour.tourImage} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display='none'} />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#d4c5b0,#c2b09a)' }} />
                    }
                  </div>

                  {/* content */}
                  <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        {tour.Cities_Tags && (
                          <span style={{ fontSize: 12, color: '#6B6B6B', background: CREAM, border: '1px solid #EDE7DF', padding: '3px 10px', borderRadius: 16, fontWeight: 600 }}>
                            📍 {tour.Cities_Tags}
                          </span>
                        )}
                        {tour.Guide_Name && (
                          <span style={{ fontSize: 12, color: '#6B6B6B', background: CREAM, border: '1px solid #EDE7DF', padding: '3px 10px', borderRadius: 16, fontWeight: 600 }}>
                            {tour.Guide_Name}
                          </span>
                        )}
                        {dateStr && (
                          <span style={{ fontSize: 12, color: '#B0A89E', padding: '3px 0' }}>
                            סומן ב-{dateStr}
                          </span>
                        )}
                      </div>

                      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, letterSpacing: '-0.2px', lineHeight: 1.3 }}>
                        {tour.Tour_Title}
                      </h2>

                      {tour.Tour_Teaser && (
                        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {tour.Tour_Teaser}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16 }}>
                      <Link href={'/tours/' + tour.id} style={{ display: 'inline-flex', alignItems: 'center', background: BROWN, color: '#fff', padding: '10px 20px', borderRadius: 999, fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                        פתחו את הסיור ←
                      </Link>
                      <button onClick={() => removeTour(tour.id)} style={{ background: 'transparent', color: '#B0A89E', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif', padding: '10px 4px' }}>
                        הסירו מהרשימה
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* bottom CTA */}
        {tours !== null && tours.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', color: BROWN, border: '1.5px solid #EDE7DF', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
              גלו עוד סיורים ←
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
