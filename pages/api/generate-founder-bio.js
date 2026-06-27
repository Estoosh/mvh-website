export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profileInput } = req.body
  const input = typeof profileInput === 'string' ? profileInput.trim() : ''

  if (!input) {
    return res.status(400).json({ error: 'profile_input_required' })
  }

  const isUrl = /^https?:\/\//i.test(input)
  const wordCount = input.split(/\s+/).filter(Boolean).length
  const isNameOnly = !isUrl && wordCount <= 4 && input.length <= 50

  if (isUrl) {
    return res.status(200).json({
      bio:
        'לא הצלחנו לקרוא את האתר באופן אוטומטי. הדביקו כאן כמה משפטים מתוך האתר, פוסט או פרופיל מקצועי, ונציע לכם טיוטה אישית יותר.'
    })
  }

  if (isNameOnly) {
    return res.status(200).json({
      bio:
        `${input} מצטרף לדור הראשון של מאז ועד היום. כדי להפוך את הפרופיל לאישי יותר, כדאי להוסיף משפט אחד על המקום, התקופה או סוג הסיפורים שאתם הכי אוהבים לספר.`
    })
  }

  return generateBioFromText(input, res)
}

async function generateBioFromText(profileText, res) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'missing_gemini_api_key' })
  }

  const prompt = `
אתה כותב טיוטת פרופיל למורה דרך באתר "מאז ועד היום".

הטקסט היחיד שמותר לך להשתמש בו הוא הטקסט הבא שהמשתמש כתב או הדביק:

${profileText}

המשימה:
כתוב Bio קצר, אנושי ומדויק, שיעזור למטייל להבין איזה סוג מספר סיפורים האדם הזה.

הכללים:
- השתמש רק במידע שמופיע בטקסט.
- אל תמציא ניסיון, תארים, מקומות, התמחות או הישגים.
- אל תכתוב קורות חיים.
- אל תכתוב טקסט שיווקי גנרי.
- אל תכתוב כאילו אתה מכיר את האדם מעבר לטקסט שניתן.
- כתוב בעברית טבעית, בגובה העיניים.
- 2 פסקאות קצרות.
- 220 עד 350 תווים.
- מקסימום 400 תווים.

אסור להשתמש בביטויים:
בעל ניסיון רב
חוויה בלתי נשכחת
מסע מרתק
חיבור אנושי
מומחה בתחומו
מורה דרך מוסמך
לוקח אתכם למסע
גשר בין עבר להווה

מבחן איכות:
אם אפשר להחליף את שם האדם בשם של מדריך אחר והטקסט עדיין עובד, כתוב מחדש.

אם הטקסט דל מדי, כתוב טיוטה צנועה שמבוססת רק עליו, ובסוף הוסף בקשה קצרה להוסיף עוד משפט אישי.

החזר JSON בלבד:
{"bio":"..."}
`

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
      console.error('[generate-founder-bio] Gemini error:', errText)
      return res.status(502).json({ error: 'gemini_request_failed' })
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleaned = rawText.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch (err) {
      return res.status(200).json({ bio: cleaned.slice(0, 400) })
    }

    return res.status(200).json({
      bio: String(parsed.bio || '').slice(0, 400)
    })
  } catch (err) {
    console.error('[generate-founder-bio] internal error:', err)
    return res.status(500).json({ error: 'internal_error' })
  }
}
