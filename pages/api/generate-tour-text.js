export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { title, city, guideName, historicalPeriods } = req.body

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title required' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  const context = [
    city ? `אזור או עיר: ${city}` : '',
    guideName ? `שם המדריך: ${guideName}` : '',
    Array.isArray(historicalPeriods) && historicalPeriods.length > 0 ? `תקופות רלוונטיות: ${historicalPeriods.join(', ')}` : ''
  ].filter(Boolean).join('\n')

  const prompt = `
אתה כותב תוכן לעמוד סיור באתר "מאז ועד היום".

הפלייבוק של המותג:
מאז ועד היום לא מוכר סיורים.
הוא עוזר לאנשים לצאת מהבית ולחיות חיים שיש בהם יותר סיפורים.
הסיור הוא האמצעי.
מורה הדרך הוא סטוריטלר.
המשתמש לא מחפש הרצאה היסטורית. הוא מחפש סיבה טובה להגיד לבן או בת הזוג: "בואי נעשה את זה בשבת".

המטרה שלך:
לכתוב טקסט שמייצר סקרנות, אמון והקלה.
לא טקסט שיווקי.
לא טקסט של אתר תיירות.
לא טקסט של מוזיאון.
לא תוכנית שיעור.
לא רשימת תחנות.
לא סיסמאות.

כתוב בעברית טבעית, בגובה העיניים, עם עומק אבל בלי להיות כבד.

כותרת הסיור:
${title}

${context}

החזר JSON בלבד, בלי markdown ובלי טקסט נוסף.

השדות:

1. teaser
עד 120 תווים.
זה הטקסט שמופיע באזור "למה לצאת דווקא לשם".
המטרה: לגרום למטייל להבין למה החוויה הזו שווה יציאה מהבית.
לא לסכם את הסיור.
לא לכתוב "סיור מרתק".
לא להזכיר מחיר, שעות, נקודת מפגש או לוגיסטיקה.
כתוב משפט או שניים קצרים שמייצרים סקרנות ותחושת ערך.

2. story
עד 1200 תווים.
זה הטקסט שמופיע באזור "הסיפור של הסיור".
המטרה: לעזור למטייל לדמיין את החוויה.
כתוב 3 עד 5 פסקאות קצרות.
הטקסט צריך להסביר למה המקום הזה שווה חוויה מודרכת ולא רק ביקור עצמאי.
הטקסט צריך להראות שיש רובד שאפשר לפספס אם מגיעים לבד.
הטקסט צריך לרמוז שהמדריך יודע להפוך את המקום לסיפור חי.
אל תכתוב "דמיינו לעצמכם" כברירת מחדל.
אל תפתח בצורה דרמטית מדי.
אל תמציא עובדות היסטוריות שאתה לא בטוח בהן.
אם חסר מידע, כתוב בצורה כללית אבל עדיין מעניינת.
אל תכתוב תחנות, לוחות זמנים, מחירים או הוראות לוגיסטיות.

3. guide
עד 500 תווים.
זה הטקסט שמופיע באזור "מי יוביל אתכם".
המטרה: לבנות אמון במדריך.
כתוב למה מדריך כזה חשוב לחוויה הזו.
אל תכתוב קורות חיים.
אל תכתוב "בעל ניסיון רב".
אל תכתוב טקסט גנרי.
הדגש שמורה דרך טוב יודע לקחת אחריות על החוויה, לבחור מה חשוב, להסביר מה רואים, ולחבר את המקום לסיפור שאנשים ייקחו איתם הביתה.
אם שם המדריך קיים, אפשר להשתמש בו בטבעיות.
אם אין מספיק מידע על המדריך, כתוב טקסט כללי שמתאים לעמוד בלי להמציא פרטים אישיים.

מבנה התשובה:
{"teaser":"...","story":"...","guide":"..."}
`

  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      )

      if (!response.ok) {
        const errText = await response.text()
        console.error(`Gemini API error attempt ${attempt}:`, errText)

        const isRetryable = response.status === 503 || response.status === 429

        if (isRetryable && attempt < maxAttempts) {
          await new Promise(function(resolve) {
            setTimeout(resolve, attempt * 1000)
          })
          continue
        }

        return res.status(502).json({ error: 'gemini_request_failed' })
      }

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const cleaned = rawText.replace(/```json|```/g, '').trim()

      let parsed

      try {
        parsed = JSON.parse(cleaned)
      } catch (e) {
        console.error('Failed to parse Gemini response:', cleaned)
        return res.status(502).json({ error: 'gemini_parse_failed' })
      }

      const teaser = (parsed.teaser || '').slice(0, 120)
      const story = (parsed.story || '').slice(0, 1200)
      const guide = (parsed.guide || '').slice(0, 500)

      return res.status(200).json({ teaser, story, guide })
    } catch (err) {
      console.error(`generate-tour-text error attempt ${attempt}:`, err)

      if (attempt === maxAttempts) {
        return res.status(500).json({ error: 'internal_error' })
      }

      await new Promise(function(resolve) {
        setTimeout(resolve, attempt * 1000)
      })
    }
  }
}
