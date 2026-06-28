import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { loadGoogleMaps } from '../lib/loadGoogleMaps'

const BROWN = '#7E4821'
const CREAM = '#F7F1EA'
const TIMELINE_COLOR = '#C8A582'
const DRAFT_KEY = 'mvh_founder_onboarding_draft'

const CITIES = [
  "אבו גוש","אבן יהודה","אופקים","אור יהודה","אור עקיבא","אילת","אכסאל","אלעד","אפרת","אריאל",
  "אשדוד","אשקלון","באקה אל-גרביה","באר יעקב","באר שבע","בית אל","בית דגן","בית לחם הגלילית",
  "בית שאן","בית שמש","בני ברק","בני עי\"ש","ביתר עילית","גבעת שמואל","גבעתיים","גדרה","גן יבנה",
  "גני תקווה","דאלית אל-כרמל","דימונה","הוד השרון","הרצליה","זיכרון יעקב","חדרה","חולון","חיפה",
  "טבריה","טירה","טירת כרמל","יבנה","יהוד","יוקנעם","ירושלים","כאבול","כוכב יאיר","כפר סבא",
  "כפר שמריהו","כרמיאל","לוד","מבשרת ציון","מגדל העמק","מודיעין","מודיעין עילית","מעלה אדומים",
  "מעלות תרשיחא","מצדה","מצפה רמון","נהריה","נוף הגליל","נס ציונה","נצרת","נתיבות","נתניה",
  "סח'נין","עכו","עפולה","ערד","פתח תקווה","צפת","קיסריה","קריית אתא","קריית ביאליק","קריית גת",
  "קריית מוצקין","קריית שמונה","קריית ים","ראש העין","ראש פינה","ראשון לציון","רהט","רחובות",
  "רמלה","רמת גן","רמת השרון","רעננה","שדרות","שפרעם","תל אביב","תל מונד",
  "אגם כינרת","אילות","ארבל","בקעת הירדן","בקעת כנרות","גולן","גליל עליון","גליל מערבי","גליל תחתון",
  "גן לאומי עין גדי","הגלבוע","הכרמל","המכתש הגדול","המכתש הקטן","הנגב הצפוני","הערבה","הר הכרמל",
  "הר הנגב","הר מירון","הר תבור","הרי יהודה","הרי ירושלים","ואדי קלט","חוף הכרמל","חוף דור",
  "חולה","ים המלח","ים כינרת","יער בן שמן","יער ירושלים","כנרת","מדבר יהודה","מדבר נגב",
  "מדרשת בן גוריון","מכתש רמון","מצוקי דרגות","מצפה שלם","נגב","נחל דוד","נחל פרת","נחל צאלים",
  "נחל ערוגות","ניצנה","עין גדי","עין עבדת","עמק האלה","עמק המעיינות","עמק יזרעאל","עמק הירדן",
  "פארק הירדן","קומראן","רמות","שומרון","שפלה","שרון","תל דן","תל מגידו",
]

const DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"]
const TIMES = ['בוקר','אחה"צ','ערב']
const DEFAULT_ITEMS = ["מים","כובע","קרם הגנה","תכשיר נגד יתושים","נעלי הליכה","בגדים נוחים","אוכל קל","מטען לטלפון","מצלמה","כסף מזומן"]
const HISTORICAL_PERIODS = ["תקופת המקרא / ימי האבות","בית ראשון (ממלכת ישראל ויהודה)","בית שני","התקופה הרומית-ביזנטית","התקופה המוסלמית הקדומה","תקופת הצלבנים","התקופה הממלוכית","התקופה העות'מאנית","המנדט הבריטי","מדינת ישראל (1948 ואילך)"]

const inp = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1.5px solid #EDE7DF',
  fontSize: 14,
  fontFamily: 'Heebo, Arial, sans-serif',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
  color: '#1a1a1a'
}

const chip = function(selected) {
  return {
    padding: '7px 14px',
    borderRadius: 20,
    border: '1.5px solid',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'Heebo, Arial, sans-serif',
    fontWeight: 600,
    background: selected ? '#111' : '#fff',
    color: selected ? '#fff' : '#555',
    borderColor: selected ? '#111' : '#EDE7DF',
    transition: 'all 0.15s'
  }
}

function onlyDigits(value, max) {
  return String(value || '').replace(/\D/g, '').slice(0, max)
}

function TimelineDivider() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', userSelect: 'none' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: TIMELINE_COLOR }} />
        <div style={{ width: 2, height: 32, background: TIMELINE_COLOR, opacity: 0.35 }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: TIMELINE_COLOR, opacity: 0.5 }} />
        <div style={{ width: 2, height: 32, background: TIMELINE_COLOR, opacity: 0.35 }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: TIMELINE_COLOR }} />
      </div>
    </div>
  )
}

function SectionCard({ children, style }) {
  return (
    <div style={Object.assign({
      background: '#fff',
      borderRadius: 18,
      padding: '28px 32px',
      border: '1px solid #EDE7DF',
      boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
    }, style)}>
      {children}
    </div>
  )
}

function SectionLabel({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: subtitle ? 6 : 0 }}>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: BROWN, color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Heebo, Arial, sans-serif' }}>
          {number}
        </span>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', margin: 0, fontFamily: 'Heebo, Arial, sans-serif' }}>
          {title}
        </h2>
      </div>

      {subtitle && (
        <p style={{ fontSize: 14, color: '#6B6B6B', margin: '6px 0 0 36px', lineHeight: 1.65, fontFamily: 'Heebo, Arial, sans-serif' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function FieldLabel({ children, required, hint }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: '#2a2a2a', fontFamily: 'Heebo, Arial, sans-serif' }}>
        {children} {required && <span style={{ color: BROWN }}>*</span>}
      </label>
      {hint && (
        <p style={{ fontSize: 12, color: '#6B6B6B', margin: '3px 0 0', fontFamily: 'Heebo, Arial, sans-serif' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

function AITimelineAnim() {
  const [step, setStep] = useState(0)

  useEffect(function() {
    var interval = setInterval(function() {
      setStep(function(s) { return (s + 1) % 3 })
    }, 500)

    return function() {
      clearInterval(interval)
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {[0, 1, 2].map(function(i) {
        var active = i === step

        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: active ? 12 : 8, height: active ? 12 : 8, borderRadius: '50%', background: active ? BROWN : TIMELINE_COLOR, transition: 'all 0.3s', opacity: active ? 1 : 0.4 }} />
            {i < 2 && <div style={{ width: 2, height: 20, background: TIMELINE_COLOR, opacity: 0.3 }} />}
          </div>
        )
      })}
    </div>
  )
}

function AILoadingAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 6 }}>
      <AITimelineAnim />
      <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 12, fontFamily: 'Heebo, Arial, sans-serif' }}>
        מאז ועד היום כותב עבורכם...
      </p>
    </div>
  )
}

function SuccessToast({ show }) {
  if (!show) return null

  return (
    <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #EDE7DF', borderRadius: 14, padding: '14px 24px', boxShadow: '0 8px 28px rgba(0,0,0,0.12)', zIndex: 300, textAlign: 'center', fontFamily: 'Heebo, Arial, sans-serif', minWidth: 280 }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>
        ✨ יצרנו עבורכם טיוטה ראשונית.
      </p>
      <p style={{ fontSize: 13, color: '#6B6B6B', margin: 0 }}>
        עכשיו תנו לה את הטאץ׳ האישי שלכם.
      </p>
    </div>
  )
}

function CityAutocomplete({ value, onChange }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const filtered = query.length >= 1 ? CITIES.filter(c => c.includes(query)).slice(0, 8) : []

  useEffect(function() {
    setQuery(value || '')
  }, [value])

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={function(e) {
          setQuery(e.target.value)
          onChange('')
          setOpen(true)
        }}
        onFocus={function() { setOpen(true) }}
        onBlur={function() { setTimeout(function() { setOpen(false) }, 150) }}
        placeholder="הקלידו שם יישוב או אזור..."
        style={inp}
      />

      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, background: '#fff', border: '1.5px solid #EDE7DF', borderRadius: 10, zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 240, overflowY: 'auto' }}>
          {filtered.map(function(c) {
            return (
              <div
                key={c}
                onMouseDown={function() {
                  setQuery(c)
                  onChange(c)
                  setOpen(false)
                }}
                style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 14, fontFamily: 'Heebo, Arial, sans-serif', borderBottom: '1px solid #F7F1EA' }}
                onMouseEnter={function(e) { e.currentTarget.style.background = '#FBF7F1' }}
                onMouseLeave={function(e) { e.currentTarget.style.background = '#fff' }}
              >
                {c}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AddTour() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [founderDraft, setFounderDraft] = useState(null)
  const [founderNumber, setFounderNumber] = useState('')
  const [guideId, setGuideId] = useState(null)
  const [guide, setGuide] = useState(null)
  const [whatsappNumber, setWhatsappNumber] = useState('')
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
  const [selectedPeriods, setSelectedPeriods] = useState([])
  const [images, setImages] = useState([])
  const [coverIndex, setCoverIndex] = useState(0)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')
const [guidePhoto, setGuidePhoto] = useState('')
const [uploadingGuidePhoto, setUploadingGuidePhoto] = useState(false)
const [guidePhotoError, setGuidePhotoError] = useState('')
  const [aiLoadingField, setAiLoadingField] = useState(null)
  const [aiError, setAiError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [meetingInput, setMeetingInput] = useState(null)

  const [form, setForm] = useState({
    title: '',
    teaser: '',
    story: '',
    guide_context: '',
    price: '',
    duration: '',
    cities: '',
    min_age: '1',
    max_age: '99',
    collab_code: '',
    pets_allowed: false,
    entrance_fee_included: false,
    entrance_fee_amount: '',
  })

  function isFounderMode() {
    return router.query.founder === 'true'
  }

  function readFounderDraft() {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      if (!savedDraft) return null
      return JSON.parse(savedDraft)
    } catch (err) {
      return null
    }
  }

  function saveFounderTourDraft(next) {
    try {
      const current = readFounderDraft() || {}
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(Object.assign({}, current, {
          tour: Object.assign({}, current.tour || {}, next)
        }))
      )
    } catch (err) {}
  }

  useEffect(function() {
    if (!router.isReady) return

    if (isFounderMode()) {
      const draft = readFounderDraft()

      if (!draft || !draft.founder || !draft.founder.name || !draft.founder.email || !draft.founder.phone || !draft.bioText) {
        router.push('/founders?reset=true')
        return
      }

      const tour = draft.tour || {}

      setFounderDraft(draft)
      setGuideId(null)
      setGuide({
        Guide_Name: draft.founder.name,
        Email: draft.founder.email,
        WhatsApp_Number: draft.founder.phone,
        Guide_bio: draft.bioText
      })

      setWhatsappNumber(tour.whatsapp_number || draft.founder.phone || '')

      setForm(function(prev) {
        return Object.assign({}, prev, {
          title: tour.title || '',
          teaser: tour.teaser || '',
          story: tour.story || '',
          guide_context: tour.guide_context || draft.bioText || '',
          price: tour.price || '',
          duration: tour.duration || '',
          cities: tour.cities || '',
          min_age: tour.min_age || '1',
          max_age: tour.max_age || '99',
          collab_code: tour.collab_code || '',
          pets_allowed: Boolean(tour.pets_allowed),
          entrance_fee_included: Boolean(tour.entrance_fee_included),
          entrance_fee_amount: tour.entrance_fee_amount || '',
        })
      })

      setTeaserCount((tour.teaser || '').length)
      setIsAbroad(Boolean(tour.is_abroad))
      setByAppointment(Boolean(tour.by_appointment))
      setSelectedDays(Array.isArray(tour.days) ? tour.days : [])
      setSelectedTimes(Array.isArray(tour.times) ? tour.times : [])
      setCheckedItems(Array.isArray(tour.checked_items) && tour.checked_items.length ? tour.checked_items : ["מים","כובע","קרם הגנה"])
      setExtraItems(Array.isArray(tour.extra_items) ? tour.extra_items : [])
      setMeetingPoint(tour.meeting_point || '')
      setMeetingLink(tour.meeting_link || '')
      setSelectedPeriods(Array.isArray(tour.historical_periods) ? tour.historical_periods : [])
      setImages(Array.isArray(tour.images) ? tour.images : [])
setGuidePhoto(tour.guide_photo || '')
      setCoverIndex(Number(tour.cover_index) || 0)

      return
    }

    function applyGuideData(data) {
      if (!data.found) {
        router.push('/join')
        return
      }

      setGuideId(data.airtable_id)
      setGuide(data.guide)
      setWhatsappNumber(data.guide.WhatsApp_Number || '')

      setForm(function(prev) {
        return Object.assign({}, prev, {
          guide_context: data.guide.Guide_bio || ''
        })
      })
    }

    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in?redirect_url=' + encodeURIComponent('/add-tour' + window.location.search))
      return
    }

    const email = user.emailAddresses?.[0]?.emailAddress || ''

    fetch('/api/get-guide?clerk_id=' + user.id + '&email=' + encodeURIComponent(email))
      .then(r => r.json())
      .then(applyGuideData)
  }, [router.isReady, isLoaded, user])

  useEffect(function() {
    if (!isFounderMode() || !founderDraft) return

    saveFounderTourDraft({
      title: form.title,
      teaser: form.teaser,
      story: form.story,
      guide_context: form.guide_context,
      price: form.price,
      duration: form.duration,
      cities: form.cities,
      min_age: form.min_age,
      max_age: form.max_age,
      collab_code: form.collab_code,
      pets_allowed: form.pets_allowed,
      entrance_fee_included: form.entrance_fee_included,
      entrance_fee_amount: form.entrance_fee_amount,
      whatsapp_number: whatsappNumber,
      is_abroad: isAbroad,
      by_appointment: byAppointment,
      days: selectedDays,
      times: selectedTimes,
      checked_items: checkedItems,
      extra_items: extraItems,
      meeting_point: meetingPoint,
      meeting_link: meetingLink,
      historical_periods: selectedPeriods,
     images,
cover_index: coverIndex,
guide_photo: guidePhoto
    })
  }, [form, whatsappNumber, isAbroad, byAppointment, selectedDays, selectedTimes, checkedItems, extraItems, meetingPoint, meetingLink, selectedPeriods, images, coverIndex, founderDraft])

  useEffect(function() {
    if (!meetingInput) return

    loadGoogleMaps().then(function() {
      var ac = new window.google.maps.places.Autocomplete(meetingInput, {
        language: 'he',
        componentRestrictions: { country: 'il' }
      })

      ac.addListener('place_changed', function() {
        var place = ac.getPlace()
        setMeetingPoint(place.formatted_address || '')
        setMeetingLink(place.url || 'https://maps.google.com/?q=' + encodeURIComponent(place.formatted_address || ''))
      })
    }).catch(function(err) {
      console.error('Google Maps load error:', err)
    })
  }, [meetingInput])

  const handleChange = function(e) {
    var val = e.target.type === 'checkbox' ? e.target.checked : e.target.value

    if (e.target.name === 'teaser') {
      if (e.target.value.length > 140) return
      setTeaserCount(e.target.value.length)
    }

    setForm(Object.assign({}, form, { [e.target.name]: val }))
  }

  const generateField = async function(field) {
    if (field === 'guide') return

    if (!form.title.trim()) {
      setAiError('יש להזין שם סיור לפני יצירת הטקסט')
      return
    }

    setAiError('')
    setAiLoadingField(field)

    try {
      const res = await fetch('/api/generate-tour-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          city: form.cities,
          guideName: guide?.Guide_Name || '',
          guideBio: guide?.Guide_bio || '',
          guideContext: form.guide_context || '',
          historicalPeriods: selectedPeriods,
          field
        })
      })

      const data = await res.json()

      if (data.error) {
        setAiError('לא הצלחנו ליצור טקסט. אפשר לנסות שוב.')
        setAiLoadingField(null)
        return
      }

      setForm(function(prev) {
        var update = {}

        if (data.teaser && (field === 'teaser' || field === 'all')) {
          update.teaser = data.teaser
          setTeaserCount(data.teaser.length)
        }

        if (data.story && (field === 'story' || field === 'all')) {
          update.story = data.story
        }

        return Object.assign({}, prev, update)
      })

      setShowToast(true)
      setTimeout(function() { setShowToast(false) }, 4000)
    } catch (err) {
      setAiError('לא הצלחנו ליצור טקסט. אפשר לנסות שוב.')
    }

    setAiLoadingField(null)
  }

  const handleGuidePhotoUpload = async function(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return

  setGuidePhotoError('')
  setUploadingGuidePhoto(true)

  await new Promise(function(resolve) {
    const reader = new FileReader()

    reader.onloadend = async function() {
      try {
        const res = await fetch('/api/upload-tour-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: reader.result })
        })

        const data = await res.json()

        if (data.url) {
          setGuidePhoto(data.url)
        } else {
          setGuidePhotoError('לא הצלחנו להעלות את התמונה')
        }
      } catch (err) {
        setGuidePhotoError('לא הצלחנו להעלות את התמונה')
      }

      resolve()
    }

    reader.readAsDataURL(file)
  })

  setUploadingGuidePhoto(false)
}

const handleImageUpload = async function(e) {
    var files = Array.from(e.target.files || [])

    if (!files.length) return

    if (images.length + files.length > 8) {
      files = files.slice(0, Math.max(0, 8 - images.length))
      setImageError('ניתן להעלות עד 8 תמונות')
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

            var d = await res.json()

            if (d.url) {
              setImages(function(prev) {
                return prev.concat({ url: d.url, public_id: d.public_id })
              })
            }
          } catch (err) {
            setImageError('חלק מהתמונות נכשלו')
          }

          resolve()
        }

        reader.readAsDataURL(files[i])
      })
    }

    setUploadingImage(false)
  }

  const removeImage = function(index) {
    setImages(function(prev) {
      return prev.filter(function(_, i) { return i !== index })
    })

    setCoverIndex(function(prev) {
      if (index === prev) return 0
      if (index < prev) return prev - 1
      return prev
    })
  }

  const toggleDay = function(day) {
    if (byAppointment) return

    setSelectedDays(function(prev) {
      return prev.includes(day) ? prev.filter(d => d !== day) : prev.concat(day)
    })
  }

  const toggleTime = function(time) {
    if (byAppointment) return

    setSelectedTimes(function(prev) {
      return prev.includes(time) ? prev.filter(t => t !== time) : prev.concat(time)
    })
  }

  const toggleItem = function(item) {
    setCheckedItems(function(prev) {
      return prev.includes(item) ? prev.filter(i => i !== item) : prev.concat(item)
    })
  }

  const togglePeriod = function(p) {
    setSelectedPeriods(function(prev) {
      if (prev.includes(p)) return prev.filter(x => x !== p)
      if (prev.length >= 4) return prev
      return prev.concat(p)
    })
  }

  const addCustomItem = function() {
    if (!customItem.trim()) return

    setExtraItems(function(prev) {
      return prev.concat(customItem.trim())
    })

    setCheckedItems(function(prev) {
      return prev.concat(customItem.trim())
    })

    setCustomItem('')
  }

  const handleSubmit = async function(e) {
    e.preventDefault()
    setLoading(true)
    setSubmitError('')

    try {
      var founderMode = isFounderMode()
      var currentDraft = founderMode ? readFounderDraft() : null

      if (founderMode) {
        if (!currentDraft || !currentDraft.founder || !currentDraft.bioText) {
          router.push('/founders?reset=true')
          return
        }

        if (onlyDigits(whatsappNumber, 10).length !== 10) {
          setSubmitError('יש להזין מספר וואטסאפ תקין')
          setLoading(false)
          return
        }
      }

      var allItems = DEFAULT_ITEMS.concat(extraItems).filter(function(i) {
        return checkedItems.includes(i)
      })

      var orderedUrls = []

      if (images.length > 0) {
        var ci = coverIndex >= 0 && coverIndex < images.length ? coverIndex : 0
        orderedUrls.push(images[ci].url)

        images.forEach(function(img, i) {
          if (i !== ci) orderedUrls.push(img.url)
        })
      }

      const res = await fetch('/api/add-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, form, {
          guide_id: guideId,
          guide_name: guide ? guide.Guide_Name : '',
          founder_data: founderMode ? {
            name: currentDraft.founder.name,
            email: currentDraft.founder.email,
            phone: currentDraft.founder.phone,
            bio: currentDraft.bioText
          } : null,
          is_abroad: isAbroad,
          by_appointment: byAppointment,
          days: byAppointment ? [] : selectedDays,
          times: byAppointment ? [] : selectedTimes,
          bring_items: allItems,
          meeting_point: meetingPoint,
          meeting_link: meetingLink,
          image_urls: orderedUrls,
          whatsapp_number: onlyDigits(whatsappNumber, 10),
          historical_periods: selectedPeriods,
          guide_context: form.guide_context,
          founder: founderMode,
guide_photo: guidePhoto,
          entrance_fee_included: form.entrance_fee_included,
          entrance_fee_amount: form.entrance_fee_included ? (Number(form.entrance_fee_amount) || 0) : 0,
        }))
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        if (data.error === 'founder_exists') {
          setFounderNumber(data.founder_number || '')
          setSaved(true)
          setLoading(false)
          try { localStorage.removeItem(DRAFT_KEY) } catch (err) {}
          return
        }

        setSubmitError('לא הצלחנו לשמור את הסיור. אפשר לנסות שוב.')
        setLoading(false)
        return
      }

      if (data.id || data.tour_id) {
        if (founderMode) {
          setFounderNumber(data.founder_number || '')
          try { localStorage.removeItem(DRAFT_KEY) } catch (err) {}
        }

        setSaved(true)
        setLoading(false)
        return
      }

      setSubmitError('לא הצלחנו לשמור את הסיור. אפשר לנסות שוב.')
      setLoading(false)
    } catch (err) {
      console.error(err)
      setSubmitError('לא הצלחנו לשמור את הסיור. אפשר לנסות שוב.')
      setLoading(false)
    }
  }

  function AIButton({ field, label }) {
    var isLoading = aiLoadingField === field

    return (
      <button
        type="button"
        onClick={function() { generateField(field) }}
        disabled={!!aiLoadingField}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FBF7F1', color: BROWN, border: '1px solid #EDE7DF', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: aiLoadingField ? 'not-allowed' : 'pointer', fontFamily: 'Heebo, Arial, sans-serif', opacity: aiLoadingField && !isLoading ? 0.5 : 1 }}
      >
        {isLoading ? <AITimelineAnim /> : '✨'}
        {isLoading ? 'כותב...' : label}
      </button>
    )
  }

  if (saved) {
    const founderMode = isFounderMode()

    if (founderMode) {
      return (
        <div dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', background: '#F7F1EA', minHeight: '100vh', overflowX: 'hidden' }}>
          <style>{`
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(18px); }
              to { opacity: 1; transform: translateY(0); }
            }

            .founder-complete-card {
              animation: fadeUp 500ms ease forwards;
            }

            @media (max-width: 768px) {
              .founder-hero {
                height: 250px !important;
              }

              .founder-complete-card {
                width: calc(100% - 28px) !important;
                margin-top: -88px !important;
                padding: 28px 20px 32px !important;
                border-radius: 24px !important;
              }

              .founder-layout {
                display: block !important;
              }

              .founder-timeline-side {
                display: none !important;
              }

              .founder-timeline-mobile {
                display: grid !important;
              }

              .founder-title {
                font-size: 28px !important;
              }

              .founder-illustration {
                width: 250px !important;
              }

              .founder-note {
                padding: 16px !important;
              }

              .founder-cta {
                width: 100% !important;
              }
            }
          `}</style>

          <div className="founder-hero" style={{ height: 360, width: '100%', position: 'relative', overflow: 'hidden' }}>
            <img src="/founder_hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(247,241,234,0) 45%, #F7F1EA 100%)' }} />
          </div>

          <main style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 80px' }}>
            <section className="founder-complete-card" style={{ width: '100%', maxWidth: 860, marginTop: -118, background: '#fff', borderRadius: 30, border: '1px solid #EDE7DF', boxShadow: '0 30px 80px rgba(0,0,0,0.13)', padding: 56, position: 'relative', zIndex: 2 }}>
              <div className="founder-layout" style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 40, alignItems: 'start' }}>
                <aside className="founder-timeline-side" style={{ borderLeft: '1px solid #EDE7DF', paddingLeft: 26, paddingTop: 22 }}>
                  {[
                    ['✓', 'הפרטים נשמרו'],
                    ['✓', 'הפרופיל נכתב'],
                    ['✓', 'הסיור הראשון נשמר'],
                    ['✦', 'הצטרפתם לדור הראשון']
                  ].map(function(item, i) {
                    const active = i === 3

                    return (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: active ? 34 : 30, height: active ? 34 : 30, borderRadius: '50%', background: active ? '#7E4821' : '#B97A45', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: active ? 15 : 13, boxShadow: active ? '0 8px 20px rgba(126,72,33,0.22)' : 'none' }}>
                            {item[0]}
                          </div>
                          {i < 3 && <div style={{ width: 2, height: 36, background: '#C8A582', opacity: 0.45 }} />}
                        </div>

                        <div style={{ fontSize: 13, color: '#7E4821', fontWeight: 700, lineHeight: 1.45, paddingTop: 5 }}>
                          {item[1]}
                        </div>
                      </div>
                    )
                  })}
                </aside>

                <div style={{ textAlign: 'center' }}>
                  <img src="/Logo-black.png" alt="מאז ועד היום" style={{ height: 62, width: 'auto', marginBottom: 20 }} onError={function(e) { e.target.style.display = 'none' }} />

                  {founderNumber && (
                    <p style={{ color: '#B97A45', fontSize: 13, fontWeight: 800, letterSpacing: '2px', margin: '0 0 14px' }}>
                      FOUNDER #{founderNumber}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 22 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8A582' }} />
                    <span style={{ width: 34, height: 1, background: '#C8A582' }} />
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8A582' }} />
                  </div>

                  <h1 className="founder-title" style={{ fontSize: 38, lineHeight: 1.25, fontWeight: 900, color: '#1A1A1A', margin: '0 0 24px', letterSpacing: '-0.5px' }}>
                    הסיפור הראשון שלכם נשמר.
                  </h1>

                  <p style={{ fontSize: 17, color: '#555', lineHeight: 1.9, margin: '0 0 4px' }}>
                    יום אחד יהיו כאן עוד מאות סיורים.
                  </p>

                  <p style={{ fontSize: 17, color: '#555', lineHeight: 1.9, margin: '0 0 24px' }}>
                    אבל הסיור שלכם יהיה חלק מהדור הראשון.
                  </p>

                  <p style={{ fontSize: 17, color: '#555', lineHeight: 1.9, margin: '0 0 30px' }}>
                    תודה שאתם עוזרים לנו לכתוב את הפרק הראשון של <span style={{ color: '#B97A45', fontWeight: 800 }}>מאז ועד היום</span>.
                  </p>

                  <div className="founder-timeline-mobile" style={{ display: 'none', gridTemplateColumns: '1fr', gap: 10, background: '#FBF7F1', border: '1px solid #EDE7DF', borderRadius: 16, padding: 16, marginBottom: 26, textAlign: 'right' }}>
                    {[
                      ['✓', 'הפרטים נשמרו'],
                      ['✓', 'הפרופיל נכתב'],
                      ['✓', 'הסיור הראשון נשמר'],
                      ['✦', 'הצטרפתם לדור הראשון']
                    ].map(function(item, i) {
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 26, height: 26, borderRadius: '50%', background: i === 3 ? '#7E4821' : '#B97A45', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                            {item[0]}
                          </span>
                          <span style={{ fontSize: 13, color: '#7E4821', fontWeight: 700 }}>
                            {item[1]}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <img className="founder-illustration" src="/founder_footer.png" alt="" style={{ width: 340, maxWidth: '100%', display: 'block', margin: '0 auto 28px', opacity: 0.94 }} onError={function(e) { e.target.style.display = 'none' }} />

                  <div className="founder-note" style={{ maxWidth: 560, margin: '0 auto 30px', background: '#FBF7F1', border: '1px solid #EDE7DF', borderRadius: 18, padding: '18px 24px', color: '#555', fontSize: 15, lineHeight: 1.8 }}>
                    לקראת ההשקה נשלח לכם מייל עם אישור הצטרפות לקהילת המייסדים. הגישה לחשבון האישי תיפתח רק כשנעבור להשקה מלאה.
                  </div>

                  <button className="founder-cta" onClick={function() { window.location.href = '/' }} style={{ background: '#B97A45', color: '#fff', height: 56, padding: '0 54px', borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif', boxShadow: '0 12px 28px rgba(185,122,69,0.25)' }}>
                    ניפגש בהשקה ✦
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      )
    }

    return (
      <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>
              הסיור שלכם באוויר.
            </h1>
            <button onClick={function() { router.push('/dashboard') }} style={{ background: '#111', color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif' }}>
              לדשבורד ←
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Heebo, Arial, sans-serif', background: CREAM, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isFounderMode() && <Header />}
      <SuccessToast show={showToast} />

      <main style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '40px 24px 64px', width: '100%' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: BROWN, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
            {isFounderMode() ? 'השלמת הצטרפות מייסדים' : 'הוספת סיור'}
          </p>
          <h1 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: '#1a1a1a', marginBottom: 6, letterSpacing: '-0.3px' }}>
            ספרו לנו על הסיור שלכם
          </h1>
          <p style={{ fontSize: 15, color: '#6B6B6B', lineHeight: 1.7 }}>
            פרטי הסיור שלכם יהיו חלק מהעמוד שלכם ויאפשרו למטיילים להבין איך יכולה להיראות החוויה שלהם.
          </p>
        </div>

        <TimelineDivider />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <SectionCard>
            <SectionLabel number="1" title="פרטי הסיור" subtitle="המידע הבסיסי שיעזור למטיילים להבין על מה מדובר." />

            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>שם הסיור</FieldLabel>
              <input type="text" name="title" value={form.title} onChange={handleChange} required style={inp} placeholder="למשל: עכו מתחת לפני השטח" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <FieldLabel required>מחיר למשתתף (מינימום 55 ₪)</FieldLabel>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min="55" style={inp} placeholder="90" />
              </div>

              <div>
                <FieldLabel required>משך הסיור (שעות)</FieldLabel>
                <input type="number" name="duration" value={form.duration} onChange={handleChange} required min="0.5" step="0.5" style={inp} placeholder="3" />
              </div>
            </div>

            <div style={{ marginBottom: 16, background: '#FBF7F1', borderRadius: 10, padding: '14px 16px', border: '1px solid #EDE7DF' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', color: '#2a2a2a', fontFamily: 'Heebo, Arial, sans-serif', marginBottom: form.entrance_fee_included ? 12 : 0 }}>
                <input type="checkbox" name="entrance_fee_included" checked={form.entrance_fee_included} onChange={handleChange} />
                הסיור כולל דמי כניסה לאתרים
              </label>

              {form.entrance_fee_included && (
                <div>
                  <FieldLabel hint="עלות דמי הכניסה הנוספת למשתתף בשקלים">עלות דמי כניסה למשתתף (₪)</FieldLabel>
                  <input type="number" name="entrance_fee_amount" value={form.entrance_fee_amount} onChange={handleChange} min="0" style={inp} placeholder="25" />
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>יישוב / אזור</FieldLabel>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#555', marginBottom: 10 }}>
                <input type="checkbox" checked={isAbroad} onChange={function(e) { setIsAbroad(e.target.checked); setForm(Object.assign({}, form, { cities: e.target.checked ? 'חו"ל' : '' })) }} />
                סיור בחו"ל
              </label>

              {isAbroad ? (
                <input type="text" value='חו"ל' disabled style={Object.assign({}, inp, { background: '#F7F1EA', color: '#999' })} />
              ) : (
                <CityAutocomplete value={form.cities} onChange={function(val) { setForm(Object.assign({}, form, { cities: val })) }} />
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel hint="בחרו עד 4 תקופות">תקופות היסטוריות</FieldLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {HISTORICAL_PERIODS.map(function(p) {
                  return <button key={p} type="button" onClick={function() { togglePeriod(p) }} style={chip(selectedPeriods.includes(p))}>{p}</button>
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <FieldLabel>גיל מינימום</FieldLabel>
                <select name="min_age" value={form.min_age} onChange={handleChange} style={inp}>
                  {Array.from({ length: 18 }, function(_, i) { return i + 1 }).map(function(n) {
                    return <option key={n} value={n}>{n}</option>
                  })}
                </select>
              </div>

              <div>
                <FieldLabel>גיל מקסימום</FieldLabel>
                <select name="max_age" value={form.max_age} onChange={handleChange} style={inp}>
                  {Array.from({ length: 81 }, function(_, i) { return i + 19 }).map(function(n) {
                    return <option key={n} value={n}>{n}</option>
                  })}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel required hint="מולא אוטומטית מהפרטים שלכם. אפשר לשנות אם רוצים מספר אחר לסיור הזה.">
                מספר וואטסאפ
              </FieldLabel>

              <div style={{ display: 'flex', direction: 'ltr', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={onlyDigits(whatsappNumber, 10).slice(0, 3)}
                  onChange={function(e) {
                    var digits = onlyDigits(whatsappNumber, 10)
                    var rest = digits.slice(3, 10)
                    var prefix = onlyDigits(e.target.value, 3)
                    setWhatsappNumber(prefix + rest)
                  }}
                  required
                  style={Object.assign({}, inp, { width: 92, textAlign: 'center', direction: 'ltr' })}
                  placeholder="050"
                  maxLength={3}
                />

                <span style={{ color: '#B97A45', fontWeight: 800 }}>-</span>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={onlyDigits(whatsappNumber, 10).slice(3, 10)}
                  onChange={function(e) {
                    var digits = onlyDigits(whatsappNumber, 10)
                    var prefix = digits.slice(0, 3)
                    var rest = onlyDigits(e.target.value, 7)
                    setWhatsappNumber(prefix + rest)
                  }}
                  required
                  style={Object.assign({}, inp, { width: 170, textAlign: 'center', direction: 'ltr' })}
                  placeholder="1234567"
                  maxLength={7}
                />
              </div>
            </div>

            <div>
              <FieldLabel hint="הקלידו כתובת, Google Maps יציע השלמות.">נקודת מפגש</FieldLabel>
              <input ref={setMeetingInput} type="text" value={meetingPoint} onChange={function(e) { setMeetingPoint(e.target.value) }} placeholder="הקלידו כתובת לחיפוש..." style={inp} />
              {meetingLink && (
                <a href={meetingLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: BROWN, fontWeight: 700 }}>
                  פתח ב-Google Maps ←
                </a>
              )}
            </div>
          </SectionCard>

          <TimelineDivider />

          <SectionCard>
            <SectionLabel number="2" title="הסיפור שתספרו" subtitle="בואו נוסיף כאן כמה מילים על החוויה שמצפה למי שמצטרף לסיור איתכם." />

            <div style={{ background: 'linear-gradient(135deg, #FBF7F1 0%, #F7F1EA 100%)', border: '1px solid #E8DDD0', borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, paddingTop: 2 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: BROWN }} />
                  <div style={{ width: 2, height: 16, background: BROWN, opacity: 0.3 }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: BROWN, opacity: 0.5 }} />
                  <div style={{ width: 2, height: 16, background: BROWN, opacity: 0.3 }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: BROWN }} />
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: BROWN, marginBottom: 6 }}>
                    ✨ עוזר הכתיבה של מאז ועד היום
                  </p>
                  <p style={{ fontSize: 13, color: '#444', lineHeight: 1.7, marginBottom: 6 }}>
                    כדי לחסוך לכם זמן ולעזור לכם להציג את הסיור בצורה טובה יותר, בנינו עוזר כתיבה מבוסס בינה מלאכותית. הוא לא נועד לכתוב במקומכם, אלא לתת לכם נקודת פתיחה טובה יותר.
                  </p>
                  <p style={{ fontSize: 11, color: '#888', lineHeight: 1.6, padding: '8px 10px', background: 'rgba(255,255,255,0.6)', borderRadius: 6, border: '1px solid #EDE7DF' }}>
                    לפני פרסום חשוב לוודא שכל העובדות נכונות. האחריות הסופית על הנכונות היא שלכם.
                  </p>
                </div>
              </div>
            </div>

            {aiError && (
              <p style={{ fontSize: 13, color: '#e00', marginBottom: 16, background: '#fff5f5', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca' }}>
                {aiError}
              </p>
            )}

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                <FieldLabel required>תיאור קצר</FieldLabel>
                <AIButton field="teaser" label="הציעו ניסוח" />
              </div>

              <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 8, lineHeight: 1.6 }}>
                המטרה היא לגרום למטייל לעצור ולהגיד: זה נשמע כמו משהו שנרצה לעשות. אל תנסו לספר כאן את כל הסיפור.
              </p>

              {aiLoadingField === 'teaser' ? <AILoadingAnimation /> : (
                <>
                  <input type="text" name="teaser" value={form.teaser} onChange={handleChange} required maxLength={140} style={inp} placeholder="פסקה קצרה שתגרום לאנשים לרצות לדעת עוד..." />
                  <p style={{ fontSize: 11, color: teaserCount > 120 ? '#e00' : '#B0A89E', marginTop: 4, textAlign: 'left' }}>
                    {teaserCount}/140
                  </p>
                </>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                <FieldLabel required>סיפור הסיור</FieldLabel>
                <AIButton field="story" label="כתבו עבורי טיוטה" />
              </div>

              <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 8, lineHeight: 1.6 }}>
                כאן מתחילה החוויה. אל תכתבו הרצאה היסטורית. כתבו כך שהמטייל ירגיש שיש משהו שהוא יפספס אם יגיע לבד.
              </p>

              {aiLoadingField === 'story' ? <AILoadingAnimation /> : (
                <textarea name="story" value={form.story} onChange={handleChange} required rows={6} style={Object.assign({}, inp, { resize: 'vertical', lineHeight: 1.8 })} placeholder="הסיפור שמסתתר מאחורי המקום..." />
              )}
            </div>

            <div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 16, alignItems: 'start' }}>
  <div>
    <FieldLabel>למה דווקא אתם מתאימים להוביל את הסיור הזה?</FieldLabel>

    <p style={{
      fontSize: 11,
      color: '#6B6B6B',
      marginBottom: 8,
      lineHeight: 1.5
    }}>
      הטקסט הזה נלקח מהפרופיל שכתבתם בתהליך ההצטרפות. אפשר לערוך אותו אם רוצים להתאים אותו דווקא לסיור הזה.
    </p>

    
  </div>

  <div>
    <FieldLabel>תמונת מדריך (אופציונלי)</FieldLabel>

    {guidePhoto ? (
      <div style={{
        position: 'relative',
        width: 140,
height: 140,
margin: '0 auto',
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid #EDE7DF'
      }}>
        <img
          src={guidePhoto}
          alt="Guide"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        <button
          type="button"
          onClick={() => setGuidePhoto('')}
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
    ) : (
    <label style={{
  width: 140,
  height: 140,
  borderRadius: 10,
  border: '1.5px dashed #EDE7DF',
  background: '#FBF7F1',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  margin: '0 auto'
}}>
        <input
          type="file"
          accept="image/*"
          onChange={handleGuidePhotoUpload}
          style={{ display: 'none' }}
        />

        <span style={{
          fontSize: 13,
          color: '#7E4821',
          fontWeight: 700
        }}>
          {uploadingGuidePhoto ? 'מעלה...' : 'העלאת תמונה'}
        </span>
      </label>
    )}

    {guidePhotoError && (
      <p style={{
        color: '#d00',
        fontSize: 12,
        marginTop: 8
      }}>
        {guidePhotoError}
      </p>
    )}
  </div>
</div>

             
            </div>
          </SectionCard>

          <TimelineDivider />

          <SectionCard>
            <SectionLabel number="3" title="תמונות הסיור" subtitle="תמונות טובות לא רק מציגות מקום, הן עוזרות לאנשים לדמיין את עצמם שם. העדיפו תמונות עם אור טבעי ואנשים שחווים את המקום. יש להעלות תמונות שאתם צילמתם או שיש לכם את הזכויות להשתמש בהן מטעם הצלם והמצולמים." />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {images.map(function(img, i) {
                return (
                  <div key={img.public_id || i} style={{ position: 'relative', width: 100, height: 100 }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, border: i === coverIndex ? '3px solid ' + BROWN : '1.5px solid #EDE7DF' }} />
                    <button type="button" onClick={function() { setCoverIndex(i) }} style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 9, background: i === coverIndex ? BROWN : '#fff', color: i === coverIndex ? '#fff' : '#555', border: '1px solid #ddd', borderRadius: 4, padding: '2px 5px', cursor: 'pointer', fontFamily: 'Heebo,Arial,sans-serif', fontWeight: 700 }}>
                      {i === coverIndex ? 'ראשית' : 'הפוך'}
                    </button>
                    <button type="button" onClick={function() { removeImage(i) }} style={{ position: 'absolute', top: 4, left: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 13, lineHeight: 1, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ×
                    </button>
                  </div>
                )
              })}

              {images.length < 8 && (
                <label style={{ width: 100, height: 100, borderRadius: 10, border: '2px dashed #EDE7DF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploadingImage ? 'not-allowed' : 'pointer', opacity: uploadingImage ? 0.6 : 1, background: '#FBF7F1', gap: 4 }}>
                  <span style={{ fontSize: 22, color: '#C0B8AE' }}>+</span>
                  <span style={{ fontSize: 11, color: '#B0A89E', fontFamily: 'Heebo,Arial,sans-serif' }}>
                    {uploadingImage ? 'מעלה...' : 'הוסף תמונה'}
                  </span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImage} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            {imageError && <p style={{ fontSize: 12, color: '#e00' }}>{imageError}</p>}
          </SectionCard>

          <TimelineDivider />

          <SectionCard>
            <SectionLabel number="4" title="זמינות" subtitle="זמינות מעודכנת מגדילה את הסיכוי שמטיילים יפנו אליכם. תוכלו לעדכן אותה בהמשך כשהמערכת תיפתח." />

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: 20, color: '#555', fontFamily: 'Heebo,Arial,sans-serif' }}>
              <input type="checkbox" checked={byAppointment} onChange={function(e) { setByAppointment(e.target.checked); if (e.target.checked) { setSelectedDays([]); setSelectedTimes([]) } }} />
              בתיאום מראש בלבד
            </label>

            <div style={{ marginBottom: 16, opacity: byAppointment ? 0.4 : 1 }}>
              <FieldLabel>ימים זמינים</FieldLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DAYS.map(function(day) {
                  return <button key={day} type="button" onClick={function() { toggleDay(day) }} disabled={byAppointment} style={chip(selectedDays.includes(day))}>{day}</button>
                })}
              </div>
            </div>

            <div style={{ opacity: byAppointment ? 0.4 : 1 }}>
              <FieldLabel>שעות</FieldLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                {TIMES.map(function(time) {
                  return <button key={time} type="button" onClick={function() { toggleTime(time) }} disabled={byAppointment} style={chip(selectedTimes.includes(time))}>{time}</button>
                })}
              </div>
            </div>
          </SectionCard>

          <TimelineDivider />

          <SectionCard>
            <SectionLabel number="5" title="מה להביא לסיור" subtitle="רשימה זו תופיע בעמוד הסיור ותעזור למטיילים להגיע מוכנים." />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {DEFAULT_ITEMS.concat(extraItems).map(function(item) {
                var sel = checkedItems.includes(item)

                return (
                  <button key={item} type="button" onClick={function() { toggleItem(item) }} style={{ padding: '7px 14px', borderRadius: 20, border: '1.5px solid', fontSize: 13, cursor: 'pointer', fontFamily: 'Heebo,Arial,sans-serif', fontWeight: 600, background: sel ? '#FBF7F1' : '#fff', color: sel ? BROWN : '#555', borderColor: sel ? BROWN : '#EDE7DF' }}>
                    {sel ? '✓ ' : ''}{item}
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" value={customItem} onChange={function(e) { setCustomItem(e.target.value) }} placeholder="הוסיפו פריט..." style={Object.assign({}, inp, { flex: 1 })} onKeyDown={function(e) { if (e.key === 'Enter') { e.preventDefault(); addCustomItem() } }} />
              <button type="button" onClick={addCustomItem} style={{ padding: '11px 18px', background: '#111', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Heebo,Arial,sans-serif' }}>
                הוסף
              </button>
            </div>
          </SectionCard>

          <TimelineDivider />

          <SectionCard>
            <SectionLabel number="6" title="פרטים נוספים" />

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: 20, color: '#555', fontFamily: 'Heebo,Arial,sans-serif' }}>
              <input type="checkbox" name="pets_allowed" checked={form.pets_allowed} onChange={handleChange} />
              מותר להביא חיות מחמד
            </label>

            {!isFounderMode() && (
              <div>
                <FieldLabel hint='קיבלתם קוד שת"פ מצוות מאז ועד היום? הזינו אותו כאן.'>קוד שת"פ MvH</FieldLabel>
                <input type="text" name="collab_code" value={form.collab_code} onChange={handleChange} style={inp} placeholder="הזינו קוד אם יש" />
              </div>
            )}
          </SectionCard>

          <TimelineDivider />

          <div style={{ textAlign: 'center' }}>
            {submitError && (
              <p style={{ fontSize: 13, color: '#e00', background: '#fff5f5', padding: '10px 14px', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 16 }}>
                {submitError}
              </p>
            )}

            <button type="submit" disabled={loading} style={{ background: loading ? '#888' : '#111', color: '#fff', padding: '15px 48px', borderRadius: 12, fontSize: 16, fontWeight: 800, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Heebo,Arial,sans-serif', boxShadow: loading ? 'none' : '0 8px 24px rgba(0,0,0,0.15)' }}>
              {loading ? 'שומר...' : isFounderMode() ? 'שמרו והשלימו הצטרפות ←' : 'פרסמו את הסיור ←'}
            </button>

            <p style={{ fontSize: 12, color: '#B0A89E', marginTop: 12 }}>
              {isFounderMode() ? 'רק אחרי השמירה תקבלו מספר Founder ותצטרפו רשמית לדור הראשון.' : 'לאחר הפרסום תוכלו לערוך את הסיור בכל עת מהדשבורד.'}
            </p>
          </div>
        </form>
      </main>

      {!isFounderMode() && <Footer />}
    </div>
  )
}
