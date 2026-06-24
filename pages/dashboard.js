import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'

const BROWN = '#7E4821'

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [guide, setGuide] = useState(null)
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)

  useEffect(function() {
    if (!isLoaded) return
    if (!user) { router.push('/sign-in'); return }
    fetch('/api/get-guide?clerk_id=' + user.id + '&email=' + encodeURIComponent(user.emailAddresses?.[0]?.emailAddress || ''))
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (!data.found) { router.push('/join'); return }
        setGuide(data.guide)
        setStatus(data.guide.Guide_Status || 'active')
        if (data.guide.Guide_Status === 'pending' || data.guide.Guide_Status === 'rejected') {
          setLoading(false)
          return null
        }
        return fetch('/api/get-guide-tours?guide_name=' + encodeURIComponent(data.guide.Guide_Name))
      })
      .then(function(r) { if (!r) return null; return r.json() })
      .then(function(data) {
        if (!data) return
        setTours(data.tours || [])
        setLoading(false)
      })
  }, [isLoaded, user])

  if (loading) return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F1EA' }}>
      <p style={{ color: '#6B6B6B' }}>טוען...</p>
    </div>
  )
  if (!guide) return null

  // ── PENDING ──
  if (status === 'pending') {
    return (
      <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', background: '#fff', borderRadius: 18, padding: 48, border: '1px solid #EDE7DF', boxShadow: '0 8px 28px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>⏳</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12, letterSpacing: '-0.5px' }}>הפרופיל שלכם בבדיקה</h1>
            <p style={{ color: '#6B6B6B', lineHeight: 1.8, marginBottom: 28, fontSize: 15 }}>
              קיבלנו את פרטיכם ואת תעודת מורה הדרך.<br />
              הצוות שלנו יאשר את הפרופיל תוך <strong>48 שעות</strong>.<br />
              תקבלו מייל כשהפרופיל יאושר.
            </p>
            <div style={{ background: '#F7F1EA', borderRadius: 12, padding: '16px 20px', textAlign: 'right', marginBottom: 28 }}>
              <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>שם</p>
              <p style={{ fontWeight: 800, fontSize: 15 }}>{guide.Guide_Name}</p>
              {guide.Business_Name && <><p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 8, marginBottom: 4 }}>שם העסק</p>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{guide.Business_Name}</p></>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
              {[0,1,2].map(i => <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ width: i === 0 ? 10 : 8, height: i === 0 ? 10 : 8, borderRadius: '50%', background: i === 0 ? BROWN : '#D5CAC0', display: 'inline-block' }} />
                {i < 2 && <span style={{ width: 32, height: 2, background: '#D5CAC0', display: 'inline-block' }} />}
              </span>)}
            </div>
            <p style={{ fontSize: 11, color: '#B0A89E', marginTop: 8 }}>שלב 1 מתוך 3 — ממתין לאישור</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ── REJECTED ──
  if (status === 'rejected') {
    return (
      <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', background: '#fff', borderRadius: 18, padding: 48, border: '1px solid #EDE7DF', boxShadow: '0 8px 28px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>❌</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>הפרופיל לא אושר</h1>
            <p style={{ color: '#6B6B6B', lineHeight: 1.8, marginBottom: 28, fontSize: 15 }}>
              לצערנו לא הצלחנו לאשר את הפרופיל שלכם.<br />
              ייתכן שהתעודה לא ברורה או אינה בתוקף.<br />
              נא צרו קשר עם הצוות שלנו.
            </p>
            <a href="mailto:ask@mvh.co.il" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BROWN, color: '#fff', padding: '13px 28px', borderRadius: 8, fontSize: 15, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
              צרו קשר ←
            </a>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ── ACTIVE ──
  const totalDue = tours.filter(function(t) { return t.Tour_Status === 'paid' }).reduce(function(sum, t) { return sum + (t.Price_Per_Person || 0) }, 0)

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 1000, margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 4, letterSpacing: '-0.5px' }}>שלום, {guide.Guide_Name}</h1>
            <p style={{ color: '#6B6B6B', fontSize: 14 }}>{guide.Business_Name}</p>
          </div>
          <Link href="/add-tour" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#111', color: '#fff', padding: '12px 22px', borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
            + הוסף סיור
          </Link>
        </div>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { val: tours.length, label: 'סיורים פעילים', color: BROWN },
            { val: tours.reduce(function(s,t) { return s+(t.Lead_Count||0) }, 0), label: 'סה"כ פניות', color: '#111' },
            { val: '₪'+totalDue, label: 'חיוב חודשי צפוי', color: BROWN },
          ].map(function(s) {
            return (
              <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #EDE7DF', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 13, color: '#6B6B6B' }}>{s.label}</div>
              </div>
            )
          })}
        </div>

        {/* tours */}
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>הסיורים שלי</h2>
        {tours.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EDE7DF' }}>
            <p style={{ color: '#B0A89E', marginBottom: 20, fontSize: 15 }}>עדיין אין סיורים פעילים</p>
            <Link href="/add-tour" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#111', color: '#fff', padding: '12px 22px', borderRadius: 8, fontSize: 14, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
              + הוסף סיור ראשון
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tours.map(function(tour) {
              const statusLabel = { paid: 'פעיל', frozen: 'מוקפא', removed: 'מוסר', collab: 'שת"פ MvH' }
              const statusColor = { paid: '#22c55e', frozen: '#f59e0b', removed: '#ef4444', collab: BROWN }
              return (
                <div key={tour.id} style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: '#F7F1EA', flexShrink: 0 }}>
                      {tour.Tour_Images && <img src={tour.Tour_Images.split('|')[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, marginBottom: 3, fontSize: 15 }}>{tour.Tour_Title}</div>
                      <div style={{ fontSize: 13, color: '#6B6B6B' }}>{tour.Cities_Tags} · {tour.Duration_Hours} שעות</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>{tour.Lead_Count || 0}</div>
                      <div style={{ fontSize: 11, color: '#B0A89E' }}>פניות</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>₪{tour.Price_Per_Person}</div>
                      <div style={{ fontSize: 11, color: '#B0A89E' }}>חיוב חודשי</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ background: statusColor[tour.Tour_Status] + '18', color: statusColor[tour.Tour_Status], fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>
                        {statusLabel[tour.Tour_Status] || tour.Tour_Status}
                      </span>
                      <Link href={'/edit-tour/' + tour.id} style={{ fontSize: 11, color: '#6B6B6B', background: '#F7F1EA', padding: '4px 10px', borderRadius: 20, textDecoration: 'none', fontWeight: 700 }}>עריכה</Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
