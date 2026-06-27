import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'
const TIMELINE = '#C98A52'
const BRAND = '#B97A45'
const DRAFT_KEY = 'mvh_founder_onboarding_draft'

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
      background: '#fff',
      borderRadius: 20,
      padding: '36px 32px',
      border: '1px solid #EDE7DF',
      boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
      animation: 'fadeUp 350ms ease forwards'
    }, style)}>
      {children}
    </div>
  )
}

const inp = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1.5px solid #EDE7DF',
  fontSize: 15,
  fontFamily: 'Heebo, Arial, sans-serif',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
  color: '#1a1a1a'
}

const emptyDraft = {
  screen: 'welcome',
  form: { name: '', email: '', phone: '' },
  founderNumber: null,
  recordId: null,
  profileInput: '',
  bioText: '',
  bioGenerated: false
}

export default function Founders() {
  const [screen, setScreen] = useState('welcome')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [founderNumber, setFounderNumber] = useState(null)
  const [recordId, setRecordId] = useState(null)
  const [profileInput, setProfileInput] = useState('')
  const [bioText, setBioText] = useState('')
  const [bioGenerated, setBioGenerated] = useState(false)
  const [bioLoading, setBioLoading] = useState(false)
  const [bioCount, setBioCount] = useState(0)
  const [bioError, setBioError] = useState('')
  const [bioSaveStatus, setBioSaveStatus] = useState('')
  const restoredRef = useRef(false)
  const saveTimerRef = useRef(null)

  function resetFlow() {
    localStorage.removeItem(DRAFT_KEY)
    setScreen(emptyDraft.screen)
    setForm(emptyDraft.form)
    setFounderNumber(null)
    setRecordId(null)
    setProfileInput('')
    setBioText('')
    setBioGenerated(false)
    setBioCount(0)
    setBioError('')
    setBioSaveStatus('')
  }

  useEffect(function() {
    try {
      const shouldReset =
        typeof window !== 'undefined' &&
        window.location.search.includes('reset=true')

      if (shouldReset) {
        resetFlow()
        restoredRef.current = true
        return
      }

      const saved = localStorage.getItem(DRAFT_KEY)
      if (!saved) {
        restoredRef.current = true
        return
      }

      const draft = JSON.parse(saved)

      if (draft.screen) setScreen(draft.screen)
      if (draft.form) setForm(draft.form)
      if (draft.founderNumber) setFounderNumber(draft.founderNumber)
      if (draft.recordId) setRecordId(draft.recordId)
      if (draft.profileInput) setProfileInput(draft.profileInput)
      if (draft.bioText) {
        setBioText(draft.bioText)
        setBioCount(draft.bioText.length)
      }
      if (draft.bioGenerated) setBioGenerated(draft.bioGenerated)

      restoredRef.current = true
    } catch (err) {
      console.error('[founders] restore failed:', err)
      restoredRef.current = true
    }
  }, [])

  useEffect(function() {
    if (!restoredRef.current) return

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        screen,
        form,
        founderNumber,
        recordId,
        profileInput,
        bioText,
        bioGenerated
      }))
    } catch (err) {
      console.error('[founders] save draft failed:', err)
    }
  }, [screen, form, founderNumber, recordId, profileInput, bioText, bioGenerated])

  async function saveBioToAirtable(nextBio) {
    const cleanBio = typeof nextBio === 'string' ? nextBio.trim() : ''

    if (!recordId || !cleanBio) return { success: false, skipped: true }

    setBioSaveStatus('שומר...')
    setBioError('')

    try {
      const res = await fetch('/api/update-guide-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record_id: recordId, bio: cleanBio })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        console.error('[founders] bio save failed:', data)

        const err = data?.airtable?.error?.type || data?.airtable?.error || data?.error

        if (String(err || '').includes('NOT_FOUND') || String(err || '').includes('INVALID_RECORD')) {
          resetFlow()
          window.location.href = '/founders?reset=true'
          return { success: false, reset: true }
        }

        setBioSaveStatus('')
        setBioError('לא הצלחנו לשמור את הפרופיל. נסו שוב.')
        return { success: false, data }
      }

      setBioSaveStatus('נשמר')
      return { success: true, data }
    } catch (err) {
      console.error('[founders] bio save error:', err)
      setBioSaveStatus('')
      setBioError('לא הצלחנו לשמור את הפרופיל. נסו שוב.')
      return { success: false, error: err }
    }
  }

  useEffect(function() {
    if (!recordId || !bioText.trim()) return
    if (screen !== 'bio-ai' && screen !== 'bio-manual') return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    saveTimerRef.current = setTimeout(function() {
      saveBioToAirtable(bioText)
    }, 900)

    return function() {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [bioText, recordId, screen])

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
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        invite_source: 'unknown'
      })
    })

    const data = await res.json()

    if (data.error === 'founder_exists' && data.record_id) {
      const guide = data.guide || {}

      setFounderNumber(data.founder_number || guide.Founder_Number || null)
      setRecordId(data.record_id)

      setForm({
        name: guide.Guide_Name || form.name,
        email: guide.Email || form.email,
        phone: guide.WhatsApp_Number || form.phone
      })

      setBioText(guide.Guide_bio || '')
      setBioCount((guide.Guide_bio || '').length)
      setBioGenerated(Boolean(guide.Guide_bio))

      setScreen('benefit')
      setLoading(false)
      return
    }

    if (!data.success || !data.record_id) {
      console.error('[founders] register failed:', data)
      setError('משהו השתבש. אפשר לנסות שוב.')
      setLoading(false)
      return
    }

    setFounderNumber(data.founder_number || null)
    setRecordId(data.record_id)
    setScreen('success')
  } catch(err) {
    console.error('[founders] register error:', err)
    setError('משהו השתבש. אפשר לנסות שוב.')
  }

  setLoading(false)
}

  const generateBio = async function() {
    const input = profileInput.trim()

    if (!input) {
      setBioError('יש להזין טקסט לפני יצירת הטיוטה')
      return
    }

    setBioError('')
    setBioLoading(true)

    try {
      const res = await fetch('/api/generate-founder-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileInput: input })
      })

      const data = await res.json()

      if (data.bio) {
        const nextBio = String(data.bio).slice(0, 800)
        setBioText(nextBio)
        setBioCount(nextBio.length)
        setBioGenerated(true)
        await saveBioToAirtable(nextBio)
      } else {
        setBioError('לא הצלחנו ליצור טיוטה. אפשר לנסות שוב או לכתוב בעצמכם.')
      }
    } catch(err) {
      console.error('[generateBio] error:', err)
      setBioError('משהו השתבש. אפשר לנסות שוב.')
    }

    setBioLoading(false)
  }

  const saveBioAndContinue = async function() {
    const cleanBio = bioText.trim()

    if (!cleanBio) {
      setBioError('יש לכתוב או לאשר טיוטת פרופיל לפני שממשיכים')
      return
    }

    if (!recordId) {
      resetFlow()
      window.location.href = '/founders?reset=true'
      return
    }

    const result = await saveBioToAirtable(cleanBio)

    if (!result.success) return

    setScreen('benefit')
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
        <div style={{ display: 'block', textAlign: 'center', marginBottom: 36 }}>
          <img src="/Logo-black.png" alt="מאז ועד היום" style={{ height: 60, width: 'auto' }} onError={e => e.target.style.display='none'} />
        </div>

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
            <button onClick={function() { setScreen('register') }} style={{ width: '100%', background: '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
              כן, אני רוצה להצטרף לדור הראשון ←
            </button>
          </Card>
        )}

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
               <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 8 }}>
  <input
    type="tel"
    inputMode="numeric"
    value={phonePrefix}
    onChange={function(e) { setPhonePrefix(onlyDigits(e.target.value, 3)) }}
    required
    style={inp}
    placeholder="050"
    maxLength={3}
  />
  <input
    type="tel"
    inputMode="numeric"
    value={phoneRest}
    onChange={function(e) { setPhoneRest(onlyDigits(e.target.value, 7)) }}
    required
    style={inp}
    placeholder="1234567"
    maxLength={7}
  />
</div>
              </div>
              {error && <p style={{ fontSize: 13, color: '#e00', background: '#fff5f5', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca' }}>{error}</p>}
              <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#888' : '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Heebo, Arial, sans-serif', marginTop: 4 }}>
                {loading ? 'שומר...' : 'המשיכו ←'}
              </button>
            </form>
          </Card>
        )}

        {screen === 'success' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <TimelineDot />
              <StepBadge number="3" />
            </div>
            {founderNumber && <p style={{ fontSize: 13, fontWeight: 700, color: BRAND, marginBottom: 10 }}>Founder #{founderNumber}</p>}
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
                <button onClick={function() { setScreen('bio-ai') }} style={{ width: '100%', background: '#FBF7F1', color: BROWN, border: '1.5px solid #EDE7DF', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                  ✨ הציעו לי טיוטה לפרופיל
                </button>
                <button onClick={function() { setScreen('bio-manual') }} style={{ width: '100%', background: '#fff', color: '#555', border: '1.5px solid #EDE7DF', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                  אכתוב בעצמי
                </button>
              </div>
            </div>
          </Card>
        )}

        {screen === 'bio-ai' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <TimelineDot />
              <StepBadge number="4" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>ספרו לנו קצת על עצמכם</h2>
            <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.7, marginBottom: 20 }}>
              אפשר לכתוב שם מלא, להדביק טקסט קיים שכתבתם על עצמכם, קטע מאתר, פוסט, פרופיל מקצועי או כמה משפטים חופשיים.
            </p>
            <textarea value={profileInput} onChange={function(e) { setProfileInput(e.target.value) }} rows={5} placeholder="למשל: יוסי סטפנסקי או טקסט קצר עליכם..." style={Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.8, marginBottom: 16 })} />
            {bioError && <p style={{ fontSize: 13, color: '#e00', background: '#fff5f5', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 16 }}>{bioError}</p>}
            {bioLoading && <p style={{ textAlign: 'center', fontSize: 14, color: '#6B6B6B', padding: '24px 0' }}>יוצרים עבורכם טיוטה...</p>}
            {!bioLoading && bioGenerated && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2a2a2a', marginBottom: 6 }}>הטיוטה שלכם:</label>
                <textarea value={bioText} onChange={function(e) { if (e.target.value.length <= 800) { setBioText(e.target.value); setBioCount(e.target.value.length) } }} rows={7} style={Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.8, marginBottom: 6 })} />
                <p style={{ fontSize: 11, color: '#B0A89E', textAlign: 'left', marginBottom: 8 }}>{bioCount}/800</p>
                {bioSaveStatus && <p style={{ fontSize: 12, color: '#777', marginBottom: 12 }}>{bioSaveStatus}</p>}
                <button onClick={saveBioAndContinue} style={{ width: '100%', background: '#111', color: '#fff', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                  אישור והמשך ←
                </button>
              </div>
            )}
            {!bioLoading && !bioGenerated && (
              <button onClick={generateBio} disabled={!profileInput.trim()} style={{ width: '100%', background: profileInput.trim() ? '#111' : '#ccc', color: '#fff', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', cursor: profileInput.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Heebo, Arial, sans-serif' }}>
                ✨ צרו לי טיוטה
              </button>
            )}
          </Card>
        )}

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
            <textarea value={bioText} onChange={function(e) { if (e.target.value.length <= 800) { setBioText(e.target.value); setBioCount(e.target.value.length) } }} rows={7} style={Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.8, marginBottom: 6 })} placeholder="הסיפור שלכם..." />
            <p style={{ fontSize: 11, color: bioCount > 720 ? '#e00' : '#B0A89E', textAlign: 'left', marginBottom: 8 }}>{bioCount}/800</p>
            {bioSaveStatus && <p style={{ fontSize: 12, color: '#777', marginBottom: 12 }}>{bioSaveStatus}</p>}
            {bioError && <p style={{ fontSize: 13, color: '#e00', background: '#fff5f5', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 16 }}>{bioError}</p>}
            <button onClick={saveBioAndContinue} disabled={!bioText.trim()} style={{ width: '100%', background: bioText.trim() ? '#111' : '#ccc', color: '#fff', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', cursor: bioText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Heebo, Arial, sans-serif' }}>
              המשיכו ←
            </button>
          </Card>
        )}

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
              <a href={'/add-tour?founder=true&record_id=' + (recordId || '')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}>
                הכניסו את הסיפור הראשון שלכם ←
              </a>
              <button onClick={function() { setScreen('later') }} style={{ width: '100%', background: CREAM, color: BROWN, padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, border: '1.5px solid #EDE7DF', cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
                אשלים את זה בהמשך
              </button>
            </div>
          </Card>
        )}

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
