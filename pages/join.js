import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Header from '../components/Header'

export default function Join() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    business_name: '',
    address: '',
    phone: '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    website: '',
    facebook: '',
    instagram: '',
    tiktok: '',
  })

  const handleChange = function(e) {
    setForm(Object.assign({}, form, { [e.target.name]: e.target.value }))
  }

  const handleSubmit = async function(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/register-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, form, { clerk_id: user.id }))
      })
      const data = await res.json()
      console.log('API response:', data)
      if (res.ok) {
        router.push('/dashboard')
      } else {
        console.error('Error:', data)
        setLoading(false)
      }
    } catch(err) {
      console.error('Fetch error:', err)
      setLoading(false)
    }
  }

  const input = function(name, label, type, required) {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
          {label} {required && <span style={{ color: '#C4922A' }}>*</span>}
        </label>
        <input
          type={type || 'text'}
          name={name}
          value={form[name]}
          onChange={handleChange}
          required={required}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }}
        />
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
        
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#C4922A', letterSpacing: '2px', marginBottom: 16 }}>למורי דרך</p>
          <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 24 }}>הפכו את הסיפורים שלכם לעסק</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { icon: '🎙', title: 'חשיפה דרך פודקאסט', text: 'הסיפור שלכם מגיע לאלפי מאזינים שכבר מתעניינים בהיסטוריה' },
              { icon: '📍', title: 'עמוד אישי מקצועי', text: 'עמוד ייחודי עם כל הסיורים שלכם, מחירים, ופרטי יצירת קשר' },
              { icon: '📊', title: 'מעקב לידים', text: 'ראו כמה אנשים לחצו לפנות אליכם דרך האתר' },
              { icon: '💰', title: 'תשלום לפי שימוש', text: 'משלמים רק על סיורים שפרסמתם. מינימום 55 ש"ח לסיור' },
            ].map(function(item) {
              return (
                <div key={item.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>{item.text}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: '#F9F9F9', borderRadius: 12, padding: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>פרטי ההצטרפות</h2>
          <p style={{ fontSize: 12, color: '#999', marginBottom: 24 }}>שדות המסומנים ב-* הם חובה</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
                  שם פרטי <span style={{ color: '#C4922A' }}>*</span>
                </label>
                <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }}>
                  שם משפחה <span style={{ color: '#C4922A' }}>*</span>
                </label>
                <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }} />
              </div>
            </div>
            {input('business_name', 'שם העסק (יופיע על החשבונית)', 'text', true)}
            {input('address', 'כתובת העסק', 'text', true)}
            {input('phone', 'טלפון', 'tel', true)}
            {input('email', 'מייל', 'email', true)}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>רשתות חברתיות (לא חובה)</p>
              {input('website', 'אתר אינטרנט', 'text', false)}
              {input('facebook', 'פייסבוק', 'text', false)}
              {input('instagram', 'אינסטגרם', 'text', false)}
              {input('tiktok', 'טיקטוק', 'text', false)}
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', background: '#0A0A0A', color: '#ffffff', padding: '14px', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'שולח...' : 'הצטרפו כמורה דרך'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
