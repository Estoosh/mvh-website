import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import Header from '../../components/Header'

const CITIES = ["אילת","אשדוד","אשקלון","באר שבע","באר יעקב","בית שאן","בית שמש","בני ברק","גבעתיים","דימונה","הוד השרון","הרצליה","חדרה","חולון","חיפה","טבריה","טירת כרמל","יבנה","יהוד","ירושלים","כפר סבא","כרמיאל","לוד","מודיעין","נהריה","נס ציונה","נצרת","נתיבות","נתניה","עכו","עפולה","פתח תקווה","צפת","קריית אתא","קריית גת","קריית מוצקין","קריית שמונה","ראש העין","ראשון לציון","רהט","רחובות","רמלה","רמת גן","רמת השרון","רעננה","שדרות","תל אביב","עין גדי","מצדה","קומראן","ים המלח","השרון","גליל עליון","גליל מערבי","גולן","נגב","ערבה","שפלה","שרון"]
const DEFAULT_ITEMS = ["מים","כובע","קרם הגנה","תכשיר נגד יתושים","נעלי הליכה","בגדים נוחים","אוכל קל","מטען לטלפון","מצלמה","כסף מזומן"]

export default function EditTour({ tour }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notAuthorized, setNotAuthorized] = useState(false)
  const [teaserCount, setTeaserCount] = useState(tour ? (tour.Tour_Teaser || '').length : 0)
  const [isAbroad, setIsAbroad] = useState(tour ? tour.Cities_Tags === 'חו"ל' : false)
  const [checkedItems, setCheckedItems] = useState(["מים","כובע","קרם הגנה"])
  const [customItem, setCustomItem] = useState('')
  const [extraItems, setExtraItems] = useState([])
  const [meetingPoint, setMeetingPoint] = useState(tour ? (tour.Meeting_Point_Waze || '') : '')
  const [meetingLink, setMeetingLink] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const initialImages = tour && tour.Tour_Images
    ? tour.Tour_Images.split('|').map(function(s) { return s.trim() }).filter(Boolean).map(function(url) {
        return { url: url, public_id: url }
      })
    : []
  const [images, setImages] = useState(initialImages)
  const [coverIndex, setCoverIndex] = useState(0)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')
  const meetingRef = useRef(null)

  const [form, setForm] = useState({
    title: tour ? tour.Tour_Title || '' : '',
    teaser: tour ? tour.Tour_Teaser || '' : '',
    story: tour ? tour.Tour_Story || '' : '',
    price: tour ? String(tour.Price_Per_Person || '') : '',
    duration: tour ? String(tour.Duration_Hours || '') : '',
    cities: tour ? tour.Cities_Tags || '' : '',
    min_age: tour ? String(tour.Min_Age || '1') : '1',
    max_age: '99',
    collab_code: '',
    pets_allowed: false,
  })

  useEffect(function() {
    if (!isLoaded || !tour) return
    if (!user) { router.push('/sign-in'); return }
    fetch('/api/get-guide?clerk_id=' + user.id)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (!data.found || data.guide.Guide_Name !== tour.Guide_Name) {
          setNotAuthorized(true)
        }
      })
  }, [isLoaded, user, tour])

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

  if (!tour) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <p>הסיור לא נמצא</p>
        </div>
      </div>
    )
  }

  if (notAuthorized) {
    return (
      <div>
        <Header />
        <div style={{ textAlign: 'center', padding: '120px 24px' }}>
          <p>אין לך הרשאה לערוך סיור זה</p>
        </div>
      </div>
    )
  }

  const handleChange = function(e) {
    var val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (e.target.name === 'teaser') {
      if (e.target.value.length > 120) return
      setTeaserCount(e.target.value.length)
    }
    setForm(Object.assign({}, form, { [e.target.name]: val }))
  }

  const generateWithAI = async function() {
    if (!form.title.trim()) {
      setAiError('יש להזין שם סיור לפני יצירת הטקסט')
      return
    }
    setAiError('')
    setAiLoading(true)
    try {
      const res = await fetch('/api/generate-tour-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title })
      })
      const data = await res.json()
      if (data.error) {
        setAiError('לא הצלחנו ליצור טקסט. אפשר לנסות שוב או לכתוב ידנית.')
        setAiLoading(false)
        return
      }
      setForm(function(prev) {
        return Object.assign({}, prev, { teaser: data.teaser || prev.teaser, story: data.story || prev.story })
      })
      setTeaserCount((data.teaser || '').length)
      setAiLoading(false)
    } catch (err) {
      console.error(err)
      setAiError('לא הצלחנו ליצור טקסט. אפשר לנסות שוב או לכתוב ידנית.')
      setAiLoading(false)
    }
  }

  const handleImageUpload = async function(e) {
    var files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (images.length + files.length > 8) {
      setImageError('ניתן להעלות עד 8 תמונות בסך הכל')
      files = files.slice(0, Math.max(0, 8 - images.length))
      if (files.length === 0) return
    } else {
      setImageError('')
    }
    setUploadingImage(true)

    for (var i = 0; i < files.length; i++) {
      await new Promise(function(resolve) {
        var reader = new FileReader()
        reader.onloadend = async function() {
          try {
            var res = await fetch('/api/upload-tour-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image_base64: reader.result })
            })
            var data = await res.json()
            if (data.url) {
              setImages(function(prev) { return prev.concat({ url: data.url, public_id: data.public_id }) })
            } else {
              setImageError('חלק מהתמונות נכשלו בהעלאה')
            }
          } catch (err) {
            console.error(err)
            setImageError('חלק מהתמונות נכשלו בהעלאה')
          }
          resolve()
        }
        reader.readAsDataURL(files[i])
      })
    }
    setUploadingImage(false)
  }

  const removeImage = function(index) {
    setImages(function(prev) { return prev.filter(function(_, i) { return i !== index }) })
    setCoverIndex(function(prev) {
      if (index === prev) return 0
      if (index < prev) return prev - 1
      return prev
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
    try {
      var orderedImageUrls = []
      if (images.length > 0) {
        var safeCoverIndex = (coverIndex >= 0 && coverIndex < images.length) ? coverIndex : 0
        orderedImageUrls.push(images[safeCoverIndex].url)
        images.forEach(function(img, i) {
          if (i !== safeCoverIndex) orderedImageUrls.push(img.url)
        })
      }

      const res = await fetch('/api/update-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, form, {
          tour_id: tour.id,
          meeting_point: meetingPoint,
          image_urls: orderedImageUrls,
        }))
      })
      const data = await res.json()
      if (data.id) {
        router.push('/tours/' + tour.id)
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
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>ערוך סיור</h1>
        <p style={{ color: '#666', marginBottom: 40 }}>עדכן את פרטי הסיור שלך</p>

        <form onSubmit={handleSubmit}>

          <div style={sectionStyle}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>שם הסיור <span style={{ color: '#C4922A' }}>*</span></label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <button type="button" onClick={generateWithAI} disabled={aiLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FDF6EA', color: '#C4922A', border: '1px solid #C4922A',
                  padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: aiLoading ? 'not-allowed' : 'pointer', opacity: aiLoading ? 0.6 : 1 }}>
                ✨ {aiLoading ? 'יוצר טקסט...' : 'הצע ניסוח עם AI'}
              </button>
              {aiError && (
                <p style={{ fontSize: 12, color: '#e00', marginTop: 6 }}>{aiError}</p>
              )}
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
            <label style={labelStyle}>תמונות הסיור (עד 8)</label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              {images.map(function(img, i) {
                return (
                  <div key={img.public_id} style={{ position: 'relative', width: 100, height: 100 }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8,
                      border: i === coverIndex ? '3px solid #C4922A' : '1px solid #ddd' }} />
                    <button type="button" onClick={function() { setCoverIndex(i) }}
                      style={{ position: 'absolute', bottom: 2, right: 2, fontSize: 10, background: i === coverIndex ? '#C4922A' : '#fff',
                        color: i === coverIndex ? '#fff' : '#444', border: '1px solid #ddd', borderRadius: 4, padding: '2px 6px' }}>
                      {i === coverIndex ? 'תמונה ראשית' : 'הפוך לראשית'}
                    </button>
                    <button type="button" onClick={function() { removeImage(i) }}
                      style={{ position: 'absolute', top: 2, left: 2, width: 20, height: 20, borderRadius: '50%',
                        background: '#0A0A0A', color: '#fff', fontSize: 12, lineHeight: 1 }}>
                      ×
                    </button>
                  </div>
                )
              })}
            </div>

            {images.length < 8 && (
              <label style={{ display: 'inline-block', padding: '10px 20px', background: '#F5F5F5', borderRadius: 6,
                fontSize: 13, cursor: uploadingImage ? 'not-allowed' : 'pointer', opacity: uploadingImage ? 0.6 : 1 }}>
                {uploadingImage ? 'מעלה...' : '+ הוסף תמונה'}
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImage} style={{ display: 'none' }} />
              </label>
            )}
            {imageError && <p style={{ fontSize: 12, color: '#e00', marginTop: 6 }}>{imageError}</p>}
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
            {loading ? 'שומר...' : 'שמור שינויים'}
          </button>
        </form>
      </div>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const token = process.env.AIRTABLE_TOKEN
    const baseId = process.env.AIRTABLE_BASE_ID
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/tbltsGvfPLMAmJ764/${params.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) return { props: { tour: null } }
    const record = await response.json()
    const tour = Object.assign({ id: record.id }, record.fields)
    return { props: { tour } }
  } catch(e) {
    return { props: { tour: null } }
  }
}
