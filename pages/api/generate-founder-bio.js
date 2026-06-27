export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profileInput } = req.body
  const input = typeof profileInput === 'string' ? profileInput.trim() : ''

  if (!input) {
    return res.status(400).json({ error: 'profile_input_required' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'missing_gemini_api_key' })
  }

  const isUrl = /^https?:\/\//i.test(input)
  const wordCount = input.split(/\s+/).filter(Boolean).length
  const isShortInput = wordCount <= 5 && input.length <= 80

  const searchInstruction = isUrl
    ? `חפש מידע ציבורי על מורה הדרך או האדם שמופיע באתר הזה: ${input}`
    : isShortInput
      ? `חפש מידע ציבורי על "${input} מורה דרך" וגם על "${input}".`
      : `השתמש בטקסט הבא כמידע שהמשתמש סיפק. אם חסר מידע, אפשר להיעזר בחיפוש ציבורי לפי שמות או פרטים שמופיעים בו:\n${input}`

  const prompt = `
אתה כותב טיוטתאתה כותב טיוטת פרופיל למורה דרך באתר "מאז ועד היום".

הטיוטה חייבת להיות כתובה בגוף ראשון בלבד.
השתמש ב: אני, אצלי, בעיניי, בסיורים שלי, בסיפורים שלי.
אסור לכתוב בגוף שלישי.
אסור לכתוב: "הוא...", "היא...", "[שם] הוא מורה דרך שמתמחה ב..."

דוגמה לטון הנכון:
"אני ארכיאולוג שמבלה כבר עשרות שנים בין שכבות האבן של הגליל. בסיורים שלי הארכיאולוגיה היא נקודת פתיחה — משם אנחנו ממשיכים אל האנשים, האמונות והסיפורים שהשאירו סימנים בשטח."

המטרה:
הטיוטה צריכה להרגיש כאילו המדריך מציג את עצמו למישהו שמחליט אם לבלות איתו כמה שעות.
לא קורות חיים.
לא שיווק.
לא כתבה עיתונאית.

אורך: 500 עד 700 תווים. מקסימום 800 תווים.

אסור להשתמש בביטויים:
בעל ניסיון רב, חוויה בלתי נשכחת, מסע מרתק, חיבור אנושי, מומחה בתחומו, מורה דרך מוסמך, לוקח אתכם למסע, גשר בין עבר להווה.

השתמש רק במידע שמצאת או שסופק.
אל תמציא פרטים.

החזר JSON בלבד, בלי markdown:
{"bio":"..."}
`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          tools: [
            {
              google_search: {}
            }
          ]
        })
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('[generate-founder-bio] Gemini grounded error:', errText)
      return res.status(502).json({ error: 'gemini_grounded_request_failed' })
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleaned = rawText.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch (err) {
      console.error('[generate-founder-bio] JSON parse failed:', cleaned)
      return res.status(200).json({
        bio: cleaned.slice(0, 400),
        grounded: Boolean(data?.candidates?.[0]?.groundingMetadata),
        grounding: data?.candidates?.[0]?.groundingMetadata || null
      })
    }

    return res.status(200).json({
      bio: String(parsed.bio || '').slice(0, 400),
      grounded: Boolean(data?.candidates?.[0]?.groundingMetadata),
      grounding: data?.candidates?.[0]?.groundingMetadata || null
    })
  } catch (err) {
    console.error('[generate-founder-bio] internal error:', err)
    return res.status(500).json({ error: 'internal_error' })
  }
}
