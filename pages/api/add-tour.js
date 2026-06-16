import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Header from '../components/Header'

export default function AddTour() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [guideId, setGuideId] = useState(null)
  const [guide, setGuide] = useState(null)
  const [form, setForm] = useState({
    title: '',
    teaser: '',
    story: '',
    price: '',
    duration: '',
    cities: '',
    min_age: '',
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
    setForm(Object.assign({}, form, { [e.target.name]: e.target.value }))
  }

  const handleSubmit = async function(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/add-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, form, { guide_id: guideId, guide_name: guide ? guide.Guide_Name : '' }))
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
          {input('teaser', 'תיאור קצר (משפט אחד)', 'text', true)}
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
          {input('cities', 'יישוב/אזור', 'text', true)}
          {input('min_age', 'גיל מינימום', 'number', false)}
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
