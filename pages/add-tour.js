import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import Header from '../components/Header'

const CITIES = ["אילת","אשדוד","אשקלון","באר שבע","באר יעקב","בית שאן","בית שמש","בני ברק","גבעתיים","דימונה","הוד השרון","הרצליה","חדרה","חולון","חיפה","טבריה","טירת כרמל","יבנה","יהוד","ירושלים","כפר סבא","כרמיאל","לוד","מודיעין","נהריה","נס ציונה","נצרת","נתיבות","נתניה","עכו","עפולה","פתח תקווה","צפת","קריית אתא","קריית גת","קריית מוצקין","קריית שמונה","ראש העין","ראשון לציון","רהט","רחובות","רמלה","רמת גן","רמת השרון","רעננה","שדרות","תל אביב","עין גדי","מצדה","קומראן","ים המלח","השרון","גליל עליון","גליל מערבי","גולן","נגב","ערבה","שפלה","שרון"]
const DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"]
const TIMES = ["בוקר","אחה\"צ","ערב"]
const DEFAULT_ITEMS = ["מים","כובע","קרם הגנה","תכשיר נגד יתושים","נעלי הליכה","בגדים נוחים","אוכל קל","מטען לטלפון","מצלמה","כסף מזומן"]

export default function AddTour() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [guideId, setGuideId] = useState(null)
  const [guide, setGuide] = useState(null)
  const [teaserCount, setTeaserCount] = useState(0)
  const [isAbroad, setIsAbroad] = useState(false)
  const [byAppointment, setByAppointment] = useState(false)
  const [selectedDays, setSelectedDays] = useState([])
  const [selectedTimes, setSelectedTimes] = useState([])
  const [checkedItems, setCheckedItems] = useState(["מים","כובע","קרם הגנה"])
  const [customItem, setCustomItem] = useState('')
  const [extraItems, setExtraItems] = useState([])
  const [meetingPoint, setMeetingPoint] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const meetingRef = useRef(null)
  const [form, setForm] = useState({
    title: '',
    teaser: '',
    story: '',
    price: '',
    duration: '',
    cities: '',
    min_age: '1',
    max_age: '99',
    collab_code: '',
    pets_allowed: false,
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

  useEffect(function() {
    if (!window.google) {
      var script = document.createElement('script')
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY + '&libraries=places&language=he'
      script.async = true
      script.onload = initAutocomplete
      document.head.appendChild(script)
    } else {
      initAutocomplete()
    }
  }, [])

  function initAutocomplete() {
    if (!meetingRef.current) return
    var autocomplete = new window.google.maps.places.Autocomplete(meetingRef.current, { language: 'he' })
    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace()
      setMeetingPoint(place.formatted_address || '')
      setMeetingLink(place.url || 'https://maps.google.com/?q=' + encodeURIComponent(place.formatted_address || ''))
    })
  }

  const handleChange = function(e) {
    var val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (e.target.name === 'teaser') {
      if (e.target.value.length > 120) return
      setTeaserCount(e.target.value.length)
    }
    setForm(Object.assign({}, form, { [e.target.name]: val }))
  }

  const toggleDay = function(day) {
    if (byAppointment) return
    setSelectedDays(function(prev) {
      return prev.includes(day) ? prev.filter(function(d) { return d !== day }) : prev.concat(day)
    })
  }

  const toggleTime = function(time) {
    if (byAppointment) return
    setSelectedTimes(function(prev) {
      return prev.includes(time) ? prev.filter(function(t) { return t !== time }) : prev.concat(time)
    })
  }

  const toggleItem = function(item) {
    setCheckedItems(function(prev) {
      return prev.includes(item) ? prev.filter(function(i) { return i !== item }) : prev.concat(item)
    })
  }

  const addCustomItem = function() {
    if (!customItem.trim()) return
    setExtraItems(function(prev) { return prev.concat(customItem.trim()) })
    setCheckedItems(function(prev) { return prev.concat(customItem.trim()) })
    setCustomItem('')
  }

  const handleSubmit = async function(e) {
    e.preventDefault()
    setLoading(true)
    var allItems = DEFAULT_ITEMS.concat(extraItems).filter(function(i) { return checkedItems.includes(i) })
    try {
      const res = await fetch('/api/add-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, form, {
          guide_id: guideId,
          guide_name: guide ? guide.Guide_Name : '',
          is_abroad: isAbroad,
          by_appointment: byAppointment,
          days: byAppointment ? [] : selectedDays,
          times: byAppointment ? [] : selectedTimes,
          bring_items: allItems,
          meeting_point: meetingPoint,
          meeting_link: meetingLink,
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

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15, fontFamily: 'Heebo, Arial, sans-serif', outline: 'none' }
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }
  const sectionStyle = { marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #eee' }

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>הוסף סיור חדש</h1>
        <p style={{ color: '#666', marginBottom: 40 }}>פרטי הסיור יופיעו בעמוד שלך באתר</p>

        <form onSubmit={handleSubmit}>

          <div style={sectionStyle}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>שם הסיור <span style={{ color: '#C4922A' }}>*</span></label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                תיאור קצר <span style={{ color: '#C4922A' }}>*</span>
                <span style={{ fontWeight: 400, color: teaserCount > 100 ? '#e00' : '#999', marginRight: 8 }}>{teaserCount}/120</span>
              </label>
              <input type="text" name="teaser" value={form.teaser} onChange={handleChange} required maxLength={120} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>סיפור הסיור <span style={{ color: '#C4922A' }}>*</span></label>
              <textarea name="story" value={form.story} onChange={handleChange} required rows={5}
                style={Object.assign({}, inputStyle, { resize: 'vertical' })} />
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>מחיר למשתתף (מינימום 55) <span style={{ color: '#C4922A' }}>*</span></label>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min="55" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>משך הסיור (שעות) <span style={{ color: '#C4922A' }}>*</span></label>
                <input type="number" name="duration" value={form.duration} onChange={handleChange} required min="0.5" step="0.5" style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>יישוב/אזור <span style={{ color: '#C4922A' }}>*</span></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={isAbroad} onChange={function(e) {
                  setIsAbroad(e.target.checked)
                  if (e.target.checked) setForm(Object.assign({}, form, { cities: 'חו"ל' }))
                  else setForm(Object.assign({}, form, { cities: '' }))
                }} />
                סיור בחו"ל
              </label>
            </div>
            <select name="cities" value={form.cities} onChange={handleChange} required={!isAbroad} disabled={isAbroad}
              style={Object.assign({}, inputStyle, { background: isAbroad ? '#f5f5f5' : '#fff', color: isAbroad ? '#999' : '#000' })}>
              <option value="">בחרו יישוב</option>
              {CITIES.sort().map(function(c) { return <option key={c} value={c}>{c}</option> })}
            </select>
          </div>

          <div style={sectionStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>גיל מינימום</label>
                <select name="min_age" value={form.min_age} onChange={handleChange} style={inputStyle}>
                  {Array.from({length: 18}, function(_, i) { return i + 1 }).map(function(n) {
                    return <option key={n} value={n}>{n}</option>
                  })}
                </select>
              </div>
              <div>
                <label style={labelStyle}>גיל מקסימום</label>
                <select name="max_age" value={form.max_age} onChange={handleChange} style={inputStyle}>
                  {Array.from({length: 81}, function(_, i) { return i + 19 }).map(function(n) {
                    return <option key={n} value={n}>{n}</option>
                  })}
                </select>
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>נקודת מפגש</label>
            <input
              ref={meetingRef}
              type="text"
              value={meetingPoint}
              onChange={function(e) { setMeetingPoint(e.target.value) }}
              placeholder="הקלידו כתובת לחיפוש..."
              style={inputStyle}
            />
            {meetingLink && (
              <a href={meetingLink} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: 8, fontSize: 13, color: '#C4922A' }}>
                פתח בגוגל מאפס
              </a>
            )}
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>ימים ושעות</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer', marginBottom: 16 }}>
              <input type="checkbox" checked={byAppointment} onChange={function(e) {
                setByAppointment(e.target.checked)
                if (e.target.checked) { setSelectedDays([]); setSelectedTimes([]) }
              }} />
              בתיאום מראש בלבד
            </label>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>ימים זמינים:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DAYS.map(function(day) {
                  return (
                    <button key={day} type="button" onClick={function() { toggleDay(day) }}
                      style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', fontSize: 13,
                        cursor: byAppointment ? 'not-allowed' : 'pointer',
                        background: selectedDays.includes(day) ? '#0A0A0A' : '#fff',
                        color: selectedDays.includes(day) ? '#fff' : '#444',
                        borderColor: selectedDays.includes(day) ? '#0A0A0A' : '#ddd',
                        opacity: byAppointment ? 0.4 : 1 }}>
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>שעות:</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {TIMES.map(function(time) {
                  return (
                    <button key={time} type="button" onClick={function() { toggleTime(time) }}
                      style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', fontSize: 13,
                        cursor: byAppointment ? 'not-allowed' : 'pointer',
                        background: selectedTimes.includes(time) ? '#0A0A0A' : '#fff',
                        color: selectedTimes.includes(time) ? '#fff' : '#444',
                        borderColor: selectedTimes.includes(time) ? '#0A0A0A' : '#ddd',
                        opacity: byAppointment ? 0.4 : 1 }}>
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" name="pets_allowed" checked={form.pets_allowed} onChange={handleChange} />
              מותר להביא חיות מחמד
            </label>
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>מה להביא לסיור?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {DEFAULT_ITEMS.concat(extraItems).map(function(item) {
                return (
                  <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer',
                    background: checkedItems.includes(item) ? '#FDF6EA' : '#F5F5F5',
                    border: '1px solid',
                    borderColor: checkedItems.includes(item) ? '#C4922A' : '#ddd',
                    padding: '6px 12px', borderRadius: 20 }}>
                    <input type="checkbox" checked={checkedItems.includes(item)} onChange={function() { toggleItem(item) }} style={{ display: 'none' }} />
                    {checkedItems.includes(item) ? '✓ ' : ''}{item}
                  </label>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" value={customItem} onChange={function(e) { setCustomItem(e.target.value) }}
                placeholder="הוסף פריט..."
                style={Object.assign({}, inputStyle, { flex: 1 })}
                onKeyDown={function(e) { if (e.key === 'Enter') { e.preventDefault(); addCustomItem() } }} />
              <button type="button" onClick={addCustomItem}
                style={{ padding: '10px 16px', background: '#0A0A0A', color: '#fff', borderRadius: 6, fontSize: 14, cursor: 'pointer' }}>
                הוסף
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>יש לך קוד שת"פ MvH?</p>
            <input type="text" name="collab_code" value={form.collab_code} onChange={handleChange} style={inputStyle} />
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
