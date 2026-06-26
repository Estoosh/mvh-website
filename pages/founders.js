import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'

function TimelineDot() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0, paddingTop: 4 }}>
      <div style={{ width: 9, height: 9, borderRadius: '50%', background: BROWN }} />
      <div style={{ width: 2, height: 20, background: BROWN, opacity: 0.3 }} />
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: BROWN, opacity: 0.5 }} />
      <div style={{ width: 2, height: 20, background: BROWN, opacity: 0.3 }} />
      <div style={{ width: 9, height: 9, borderRadius: '50%', background: BROWN }} />
    </div>
  )
}

const inp = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #EDE7DF', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none', background: '#fff', boxSizing: 'border-box', color: '#1a1a1a' }

export default function Founders() {
  const [screen, setScreen] = useState('welcome')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [founderNumber, setFounderNumber] = useState(null)
  const [recordId, setRecordId] = useState(null)

  const handleChange = function(e) {
    setForm(Object.assign({}, form, { [e.target.name]: e.target.value }))
  }

  const handleRegister = async function(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('יש למלא את כל השדות')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/register-founder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, invite_source: 'unknown' })
      })
      const data = await res.json()
      if (!data.success) { setError('משהו השתבש. אפשר לנסות שוב.'); setLoading(false); return }
      setFounderNumber(data.founder_number)
      setRecordId(data.record_id)
      setScreen('success')
    } catch(err) {
      setError('משהו השתבש. אפשר לנסות שוב.')
    }
    setLoading(false)
  }

  return (
    <div dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <Head>
        <title>קהילת המייסדים | מאז ועד היום</title>
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ maxWidth: 520, width: '100%' }}>
        <Link href="/" style={{ display: 'block', textAlign: 'center', marginBottom: 40 }}>
          <img src="/Logo-black.png" alt="מאז ועד היום" style={{ height: 64, width: 'auto' }} onError={e => e.target.style.display='none'} />
        </Link>

        {/* SCREEN 1 — WELCOME */}
        {screen === 'welcome' && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', border: '1px solid #EDE7DF', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 32 }}>
              <TimelineDot />
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 20, lineHeight: 1.35 }}>
                  אם קיבלתם את הלינק הזה, כנראה שמישהו חושב שאתם מסוג האנשים שיכולים לעזור לנו לבנות משהו חדש.
                </h1>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 16 }}>
                  אנחנו מאמינים שאנשים לא יוצאים מהבית בשביל עובדות. הם יוצאים בשביל סיפורים.
                </p>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85 }}>
                  ואנחנו מחפשים אנשים שיודעים לקחת מקום ולהפוך אותו לסיפור.
                </p>
              </div>
            </div>
            <button onClick={function() { setScreen('register') }}
              style={{ width: '100%', background: '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
              כן, אני רוצה להצטרף לדור הראשון ←
            </button>
          </div>
        )}

        {/* SCREEN 2 — REGISTER */}
        {screen === 'register' && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', border: '1px solid #EDE7DF', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>כמה פרטים בסיסיים</h2>
            <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 28, lineHeight: 1.65 }}>
              בהמשך ההרשמה נבקש מכם פרטים בסיסיים כדי להקים פרופיל מדריך ולשלוח לכם עדכונים על תוכנית המייסדים. תוכלו לבקש לעדכן או למחוק את הפרטים שלכם בכל שלב.
            </p>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2a2a2a', marginBottom: 6 }}>שם מלא <span style={{ color: BROWN }}>*</span></label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required style={inp} placeholder="השם שיופיע בפרופיל שלכם" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2a2a2a', marginBottom: 6 }}>אימייל <span style={{ color: BROWN }}>*</span></label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required style={inp} placeholder="your@email.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2a2a2a', marginBottom: 6 }}>טלפון <span style={{ color: BROWN }}>*</span></label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required style={inp} placeholder="050-0000000" />
              </div>
              {error && <p style={{ fontSize: 13, color: '#e00', background: '#fff5f5', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca' }}>{error}</p>}
              <button type="submit" disabled={loading}
                style={{ width: '100%', background: loading ? '#888' : '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Heebo, Arial, sans-serif', marginTop: 8 }}>
                {loading ? 'שומר...' : 'המשך ←'}
              </button>
            </form>
          </div>
        )}

        {/* SCREEN 3 — SUCCESS */}
        {screen === 'success' && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', border: '1px solid #EDE7DF', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <TimelineDot />
            </div>
            {founderNumber && (
              <p style={{ fontSize: 13, fontWeight: 700, color: BROWN, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
                Founder #{founderNumber}
              </p>
            )}
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 12, lineHeight: 1.3 }}>
              כל מקום טוב מתחיל בסיפור טוב.
            </h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 8 }}>
              זה הסיפור הראשון של מאז ועד היום.
            </p>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 36 }}>
              תודה שאתם חלק ממנו.
            </p>
            <button onClick={function() { setScreen('benefit') }}
              style={{ width: '100%', background: '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
              המשך ←
            </button>
          </div>
        )}

        {/* SCREEN 4 — BENEFIT */}
        {screen === 'benefit' && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', border: '1px solid #EDE7DF', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 32 }}>
              <TimelineDot />
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 20, lineHeight: 1.4 }}>
                  כחלק מתוכנית המייסדים של מאז ועד היום, אנחנו נפרסם בפלטפורמה סיור אחד שלכם, ללא עלות וללא הגבלת זמן.
                </h2>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 12 }}>
                  ההטבה מותנית בהעלאת הסיור לפני מועד ההשקה, שמתוכנן לשבועות הקרובים.
                </p>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85 }}>
                  זו הזדמנות שלכם להוביל את הקהילה ולעזור לנו לחבר אליכם יותר מטיילים שמחפשים חוויה, סיור או סיפור טוב.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href={'/add-tour?founder=true&record_id=' + (recordId || '')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                הוסיפו את הסיור הראשון שלכם ←
              </a>
              <button onClick={function() { setScreen('later') }}
                style={{ width: '100%', background: CREAM, color: BROWN, padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, border: '1.5px solid #EDE7DF', cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                אשלים את זה בהמשך
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 5 — LATER */}
        {screen === 'later' && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', border: '1px solid #EDE7DF', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 16, lineHeight: 1.35 }}>מעולה.</h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85 }}>
              שמרנו לכם את ההטבה. כשתהיו מוכנים, היא תחכה לכם כאן עד יום ההשקה.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
