import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import RecommendedToursForMember from '../components/RecommendedToursForMember'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'

const REGIONS = ["צפון", "שפלה", "מרכז", 'יו"ש', "צפון הנגב", "דרום"]
const TOUR_TYPES = ["סיורים עירוניים", "סיורי שווקים"]
const TRAVEL_WITH = ["משפחה", "חברים לעבודה", "בן/בת זוג", "מצטרף כיחיד", "לא משנה לי, העיקר לטייל"]

function Chip({ value, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ padding: '7px 16px', borderRadius: 20, border: '1.5px solid', fontSize: 13, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif', fontWeight: 700, background: selected ? '#111' : '#fff', color: selected ? '#fff' : '#444', borderColor: selected ? '#111' : '#EDE7DF' }}>
      {value}
    </button>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
  } catch (e) { return '' }
}

export default function Member() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const isWelcome = router.query.welcome === '1'

  const [checkingSignup, setCheckingSignup] = useState(true)
  const [signup, setSignup] = useState(null)
  const [savedTours, setSavedTours] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  const [editingPrefs, setEditingPrefs] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [regions, setRegions] = useState([])
  const [tourTypes, setTourTypes] = useState([])
  const [travelWith, setTravelWith] = useState([])

  useEffect(function() {
    if (!isLoaded) return
    if (!user) { setCheckingSignup(false); return }

    fetch('/api/get-signup?clerk_id=' + user.id)
      .then((r) => r.json())
      .then(function(data) {
        if (data.found) {
          setSignup(data.signup)
          setRegions((data.signup.Regions_Interest || '').split(', ').filter(Boolean))
          setTourTypes((data.signup.Tour_Types_Interest || '').split(', ').filter(Boolean))
          setTravelWith((data.signup.Travel_With || '').split(', ').filter(Boolean))
        } else {
          // Not a community member yet — send them to sign up first.
          router.replace('/discount')
        }
        setCheckingSignup(false)
      })
      .catch(function() { setCheckingSignup(false) })
  }, [isLoaded, user])

  useEffect(function() {
    if (!isLoaded || !user || !signup) return
    fetch('/api/get-saved-tours?clerk_id=' + user.id)
      .then((r) => r.json())
      .then((data) => setSavedTours(data.tours || []))
      .catch(() => setSavedTours([]))
  }, [isLoaded, user, signup])

  const toggle = function(list, setList, value) {
    setList((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : prev.concat(value)))
  }

  const savePreferences = async function() {
    setSavingPrefs(true)
    try {
      const res = await fetch('/api/update-signup-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerk_id: user.id, regions, tour_types: tourTypes, travel_with: travelWith })
      })
      const data = await res.json()
      if (data.ok) {
        setSignup((prev) => Object.assign({}, prev, {
          Regions_Interest: regions.join(', '),
          Tour_Types_Interest: tourTypes.join(', '),
          Travel_With: travelWith.join(', ')
        }))
        setEditingPrefs(false)
      }
    } catch (e) {
      // non-fatal, form stays open for retry
    }
    setSavingPrefs(false)
  }

  const removeSavedTour = async function(savedEntryId) {
    setRemovingId(savedEntryId)
    try {
      const res = await fetch('/api/remove-saved-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerk_id: user.id, saved_entry_id: savedEntryId })
      })
      const data = await res.json()
      if (data.ok) {
        setSavedTours((prev) => prev.filter((t) => t.saved_entry_id !== savedEntryId))
      }
    } catch (e) {}
    setRemovingId(null)
  }

  const lbl = { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#111' }
  const card = { background: '#fff', borderRadius: 18, border: '1px solid #EDE7DF', padding: 28, marginBottom: 24 }

  if (!isLoaded || checkingSignup) {
    return (
      <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 0', color: '#B0A89E' }}>טוען...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24 }}>
          <p style={{ fontSize: 18, fontWeight: 700 }}>האזור הזה מיועד לחברי קהילה מחוברים</p>
          <a href="/sign-up" style={{ background: '#111', color: '#fff', padding: '13px 32px', borderRadius: 8, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>הרשמה חינמית ←</a>
        </main>
        <Footer />
      </div>
    )
  }

  const excludeIds = (savedTours || []).map((t) => t.id)

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>האזור שלי | מאז ועד היום</title>
      </Head>
      <Header />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', padding: '48px 24px 64px', width: '100%' }}>

        {isWelcome && (
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EDE7DF', padding: 32, marginBottom: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 10 }}>🎉</p>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>ברוכים הבאים לקהילה!</h1>
            <p style={{ color: '#6B6B6B', marginBottom: 22, lineHeight: 1.7 }}>מעכשיו יש לכם הנחת חברי קהילה בכל סיור, ומקום לחזור אליו כשמשהו תופס לכם את העין.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/#tours" style={{ background: BROWN, color: '#fff', padding: '10px 20px', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>גלו סיורים ←</Link>
              <button onClick={() => setEditingPrefs(true)} style={{ background: '#fff', color: BROWN, border: '1.5px solid #EDE7DF', padding: '10px 20px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>עדכנו העדפות</button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: BROWN, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>האזור שלי</p>
          <h1 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#1a1a1a' }}>שלום {user.firstName || ''}</h1>
        </div>

        {/* Preferences summary / editor */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: editingPrefs ? 20 : 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>ההעדפות שלי</h2>
            {!editingPrefs && (
              <button onClick={() => setEditingPrefs(true)} style={{ background: 'transparent', color: BROWN, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                עריכה
              </button>
            )}
          </div>

          {!editingPrefs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <p style={{ fontSize: 14, color: '#6B6B6B' }}>אזורים: {regions.length > 0 ? regions.join(', ') : 'לא נבחרו עדיין'}</p>
              <p style={{ fontSize: 14, color: '#6B6B6B' }}>סוגי סיורים: {tourTypes.length > 0 ? tourTypes.join(', ') : 'לא נבחרו עדיין'}</p>
              <p style={{ fontSize: 14, color: '#6B6B6B' }}>מטיילים עם: {travelWith.length > 0 ? travelWith.join(', ') : 'לא נבחר עדיין'}</p>
            </div>
          )}

          {editingPrefs && (
            <div>
              {[
                { label: 'אזורים שמעניינים אתכם', list: regions, setList: setRegions, items: REGIONS },
                { label: 'סוגי סיורים שמעניינים אתכם', list: tourTypes, setList: setTourTypes, items: TOUR_TYPES },
                { label: 'בעיקר מטיילים עם', list: travelWith, setList: setTravelWith, items: TRAVEL_WITH },
              ].map(function(section) {
                return (
                  <div key={section.label} style={{ marginBottom: 20 }}>
                    <label style={lbl}>{section.label}</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {section.items.map((item) => (
                        <Chip key={item} value={item} selected={section.list.includes(item)} onClick={() => toggle(section.list, section.setList, item)} />
                      ))}
                    </div>
                  </div>
                )
              })}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={savePreferences} disabled={savingPrefs} style={{ background: '#111', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: savingPrefs ? 'not-allowed' : 'pointer', border: 'none', opacity: savingPrefs ? 0.7 : 1, fontFamily: 'Heebo, Arial, sans-serif' }}>
                  {savingPrefs ? 'שומר...' : 'שמירה'}
                </button>
                <button onClick={() => setEditingPrefs(false)} style={{ background: '#fff', color: '#666', border: '1px solid #EDE7DF', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Saved tours */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>הסיורים שסימנתי</h2>

          {savedTours === null && <p style={{ color: '#B0A89E' }}>טוען...</p>}

          {savedTours !== null && savedTours.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #EDE7DF', padding: 32, marginBottom: 24 }}>
              <p style={{ fontSize: 15, color: '#6B6B6B', marginBottom: 20 }}>
                עוד לא סימנתם סיורים. הנה כמה שאולי יתאימו לכם, לפי מה שסיפרתם לנו:
              </p>
              <RecommendedToursForMember regions={regions} excludeTourIds={[]} limit={4} />
            </div>
          )}

          {savedTours !== null && savedTours.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
              {savedTours.map(function(tour) {
                const images = tour.Tour_Images ? tour.Tour_Images.split('|').filter(Boolean) : []
                const thumb = images[0] || null
                return (
                  <div key={tour.saved_entry_id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #EDE7DF', overflow: 'hidden', display: 'grid', gridTemplateColumns: '140px 1fr' }}>
                    <div style={{ height: 120, background: '#e8e0d8' }}>
                      {thumb
                        ? <img src={thumb} alt={tour.Tour_Title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none' }} />
                        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#d4c5b0,#c2b09a)' }} />
                      }
                    </div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 12, color: '#B0A89E', marginBottom: 4 }}>{tour.Cities_Tags} · {tour.Guide_Name} · סומן ב-{formatDate(tour.saved_at)}</p>
                        <p style={{ fontSize: 16, fontWeight: 700 }}>{tour.Tour_Title}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                        <Link href={'/tours/' + tour.id} style={{ background: BROWN, color: '#fff', padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                          פתחו את הסיור ←
                        </Link>
                        <button onClick={() => removeSavedTour(tour.saved_entry_id)} disabled={removingId === tour.saved_entry_id}
                          style={{ background: 'transparent', color: '#B0A89E', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                          הסירו
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recommendations, when there are already saved tours */}
        {savedTours !== null && savedTours.length > 0 && (
          <div style={card}>
            <RecommendedToursForMember regions={regions} excludeTourIds={excludeIds} limit={4} title="עוד סיורים שאולי יתאימו לכם" />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
