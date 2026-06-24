import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useState, useRef } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Join() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingCert, setUploadingCert] = useState(false)
  const [certUrl, setCertUrl] = useState('')
  const [certName, setCertName] = useState('')
  const [certError, setCertError] = useState('')
  const fileRef = useRef(null)
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

  const handleCertUpload = async function(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/jpeg','image/png','image/webp','application/pdf']
    if (!allowed.includes(file.type)) { setCertError('יש להעלות JPG, PNG או PDF בלבד'); return }
    if (file.size > 10 * 1024 * 1024) { setCertError('הקובץ גדול מדי (מקסימום 10MB)'); return }
    setCertError('')
    setUploadingCert(true)
    setCertName(file.name)
    const reader = new FileReader()
    reader.onload = async function(ev) {
      try {
        const res = await fetch('/api/upload-certificate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: ev.target.result })
        })
        const data = await res.json()
        if (data.url) { setCertUrl(data.url) }
        else { setCertError('שגיאה בהעלאה, נסו שוב') }
      } catch(err) { setCertError('שגיאה בהעלאה, נסו שוב') }
      setUploadingCert(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async function(e) {
    e.preventDefault()
    if (!certUrl) { setCertError('יש להעלות תעודת מורה דרך בתוקף'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/register-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, form, {
          clerk_id: user.id,
          certificate_url: certUrl,
          guide_status: 'pending',
        }))
      })
      const data = await res.json()
      if (res.ok) { router.push('/dashboard') }
      else { console.error('Error:', data); setLoading(false) }
    } catch(err) { console.error('Fetch error:', err); setLoading(false) }
  }

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 1000, margin: '0 auto', padding: '56px 24px', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>

          {/* LEFT */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#7E4821', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>למורי דרך</p>
            <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 28, letterSpacing: '-0.5px' }}>
              הפכו את הסיפורים שלכם לעסק
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 36 }}>
              {[
                { icon: '🎙', title: 'חשיפה דרך פודקאסט', text: 'הסיפור שלכם מגיע לאלפי מאזינים שכבר מתעניינים בהיסטוריה' },
                { icon: '📍', title: 'עמוד אישי מקצועי', text: 'עמוד ייחודי עם כל הסיורים שלכם, מחירים, ופרטי יצירת קשר' },
                { icon: '📊', title: 'מעקב לידים', text: 'ראו כמה אנשים לחצו לפנות אליכם דרך האתר' },
                { icon: '💰', title: 'תשלום לפי שימוש', text: 'משלמים רק על סיורים שפרסמתם. מינימום 55 ש"ח לסיור' },
              ].map(function(item) {
                return (
                  <div key={item.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.6 }}>{item.text}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* process steps */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #EDE7DF' }}>
              <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 16, color: '#111' }}>איך זה עובד?</p>
              {[
                { n: '1', t: 'מלאו את הטופס והעלו תעודת מורה דרך' },
                { n: '2', t: 'הצוות שלנו יאשר את הפרופיל תוך 48 שעות' },
                { n: '3', t: 'העלו סיורים ותתחילו לקבל לקוחות' },
              ].map(function(s) {
                return (
                  <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#7E4821', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{s.n}</span>
                    <span style={{ fontSize: 14, color: '#444', lineHeight: 1.5, paddingTop: 4 }}>{s.t}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT — form */}
          <div style={{ background: '#fff', borderRadius: 18, padding: 36, border: '1px solid #EDE7DF', boxShadow: '0 8px 28px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>פרטי ההצטרפות</h2>
            <p style={{ fontSize: 12, color: '#B0A89E', marginBottom: 28 }}>שדות המסומנים ב-* הם חובה</p>

            <form onSubmit={handleSubmit}>
              {/* name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                {[['first_name','שם פרטי'],['last_name','שם משפחה']].map(function(f) {
                  return (
                    <div key={f[0]}>
                      <label style={lbl}>{f[1]} <span style={{ color: '#7E4821' }}>*</span></label>
                      <input type="text" name={f[0]} value={form[f[0]]} onChange={handleChange} required style={inp} />
                    </div>
                  )
                })}
              </div>

              {[
                ['business_name','שם העסק (יופיע על החשבונית)','text',true],
                ['address','כתובת העסק','text',true],
                ['phone','טלפון','tel',true],
                ['email','מייל','email',true],
              ].map(function(f) {
                return (
                  <div key={f[0]} style={{ marginBottom: 14 }}>
                    <label style={lbl}>{f[1]} {f[3] && <span style={{ color: '#7E4821' }}>*</span>}</label>
                    <input type={f[2]} name={f[0]} value={form[f[0]]} onChange={handleChange} required={f[3]} style={inp} />
                  </div>
                )
              })}

              {/* certificate upload */}
              <div style={{ marginBottom: 20, padding: 20, background: '#F7F1EA', borderRadius: 12, border: '1.5px dashed #D5CAC0' }}>
                <label style={{ ...lbl, marginBottom: 8 }}>תעודת מורה דרך בתוקף <span style={{ color: '#7E4821' }}>*</span></label>
                <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 12 }}>JPG, PNG או PDF — עד 10MB. הפרופיל יאושר לאחר בדיקת התעודה.</p>
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf,.webp" onChange={handleCertUpload} style={{ display: 'none' }} />
                <button type="button" onClick={function() { fileRef.current?.click() }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #EDE7DF', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif', color: '#111' }}>
                  {uploadingCert ? '⏳ מעלה...' : certUrl ? '✅ ' + certName : '📎 העלו תעודה'}
                </button>
                {certError && <p style={{ fontSize: 12, color: '#e00', marginTop: 8 }}>{certError}</p>}
                {certUrl && !uploadingCert && (
                  <p style={{ fontSize: 12, color: '#22c55e', marginTop: 8 }}>✓ התעודה הועלתה בהצלחה</p>
                )}
              </div>

              {/* social */}
              <div style={{ borderTop: '1px solid #EDE7DF', paddingTop: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: '#B0A89E', marginBottom: 14 }}>רשתות חברתיות (לא חובה)</p>
                {[['website','אתר אינטרנט'],['facebook','פייסבוק'],['instagram','אינסטגרם'],['tiktok','טיקטוק']].map(function(f) {
                  return (
                    <div key={f[0]} style={{ marginBottom: 12 }}>
                      <label style={lbl}>{f[1]}</label>
                      <input type="text" name={f[0]} value={form[f[0]]} onChange={handleChange} style={inp} />
                    </div>
                  )
                })}
              </div>

              <button type="submit" disabled={loading || uploadingCert}
                style={{ width: '100%', background: '#111', color: '#fff', padding: '14px', borderRadius: 8, fontSize: 16, fontWeight: 800, cursor: (loading || uploadingCert) ? 'not-allowed' : 'pointer', border: 'none', opacity: (loading || uploadingCert) ? 0.7 : 1, fontFamily: 'Heebo, Arial, sans-serif' }}>
                {loading ? 'שולח...' : 'הצטרפו כמורה דרך ←'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#111', fontFamily: 'Heebo, Arial, sans-serif' }
const inp = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #EDE7DF', fontSize: 14, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box' }
