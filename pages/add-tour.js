import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Header from '../components/Header'

const CITIES = ["אילת","אשדוד","אשקלון","באר שבע","באר יעקב","בית שאן","בית שמש","בני ברק","גבעתיים","דימונה","הוד השרון","הרצליה","חדרה","חולון","חיפה","טבריה","טירת כרמל","יבנה","יהוד","ירושלים","כפר סבא","כרמיאל","לוד","מודיעין","נהריה","נס ציונה","נצרת","נתיבות","נתניה","עכו","עפולה","פתח תקווה","צפת","קריית אתא","קריית גת","קריית מוצקין","קריית שמונה","ראש העין","ראשון לציון","רהט","רחובות","רמלה","רמת גן","רמת השרון","רעננה","שדרות","תל אביב","עין גדי","מצדה","קומראן","ים המלח","הרצליה","השרון","גליל עליון","גליל מערבי","גולן","נגב","ערבה","שפלה","שרון"]

export default function AddTour() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [guideId, setGuideId] = useState(null)
  const [guide, setGuide] = useState(null)
  const [teaser_count, setTeaserCount] = useState(0)
  const [form, setForm] = useState({
    title: '',
    teaser: '',
    story: '',
    price: '',
    duration: '',
    cities: '',
    min_age: '1',
    max_age: '99',
    meeting_point: '',
    collab_code: '',
  })

  useEffect(function() {
    if (!isLoaded || !user) return
    fetch('/api/get-guide?clerk_id=' + user.id)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (!data.found) { router.push('/join'); return }
        setGuideId(data.airtable_id)
        setGuide(data.guide)
      })
  }, [isLoaded, user])

  const handleChange = function(e) {
    var val = e.target.value
    if (e.target.name === 'teaser') {
      if (val.length > 120) return
      setTeaserCount(val.length)
    }
    setForm(Object.assign({}, form, { [e.target.name]: val }))
  }

  const handleSubmit = async function(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/add-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, form, {
          guide_id: guideId,
          guide_name: guide ? guide.Guide_Name : ''
        }))
      })
      const data = await res.json()
      if (data.id) {
        router.push('/dashboard')
      } else {
        console.error(data)
        setLoading(false)
      }
    } catch(err) {
      console.error(err)
      setLoading(false)
    }
  }

  const input = function(name, label, type, required) {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
          {label} {required && <span style={{ color: '#C4922A' }}>*</span>}
        </label>
        <input type={type || 'text'} name={name} value={form[name]} onChange={handleChange} required={required}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }} />
      </div>
    )
  }

  const textarea = function(name, label, required) {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
          {label} {required && <span style={{ color: '#C4922A' }}>*</span>}
        </label>
        <textarea name={name} value={form[name]} onChange={handleChange} required={required} rows={4}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', resize: 'vertical' }} />
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>הוסף סיור חדש</h1>
        <p style={{ color: '#666', marginBottom: 40 }}>פרטי הסיור יופיעו בעמוד שלך באתר</p>
        <form onSubmit={handleSubmit}>

          {input('title', 'שם הסיור', 'text', true)}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
              תיאור קצר <span style={{ color: '#C4922A' }}>*</span>
              <span style={{ fontWeight: 400, color: teaser_count > 100 ? '#e00' : '#999', marginRight: 8 }}>
                {teaser_count}/120
              </span>
            </label>
            <input type="text" name="teaser" value={form.teaser} onChange={handleChange} required maxLength={120}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }} />
          </div>

          {textarea('story', 'סיפור הסיור', true)}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
                מחיר למשתתף (מינימום 55) <span style={{ color: '#C4922A' }}>*</span>
              </label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required min="55"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
                משך הסיור (שעות) <span style={{ color: '#C4922A' }}>*</span>
              </label>
              <input type="number" name="duration" value={form.duration} onChange={handleChange} required min="0.5" step="0.5"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
              יישוב/אזור <span style={{ color: '#C4922A' }}>*</span>
            </label>
            <select name="cities" value={form.cities} onChange={handleChange} required
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', background: '#fff' }}>
              <option value="">בחרו יישוב</option>
              {CITIES.sort().map(function(c) { return <option key={c} value={c}>{c}</option> })}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>גיל מינימום</label>
              <select name="min_age" value={form.min_age} onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', background: '#fff' }}>
                {Array.from({length: 18}, function(_, i) { return i + 1 }).map(function(n) {
                  return <option key={n} value={n}>{n}</option>
                })}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>גיל מקסימום</label>
              <select name="max_age" value={form.max_age} onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', background: '#fff' }}>
                {Array.from({length: 81}, function(_, i) { return i + 19 }).map(function(n) {
                  return <option key={n} value={n}>{n}</option>
                })}
              </select>
            </div>
          </div>

          {input('meeting_point', 'לינק לנקודת מפגש', 'text', false)}

          <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 8, marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>יש לך קוד שת"פ MvH?</p>
            {input('collab_code', 'קוד שת"פ', 'text', false)}
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: '#0A0A0A', color: '#ffffff', padding: '14px', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'שומר...' : 'פרסם סיור'}
          </button>
        </form>
      </div>
    </div>
  )
}
