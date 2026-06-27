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
אתה כותב טיוטת Bio קצרה למורה דרך באתר "מאז ועד היום".

המשימה שלך:
לבדוק מידע ציבורי זמין, להבין איזה סוג מספר סיפורים האדם הזה, ולכתוב טיוטה קצרה לפרופיל מדריך.

שאילתת עבודה:
${searchInstruction}

כללים חשובים:
- אל תכתוב ביוגרפיה כללית.
- אל תכתוב קורות חיים.
- אל תמציא פרטים שלא מצאת או שלא נמסרו.
- אל תציג עובדה אם אינך בטוח בה.
- אם מצאת מידע ציבורי, השתמש בו כדי לזהות זווית אישית: ארכיאולוגיה, עיר מסוימת, סגנון הדרכה, מחקר, סיפורי מקום, משפחות, ילדים, אוכל, דתות, היסטוריה עירונית או כל מאפיין ברור אחר.
- אם לא מצאת מידע מספיק, כתוב טיוטה זמנית צנועה וציין שכדאי להוסיף עוד משפט אישי כדי לדייק.

הטון:
עברית טבעית.
חם.
מדויק.
לא שיווקי.
לא גנרי.
לא מתנשא.

אסור להשתמש בביטויים:
בעל ניסיון רב
חוויה בלתי נשכחת
מסע מרתק
חיבור אנושי
מומחה בתחומו
מורה דרך מוסמך
לוקח אתכם למסע
גשר בין עבר להווה

אורך:
2 פסקאות קצרות.
220 עד 350 תווים.
מקסימום 400 תווים.

מבחן איכות:
אם אפשר להחליף את שם האדם בשם של מדריך אחר והטקסט עדיין עובד, נכשלת. כתוב מחדש.

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
