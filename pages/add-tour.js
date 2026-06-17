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
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [images, setImages] = useState([])
  const [coverIndex, setCoverIndex] = useState(0)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')
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
