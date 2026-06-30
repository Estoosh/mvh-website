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

function onlyDigits(val, max) {
  return String(val || '').replace(/\D/g, '').slice(0, max)
}

export default function Founders() {
  const [screen, setScreen] = useState('welcome')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [phonePrefix, setPhonePrefix] = useState('')
  const [phoneRest, setPhoneRest] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileInput, setProfileInput] = useState('')
  const [bioText, setBioText] = useState('')
  const [bioGenerated, setBioGenerated] = useState(false)
  const [bioLoading, setBioLoading] = useState(false)
  const [bioCount, setBioCount] = useState(0)
  const [bioError, setBioError] = useState('')
  const [bioSaveStatus, setBioSaveStatus] = useState('')
const [certificateTrack, setCertificateTrack] = useState('')
const [certificateChoice, setCertificateChoice] = useState('')
const [certificateFile, setCertificateFile] = useState('')
const [certificateUploading, setCertificateUploading] = useState(false)
const [certificateError, setCertificateError] = useState('')
const [contactMessage, setContactMessage] = useState('')
const [showContactModal, setShowContactModal] = useState(false)
const [contactSent, setContactSent] = useState(false)


const [founderStats, setFounderStats] = useState({
  founderCount: 43,
  tourCount: 55,
  averagePrice: 68,
  remainingFounderSpots: 57
})
  const restoredRef = useRef(false)

  function buildDraft(next) {
    const nextForm = next?.form || form
    const nextPhonePrefix = typeof next?.phonePrefix === 'string' ? next.phonePrefix : phonePrefix
    const nextPhoneRest = typeof next?.phoneRest === 'string' ? next.phoneRest : phoneRest
    const nextPhone = nextPhonePrefix + nextPhoneRest

    return {
      screen: next?.screen || screen,
      form: Object.assign({}, nextForm, { phone: nextPhone }),
      phonePrefix: nextPhonePrefix,
      phoneRest: nextPhoneRest,
      profileInput: typeof next?.profileInput === 'string' ? next.profileInput : profileInput,
      bioText: typeof next?.bioText === 'string' ? next.bioText : bioText,
      bioGenerated: typeof next?.bioGenerated === 'boolean' ? next.bioGenerated : bioGenerated,
      founder: {
        name: nextForm.name || '',
        email: nextForm.email || '',
        phone: nextPhone
      }
    }
  }

  function saveDraft(next) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(buildDraft(next)))
    } catch (err) {}
  }

  function resetFlow() {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch (err) {}

    setScreen('welcome')
    setForm({ name: '', email: '', phone: '' })
    setPhonePrefix('')
    setPhoneRest('')
    setProfileInput('')
    setBioText('')
    setBioGenerated(false)
    setBioCount(0)
    setBioError('')
    setBioSaveStatus('')
    setError('')
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
      const draftForm = draft.form || draft.founder || { name: '', email: '', phone: '' }
      const phone = String(draftForm.phone || draft.founder?.phone || '').replace(/\D/g, '')

      if (draft.screen) setScreen(draft.screen)

      setForm({
        name: draftForm.name || '',
        email: draftForm.email || '',
        phone
      })

      if (draft.phonePrefix) setPhonePrefix(draft.phonePrefix)
      else if (phone) setPhonePrefix(phone.slice(0, 3))

      if (draft.phoneRest) setPhoneRest(draft.phoneRest)
      else if (phone) setPhoneRest(phone.slice(3, 10))

      if (draft.profileInput) setProfileInput(draft.profileInput)

      if (draft.bioText) {
        setBioText(draft.bioText)
        setBioCount(draft.bioText.length)
      }

      if (draft.bioGenerated) setBioGenerated(draft.bioGenerated)

      restoredRef.current = true
    } catch (err) {
      restoredRef.current = true
    }
  }, [])

  useEffect(function() {
    if (!restoredRef.current) return

    saveDraft({
      screen,
      form,
      phonePrefix,
      phoneRest,
      profileInput,
      bioText,
      bioGenerated
    })
  }, [screen, form, phonePrefix, phoneRest, profileInput, bioText, bioGenerated])

  useEffect(function() {
    fetch('/api/founder-stats')
      .then(function(res) { return res.json() })
      .then(function(data) {
        if (!data || data.error) return

        setFounderStats({
  founderCount: data.founderCount ?? 43,
  tourCount: data.tourCount ?? 55,
  averagePrice: data.averagePrice ?? 68,
  remainingFounderSpots: data.remainingFounderSpots ?? 57
})
      })
      .catch(function() {})
  }, [])

  const handleChange = function(e) {
    setForm(Object.assign({}, form, { [e.target.name]: e.target.value }))
  }

  const handleRegister = async function(e) {
  e.preventDefault()

  const cleanName = form.name.trim()
  const cleanEmail = form.email.trim().toLowerCase()
  const fullPhone = phonePrefix + phoneRest

  if (!cleanName || !cleanEmail || phonePrefix.length !== 3 || phoneRest.length !== 7) {
    setError('יש למלא את כל השדות כולל מספר טלפון תקין')
    return
  }

  setError('')
  setLoading(true)

  try {
    const res = await fetch('/api/register-founder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        phone: fullPhone
      })
    })

    const data = await res.json()

    if (!res.ok) {
      setError('משהו השתבש. אפשר לנסות שוב.')
      setLoading(false)
      return
    }

    if (data.existing_founder) {
      setError(data.message || 'אתם כבר רשומים לקהילת המייסדים. נשלח אליכם עדכון לקראת ההשקה.')
      setLoading(false)
      return
    }

    const nextForm = {
      name: cleanName,
      email: cleanEmail,
      phone: fullPhone
    }

    setForm(nextForm)

    saveDraft({
      screen: 'success',
      form: nextForm,
      phonePrefix,
      phoneRest
    })

    setScreen('success')
    setLoading(false)
  } catch (err) {
    setError('משהו השתבש. אפשר לנסות שוב.')
    setLoading(false)
  }
}

  async function saveBioLocally(nextBio) {
    const cleanBio = typeof nextBio === 'string' ? nextBio.trim() : ''

    if (!cleanBio) {
      return { success: false, skipped: true }
    }

    setBioSaveStatus('נשמר')
    setBioError('')

    saveDraft({
      screen,
      form,
      phonePrefix,
      phoneRest,
      profileInput,
      bioText: cleanBio,
      bioGenerated
    })

    return { success: true }
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

        saveDraft({
          screen: 'bio-ai',
          form,
          phonePrefix,
          phoneRest,
          profileInput,
          bioText: nextBio,
          bioGenerated: true
        })

        await saveBioLocally(nextBio)
      } else {
        setBioError('לא הצלחנו ליצור טיוטה. אפשר לנסות שוב או לכתוב בעצמכם.')
      }
    } catch (err) {
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

    const result = await saveBioLocally(cleanBio)

    if (!result.success && !result.skipped) return

    saveDraft({
      screen: 'benefit',
      form,
      phonePrefix,
      phoneRest,
      profileInput,
      bioText: cleanBio,
      bioGenerated
    })

    setScreen('certificate')
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
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/Logo-black.png" alt="מאז ועד היום" style={{ height: 60, width: 'auto' }} onError={function(e) { e.target.style.display = 'none' }} />
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

            <button
              onClick={function() { setScreen('register') }}
              style={{ width: '100%', background: '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}
            >
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
              אנחנו פותחים בימים אלו את קהילת המייסדים הראשונה של <span style={{ color: BRAND, fontWeight: 700 }}>מאז ועד היום</span>. זה מתחיל בשלושה פרטים פשוטים.
            </p>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2a2a2a', marginBottom: 6 }}>
                  שם מלא <span style={{ color: BROWN }}>*</span>
                </label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required style={inp} placeholder="השם שיופיע בפרופיל שלכם" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2a2a2a', marginBottom: 6 }}>
                  אימייל <span style={{ color: BROWN }}>*</span>
                </label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required style={inp} placeholder="your@email.com" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2a2a2a', marginBottom: 6 }}>
                  טלפון <span style={{ color: BROWN }}>*</span>
                </label>

                <div style={{ display: 'flex', direction: 'ltr', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phonePrefix}
                    onChange={function(e) { setPhonePrefix(onlyDigits(e.target.value, 3)) }}
                    required
                    style={Object.assign({}, inp, { width: 92, textAlign: 'center', direction: 'ltr' })}
                    placeholder="050"
                    maxLength={3}
                  />

                  <span style={{ color: '#B97A45', fontWeight: 800 }}>-</span>

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneRest}
                    onChange={function(e) { setPhoneRest(onlyDigits(e.target.value, 7)) }}
                    required
                    style={Object.assign({}, inp, { width: 170, textAlign: 'center', direction: 'ltr' })}
                    placeholder="1234567"
                    maxLength={7}
                  />
                </div>
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#e00', background: '#fff5f5', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca' }}>
                  {error}
                </p>
              )}

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
              <p style={{ fontSize: 14, fontWeight: 700, color: '#2a2a2a', marginBottom: 14 }}>
                איך תרצו להציג את עצמכם?
              </p>

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

            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
              ספרו לנו קצת על עצמכם
            </h2>

            <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.7, marginBottom: 20 }}>
              אפשר לכתוב שם מלא, להדביק טקסט קיים שכתבתם על עצמכם, קטע מאתר, פוסט, פרופיל מקצועי או כמה משפטים חופשיים.
            </p>

            <textarea value={profileInput} onChange={function(e) { setProfileInput(e.target.value) }} rows={5} placeholder="למשל: יוסי סטפנסקי או טקסט קצר עליכם..." style={Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.8, marginBottom: 16 })} />

            {bioError && (
              <p style={{ fontSize: 13, color: '#e00', background: '#fff5f5', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 16 }}>
                {bioError}
              </p>
            )}

            {bioLoading && (
              <p style={{ textAlign: 'center', fontSize: 14, color: '#6B6B6B', padding: '24px 0' }}>
                יוצרים עבורכם טיוטה...
              </p>
            )}

            {!bioLoading && bioGenerated && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#2a2a2a', marginBottom: 6 }}>
                  הטיוטה שלכם:
                </label>

                <textarea value={bioText} onChange={function(e) { if (e.target.value.length <= 800) { setBioText(e.target.value); setBioCount(e.target.value.length) } }} rows={7} style={Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.8, marginBottom: 6 })} />

                <p style={{ fontSize: 11, color: '#B0A89E', textAlign: 'left', marginBottom: 8 }}>
                  {bioCount}/800
                </p>

                {bioSaveStatus && (
                  <p style={{ fontSize: 12, color: '#777', marginBottom: 12 }}>
                    {bioSaveStatus}
                  </p>
                )}

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

            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
              ספרו לנו בכמה מילים מי אתם.
            </h2>

            <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.7, marginBottom: 20 }}>
              לא קורות חיים. לא רשימת תפקידים. רק הסיפור שתרצו שאנשים יכירו דרכו אתכם.
            </p>

            <textarea value={bioText} onChange={function(e) { if (e.target.value.length <= 800) { setBioText(e.target.value); setBioCount(e.target.value.length) } }} rows={7} style={Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.8, marginBottom: 6 })} placeholder="הסיפור שלכם..." />

            <p style={{ fontSize: 11, color: bioCount > 720 ? '#e00' : '#B0A89E', textAlign: 'left', marginBottom: 8 }}>
              {bioCount}/800
            </p>

            {bioSaveStatus && (
              <p style={{ fontSize: 12, color: '#777', marginBottom: 12 }}>
                {bioSaveStatus}
              </p>
            )}

            {bioError && (
              <p style={{ fontSize: 13, color: '#e00', background: '#fff5f5', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 16 }}>
                {bioError}
              </p>
            )}

            <button onClick={saveBioAndContinue} disabled={!bioText.trim()} style={{ width: '100%', background: bioText.trim() ? '#111' : '#ccc', color: '#fff', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 800, border: 'none', cursor: bioText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Heebo, Arial, sans-serif' }}>
              המשיכו ←
            </button>
          </Card>
        )}

                {screen === 'certificate' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <TimelineDot />
              <StepBadge number="5" />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>
              לפני שממשיכים, שאלה קצרה.
            </h2>

            <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.8, marginBottom: 24 }}>
              מאז ועד היום נבנה עבור מורי דרך, אבל אנחנו תמיד שמחים להכיר אנשים שיודעים להפוך מקום לסיפור.
            </p>

            <label style={{ display: 'block', border: certificateTrack === 'guide' ? '2px solid #B97A45' : '1px solid #EDE7DF', borderRadius: 12, padding: 16, cursor: 'pointer', marginBottom: 12 }}>
              <input type="radio" checked={certificateTrack === 'guide'} onChange={function() { setCertificateTrack('guide') }} style={{ marginLeft: 8 }} />
              אני מורה דרך מוסמך בעל תעודה בתוקף
            </label>

           
            {certificateTrack === 'guide' && (
  <div>
    <label style={{ display: 'block', marginBottom: 10 }}>
      <input type="radio" checked={certificateChoice === 'upload'} onChange={function() { setCertificateChoice('upload') }} style={{ marginLeft: 8 }} />
      אעלה תעודה עכשיו
    </label>

    <label style={{ display: 'block', marginBottom: 16 }}>
      <input type="radio" checked={certificateChoice === 'later'} onChange={function() { setCertificateChoice('later') }} style={{ marginLeft: 8 }} />
      אעלה את התעודה בהמשך
    </label>

    {certificateChoice === 'upload' && (
      <label style={{ width: 100, height: 100, borderRadius: 10, border: '2px dashed #EDE7DF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#FBF7F1', gap: 4, marginBottom: 14 }}>
        <span style={{ fontSize: 22, color: '#C0B8AE' }}>+</span>
        <span style={{ fontSize: 11, color: '#B0A89E', fontFamily: 'Heebo,Arial,sans-serif' }}>
          {certificateFile ? 'הקובץ נבחר' : 'העלאת תעודה'}
        </span>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={function(e) {
            const file = e.target.files && e.target.files[0]
            if (file) setCertificateFile(file.name)
          }}
          style={{ display: 'none' }}
        />
      </label>
    )}

    {certificateChoice === 'later' && (
      <div style={{ background: '#FBF7F1', border: '1px solid #EDE7DF', borderRadius: 12, padding: 16, fontSize: 14, lineHeight: 1.8, color: '#555', marginBottom: 16 }}>
        אין בעיה. אפשר להמשיך להוסיף סיורים ולעבוד כרגיל. הסיורים שלכם יפורסמו לציבור לאחר העלאת התעודה ואישור קצר של הצוות. נשלח לכם תזכורת לקראת השקת האתר.
      </div>
    )}

    <button onClick={function() { setScreen('benefit') }} disabled={!certificateChoice} style={{ width: '100%', background: certificateChoice ? '#111' : '#ccc', color: '#fff', padding: '14px', borderRadius: 12, border: 'none', fontWeight: 800, cursor: certificateChoice ? 'pointer' : 'not-allowed', fontFamily: 'Heebo, Arial, sans-serif' }}>
      המשיכו ←
    </button>
  </div>
)}

<label style={{ display: 'block', border: certificateTrack === 'other' ? '2px solid #B97A45' : '1px solid #EDE7DF', borderRadius: 12, padding: 16, cursor: 'pointer', marginBottom: 20 }}>
  <input type="radio" checked={certificateTrack === 'other'} onChange={function() { setCertificateTrack('other') }} style={{ marginLeft: 8 }} />
  אני לא מורה דרך ומעוניין להציע שירותים אחרים באתר
  <div style={{ fontSize: 13, color: '#777', marginTop: 8 }}>
    (למשל הרצאות, סדנאות או חוויות אחרות המבוססות על מקום וסיפור)
  </div>
</label>

            {certificateTrack === 'other' && (
    <button
  type="button"
  onClick={function() { setShowContactModal(true) }}
  style={{
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#111',
    color: '#fff',
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    fontWeight: 800,
    fontFamily: 'Heebo, Arial, sans-serif',
    cursor: 'pointer'
  }}
>
  ספרו לנו בקצרה ←
</button>
            )}
                   </Card>
        )}
{contactSent && (
  <Card>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24
    }}>
      <TimelineDot />
      <StepBadge number="✓" />
    </div>

    <h2 style={{
      fontSize: 28,
      fontWeight: 900,
      color: '#1a1a1a',
      marginBottom: 18,
      lineHeight: 1.3
    }}>
      תודה. קיבלנו את ההודעה שלכם.
    </h2>

    <p style={{
      fontSize: 16,
      color: '#666',
      lineHeight: 1.9,
      marginBottom: 16
    }}>
      מאז ועד היום נבנה עבור מורי דרך, אבל חלק מהרעיונות הטובים ביותר מגיעים מאנשים שיודעים להפוך מקום לסיפור בדרך אחרת.
    </p>

    <p style={{
      fontSize: 16,
      color: '#666',
      lineHeight: 1.9,
      marginBottom: 30
    }}>
      נחזור אליכם אם נחשוב שיש התאמה.
    </p>

    <button
      type="button"
      onClick={function() {
        window.location.href = '/'
      }}
      style={{
        width: '100%',
        background: '#111',
        color: '#fff',
        border: 'none',
        padding: '18px',
        borderRadius: 14,
        fontSize: 18,
        fontWeight: 800,
        cursor: 'pointer',
        fontFamily: 'Heebo, Arial, sans-serif'
      }}
    >
      חזרה לאתר ←
    </button>
  </Card>
)}
        {showContactModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.42)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}>
            <div style={{
              width: '100%',
              maxWidth: 420,
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 24px 70px rgba(0,0,0,0.22)',
              border: '1px solid #EDE7DF'
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 10px', color: '#1a1a1a' }}>
                ספרו לנו בקצרה
              </h3>

              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, margin: '0 0 14px' }}>
                מה תרצו להציע במאז ועד היום?
              </p>

              <textarea
                value={contactMessage}
                onChange={function(e) {
                  if (e.target.value.length <= 200) setContactMessage(e.target.value)
                }}
                rows={5}
                placeholder="עד 200 תווים..."
                style={{
                  width: '100%',
                  border: '1.5px solid #EDE7DF',
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 14,
                  fontFamily: 'Heebo, Arial, sans-serif',
                  lineHeight: 1.7,
                  resize: 'none',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />

              <div style={{ fontSize: 11, color: '#999', textAlign: 'left', marginTop: 6 }}>
                {contactMessage.length}/200
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button
                  type="button"
                  onClick={function() { setShowContactModal(false) }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 12,
                    border: '1px solid #EDE7DF',
                    background: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: 'Heebo, Arial, sans-serif'
                  }}
                >
                  ביטול
                </button>

                <button
  type="button"
  onClick={async function() {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'אני לא מורה דרך ומעוניין להציע שירותים אחרים באתר',
        message: contactMessage
      })
    })

    if (res.ok) {
      setContactMessage('')
setShowContactModal(false)
setContactSent(true)
    } else {
      alert('לא הצלחנו לשלוח. נסו שוב.')
    }
  }}
  disabled={!contactMessage.trim()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 12,
                    border: 'none',
                    background: contactMessage.trim() ? '#111' : '#ccc',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: contactMessage.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'Heebo, Arial, sans-serif'
                  }}
                >
                  שלחו
                </button>
              </div>
            </div>
          </div>
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

           <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: 24 }}>
  הסיור הזה יהיה חלק מהדור הראשון של הסיפורים שירכיבו את הקהילה.
</p>

<div style={{
  position: 'relative',
  padding: '30px 0',
  marginBottom: 28,
  textAlign: 'center'
}}>
  <div style={{ position: 'absolute', top: 0, right: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: TIMELINE }} />
    <span style={{ width: 52, height: 1, background: TIMELINE, opacity: 0.35 }} />
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: TIMELINE, opacity: 0.55 }} />
    <span style={{ width: 52, height: 1, background: TIMELINE, opacity: 0.35 }} />
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: TIMELINE }} />
  </div>

  <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: TIMELINE }} />
    <span style={{ width: 52, height: 1, background: TIMELINE, opacity: 0.35 }} />
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: TIMELINE, opacity: 0.55 }} />
    <span style={{ width: 52, height: 1, background: TIMELINE, opacity: 0.35 }} />
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: TIMELINE }} />
  </div>

  <div style={{
    fontSize: 14,
    fontWeight: 700,
    color: '#2a2a2a',
    marginBottom: 16
  }}>
    כבר בקהילת המייסדים:
  </div>

  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 15,
    color: '#555',
    lineHeight: 1.8
  }}>
   <div><span style={{ fontWeight: 800, color: '#2a2a2a' }}>{founderStats.founderCount}</span> מורי דרך</div>
<div><span style={{ fontWeight: 800, color: '#2a2a2a' }}>{founderStats.tourCount}</span> סיורים</div>
<div><span style={{ fontWeight: 800, color: '#2a2a2a' }}>₪{founderStats.averagePrice}</span> מחיר ממוצע למשתתף</div>
<div><span style={{ fontWeight: 800, color: '#2a2a2a' }}>{founderStats.remainingFounderSpots}</span> מקומות פנויים בתוכנית המייסדים</div>
  </div>

  <div style={{
    marginTop: 16,
    fontSize: 12,
    color: '#888'
  }}>
    * הסיור הראשון של המייסדים נשאר ללא עלות חודשית.
  </div>

</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="/add-tour?founder=true"
                onClick={function() {
                  saveDraft({
                    screen: 'benefit',
                    form,
                    phonePrefix,
                    phoneRest,
                    profileInput,
                    bioText,
                    bioGenerated
                  })
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800, textDecoration: 'none', fontFamily: 'Heebo, Arial, sans-serif' }}
              >
                הכניסו את הסיפור הראשון שלכם ←
              </a>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
