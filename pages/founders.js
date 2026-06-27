import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'
const TIMELINE = '#C98A52'
const BRAND = '#B97A45'

function TimelineDot() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ width: 9, height: 9, borderRadius: '50%', background: TIMELINE }} />
      <div style={{ width: 2, height: 24, background: TIMELINE, opacity: 0.3 }} />
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: TIMELINE, opacity: 0.5 }} />
      <div style={{ width: 2, height: 24, background: TIMELINE, opacity: 0.3 }} />
      <div style={{ width: 9, height: 9, borderRadius: '50%', background: TIMELINE }} />
    </div>
  )
}

function StepBadge({ number }) {
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#8A5A32', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Heebo, Arial, sans-serif' }}>
      {number}
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={Object.assign({
      background: '#fff', borderRadius: 20, padding: '36px 32px',
      border: '1px solid #EDE7DF',
      boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
      animation: 'fadeUp 350ms ease forwards',
    }, style)}>
      {children}
    </div>
  )
}

function AITimelineAnim() {
  const [step, setStep] = useState(0)
  useState(function() {
    var interval = setInterval(function() { setStep(function(s) { return (s + 1) % 3 }) }, 500)
    return function() { clearInterval(interval) }
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {[0,1,2].map(function(i) {
        var active = i === step
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: active ? 12 : 8, height: active ? 12 : 8, borderRadius: '50%', background: active ? BROWN : TIMELINE, transition: 'all 0.3s', opacity: active ? 1 : 0.4 }} />
            {i < 2 && <div style={{ width: 2, height: 20, background: TIMELINE, opacity: 0.3 }} />}
          </div>
        )
      })}
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
  const [bioLink, setBioLink] = useState('')
  const [bioText, setBioText] = useState('')
  const [bioGenerated, setBioGenerated] = useState('')
  const [bioLoading, setBioLoading] = useState(false)
  const [bioCount, setBioCount] = useState(0)
  const [bioNotEnough, setBioNotEnough] = useState(false)

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

  const generateBio = async function() {
    if (!bioLink.trim()) return
    setBioLoading(true)
    setBioNotEnough(false)
    try {
      const res = await fetch('/api/generate-founder-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, publicInput: bioLink })
      })
      const data = await res.json()
      if (data.not_enough) {
        setBioNotEnough(true)
        setBioGenerated('')
        setBioText('')
      } else if (data.bio) {
        setBioGenerated(data.bio)
        setBioText(data.bio)
        setBioCount(data.bio.length)
      }
    } catch(err) {}
    setBioLoading(false)
  }

  return (
    <div dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <Head>
        <title>קהילת המייסדים | מאז ועד היום</title>
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700;900&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Head>

      <div style={{ maxWidth: 540, width: '100%' }}>
        <Link href="/" style={{ display: 'block', textAlign: 'center', marginBottom: 36 }}>
          <img src="/Logo-black.png" alt="מאז ועד היום" style={{ height: 60, width: 'auto' }} onError={e => e.target.style.display='none'} />
        </Link>

        {/* SCREEN 1 — WELCOME */}
        {screen === 'welcome' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <TimelineDot />
              <StepBadge number="1" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 16, lineHeight: 1.4 }}>
              אם קיבלתם את הלינק הזה, כנראה שמישהו חושב שאתם מסוג האנשים שיכולים לעזור לנו לבנות משהו חדש.
            </h1>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 14 }}>
              אנחנו מאמינים שאנשים לא יוצאים מהבית בשביל עובדות. הם יוצאים בשביל סיפורים.
            </p>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 28 }}>
              ואנחנו מחפשים אנשים שיודעים לקחת מקום ולהפוך אותו לסיפור.
            </p>
            <button onClick={function() { setScreen('register') }}
              style={{ width: '100%', background: '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
              כן, אני רוצה להצטרף לדור הראשון ←
            </button>
          </Card>
        )}

        {/* SCREEN 2 — REGISTER */}
        {screen === 'register' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <TimelineDot />
              <StepBadge number="2" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
              ברוכים הבאים לדור הראשון של <span style={{ color: BRAND, fontWeight: 700 }}>מאז ועד היום</span>.
            </h2>
            <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 20, lineHeight: 1.7 }}>
              אנחנו פותחים בימים אלו את קהילת המייסדים הראשונה של <span style={{ color: BRAND, fontWeight: 700 }}>מאז ועד היום</span>. לפני שנעלה לאוויר אנחנו מזמינים קבוצה קטנה של מורי דרך לעזור לנו לעצב את הדור הראשון של המוצר. זה מתחיל בשלושה פרטים פשוטים.
            </p>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 20, lineHeight: 1.6, padding: '10px 12px', background: '#FBF7F1', borderRadius: 8, border: '1px solid #EDE7DF' }}>
              בהמשך ההרשמה נבקש מכם פרטים בסיסיים כדי להקים פרופיל מדריך ולשלוח לכם עדכונים. תוכלו לבקש לעדכן או למחוק את הפרטים שלכם בכל שלב.
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
                style={{ width: '100%', background: loading ? '#888' : '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Heebo, Arial, sans-serif', marginTop: 4 }}>
                {loading ? 'שומר...' : 'המשיכו ←'}
              </button>
            </form>
          </Card>
        )}

        {/* SCREEN 3 — SUCCESS + BIO CHOICE */}
        {screen === 'success' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <TimelineDot />
              <StepBadge number="3" />
            </div>
            {founderNumber && (
              <p style={{ fontSize: 13, fontWeight: 700, color: BRAND, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>
                Founder #{founderNumber}
              </p>
            )}
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 10, lineHeight: 1.3 }}>
              כל מקום טוב מתחיל בסיפור טוב.
            </h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, marginBottom: 6 }}>
              זה הסיפור הראשון של <span style={{ color: BRAND, fontWeight: 700 }}>מאז ועד היום</span>.
            </p>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, marginBottom: 24 }}>
              תודה שאתם חלק ממנו.
            </p>
            <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.7, marginBottom: 24 }}>
              יום אחד יצטרפו לכאן עוד מאות מורי דרך. אבל כרגע אנחנו עדיין בונים את הפרק הראשון. בואו נתחיל מכם.
            </p>
            <div style={{ borderTop: '1px solid #EDE7DF', paddingTop: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#2a2a2a', marginBottom: 14 }}>איך תרצו להציג את עצמכם?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={function() { setScreen('bio-ai') }}
                  style={{ width: '100%', background: '#FBF7F1', color: BROWN, border: '1.5px solid #EDE7DF', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                  ✨ הציעו לי טיוטה לפרופיל
                </button>
                <button onClick={function() { setScreen('bio-manual') }}
                  style={{ width: '100%', background: '#fff', color: '#555', border: '1.5px solid #EDE7DF', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                  אכתוב בעצמי
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* SCREEN 4A — BIO AI */}
        {screen === 'bio-ai' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <TimelineDot />
              <StepBadge number="4" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>איך אנשים מחפשים אתכם היום?</h2>
            <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.7, marginBottom: 20 }}>
              אפשר להדביק אתר, פייסבוק, אינסטגרם, טיקטוק, לינקדאין, או פשוט שם מלא. נשתמש רק במידע ציבורי כדי להציע טיוטה ראשונית לפרופיל שלכם.
            </p>
            <input type="text" value={bioLink} onChange={function(e) { setBioLink(e.target.value) }}
              placeholder="https://... או שם מלא" style={Object.assign({}, inp, { marginBottom: 16 })} />

            {bioLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
                <AITimelineAnim />
                <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 12, fontFamily: 'Heebo, Arial, sans-serif' }}>יוצרים עבורכם טיוטה...</p>
              </div>
            )}

            {!bioLoading && bioNotEnough && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#888', background: '#FBF7F1', padding: '12px 14px', borderRadius: 8, border: '1px solid #EDE7DF', marginBottom: 12 }}>
                  לא מצאנו מספיק מידע ציבורי. תוכלו לנסות קישור אחר או לכתוב בעצמכם.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={generateBio}
                    style={{ flex: 1, background: '#FBF7F1', color: BROWN, border: '1.5px solid #EDE7DF', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                    נסו קישור אחר
                  </button>
                  <button onClick={function() { setScreen('bio-manual') }}
                    style={{ flex: 1, background: '#fff', color: '#555', border: '1.5px solid #EDE7DF', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                    אכתוב בעצמי
                  </button>
                </div>
              </div>
            )}

        {!bioLoading && !bioGenerated && !bioNotEnough && (
  <button onClick={generateBio} disabled={!bioLink.trim()}
    style={{ width: '100%', background: bioLink.trim() ? '#111' : '#ccc', color: '#fff', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', cursor: bioLink.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Heebo, Arial, sans-serif' }}>
    ✨ צרו לי טיוטה
  </button>
)}
                  <button onClick={generateBio}
                    style={{ flex: 1, background: '#FBF7F1', color: BROWN, border: '1.5px solid #EDE7DF', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                    נסו שוב
                  </button>
                </div>
              </div>
            )}

            {!bioLoading && !bioGenerated && !bioNotEnough && (
              <button onClick={generateBio} disabled={!bioLink.trim()}
                style={{ width: '100%', background: bioLink.trim() ? '#111' : '#ccc', color: '#fff', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', cursor: bioLink.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Heebo, Arial, sans-serif' }}>
                ✨ צרו לי טיוטה
              </button>
            )}
          </Card>
        )}

        {/* SCREEN 4B — BIO MANUAL */}
        {screen === 'bio-manual' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <TimelineDot />
              <StepBadge number="4" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>ספרו לנו בכמה מילים מי אתם.</h2>
            <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.7, marginBottom: 20 }}>
              לא קורות חיים. לא רשימת תפקידים. רק הסיפור שתרצו שאנשים יכירו דרכו אתכם.
            </p>
            <textarea value={bioText} onChange={function(e) { if (e.target.value.length <= 500) { setBioText(e.target.value); setBioCount(e.target.value.length) } }}
              rows={6} style={Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.8, marginBottom: 6 })} placeholder="הסיפור שלכם..." />
            <p style={{ fontSize: 11, color: bioCount > 450 ? '#e00' : '#B0A89E', textAlign: 'left', marginBottom: 16 }}>{bioCount}/500</p>
            <button onClick={function() { setScreen('benefit') }} disabled={!bioText.trim()}
              style={{ width: '100%', background: bioText.trim() ? '#111' : '#ccc', color: '#fff', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', cursor: bioText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Heebo, Arial, sans-serif' }}>
              המשיכו ←
            </button>
          </Card>
        )}

        {/* SCREEN 5 — BENEFIT */}
        {screen === 'benefit' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <TimelineDot />
              <StepBadge number="5" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 16, lineHeight: 1.4 }}>
              כל מקום טוב מתחיל בסיפור טוב.<br />הגיע הזמן לסיפור הראשון שלכם.
            </h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 12 }}>
              כחלק מתוכנית המייסדים של <span style={{ color: BRAND, fontWeight: 700 }}>מאז ועד היום</span>, תוכלו לפרסם את הסיור הראשון שלכם בפלטפורמה ללא עלות וללא הגבלת זמן.
            </p>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 12 }}>
              ההטבה נשמרת למייסדים שמעלים את הסיור לפני מועד ההשקה.
            </p>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 28 }}>
              הסיור הזה יהיה חלק מהדור הראשון של הסיפורים שירכיבו את הקהילה.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href={'/add-tour?founder=true&record_id=' + (recordId || '')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                הכניסו את הסיפור הראשון שלכם ←
              </a>
              <button onClick={function() { setScreen('later') }}
                style={{ width: '100%', background: CREAM, color: BROWN, padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, border: '1.5px solid #EDE7DF', cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                אשלים את זה בהמשך
              </button>
            </div>
          </Card>
        )}

        {/* SCREEN 6 — LATER */}
        {screen === 'later' && (
          <Card style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <TimelineDot />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>מעולה.</h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85 }}>
              שמרנו לכם את ההטבה. כשתהיו מוכנים, היא תחכה לכם כאן עד יום ההשקה.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
