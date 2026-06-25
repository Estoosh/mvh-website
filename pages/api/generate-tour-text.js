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

הפלייבוק:
מאז ועד היום לא מוכר סיורים.
הוא עוזר לאנשים לצאת מהבית ולחיות חיים שיש בהם יותר סיפורים.
הסיור הוא האמצעי.
מורה הדרך הוא סטוריטלר.
המשתמש לא מחפש הרצאה היסטורית. הוא מחפש סיבה טובה להגיד למישהו: "בוא נעשה את זה."

כתוב בעברית טבעית, בגובה העיניים, עם עומק אבל בלי כובד.
כתוב Mobile First.
פסקאות קצרות.
בלי קירות טקסט.
בלי שפה אקדמית.
בלי קלישאות שיווקיות.
בלי "חוויה ייחודית", "מסע מרתק", "סיור בלתי נשכח", "בעל ניסיון רב".

כותרת הסיור:
${title}

${context}

החזר JSON בלבד, בלי markdown ובלי טקסט נוסף.

השדות:

1. teaser
90 עד 140 תווים.
מקסימום 3 שורות במובייל.
זה הטקסט של "למה לצאת דווקא לשם".
המטרה היא לגרום למטייל לעצור ולהרגיש שזה שווה יציאה מהבית.
לא לסכם את הסיור.
לא להזכיר מחיר, שעות, נקודת מפגש או לוגיסטיקה.
כתוב משפט אחד או שניים קצרים שמייצרים סקרנות ותחושת ערך.

2. story
700 עד 950 תווים.
מקסימום 1100 תווים.
3 עד 5 פסקאות קצרות.
זה הטקסט של "הסיפור של הסיור".
המטרה היא לגרום למטייל לדמיין את עצמו שם ולהבין שיש משהו שהוא עלול לפספס אם יגיע לבד.
הטקסט צריך להראות שמורה דרך טוב יודע לראות דברים שרוב האנשים חולפים לידם.
אל תכתוב מסלול תחנות.
אל תכתוב תוכנית שיעור.
אל תכתוב מחירים, נקודת מפגש או זמנים.
אל תפתח תמיד ב"דמיינו לעצמכם".
אל תמציא עובדות היסטוריות שאינך בטוח בהן.
אם חסר מידע, כתוב באופן כללי אבל עדיין מעניין.

3. guide
220 עד 350 תווים.
מקסימום 400 תווים.
2 פסקאות קצרות.
זה הטקסט של "מי יוביל אתכם".
המטרה היא לבנות אמון במדריך.
אל תכתוב קורות חיים.
אל תכתוב רשימת תפקידים.
אל תמציא הישגים.
אם שם המדריך קיים, אפשר להשתמש בו בטבעיות.
הדגש שמורה דרך טוב יודע לקחת אחריות על החוויה, לבחור מה חשוב, להסביר מה רואים, ולחבר את המקום לסיפור שאנשים ייקחו איתם הביתה.

כל משפט צריך לעזור לענות על שאלה אחת:
"למה שארצה לצאת מהבית בשביל זה?"

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

      const teaser = (parsed.teaser || '').slice(0, 140)
      const story = (parsed.story || '').slice(0, 1100)
      const guide = (parsed.guide || '').slice(0, 400)

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
