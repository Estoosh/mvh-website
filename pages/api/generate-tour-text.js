export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { title } = req.body
  if (!title || !title.trim()) return res.status(400).json({ error: 'title required' })

  const apiKey = process.env.GEMINI_API_KEY
  const prompt = `אתה כותב תוכן שיווקי לאתר סיורים תיירותיים בישראל בשם MvH (מאז ועד היום). בהינתן כותרת סיור, כתוב שני דברים בעברית בלבד:
1. תיאור קצר (teaser) - עד 80 תווים, מסקרן ומזמין, בלי מירכאות.
2. תיאור מפורט (story) - עד 1200 תווים, מספר את הסיפור וההיסטוריה שמסתתרת מאחורי הסיור, בסטייל סיפורי-עיתונאי, בלי מירכאות.

כותרת הסיור: "${title}"

החזר תשובה בפורמט JSON בלבד, בלי טקסט נוסף לפניו או אחריו, בלי markdown code fences, במבנה הזה:
{"teaser": "...", "story": "..."}`

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
        console.error(`Gemini API error (attempt ${attempt}):`, errText)

        const isRetryable = response.status === 503 || response.status === 429
        if (isRetryable && attempt < maxAttempts) {
          await new Promise(function(r) { setTimeout(r, attempt * 1000) })
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

      const teaser = (parsed.teaser || '').slice(0, 80)
      const story = (parsed.story || '').slice(0, 1200)

      return res.status(200).json({ teaser, story })
    } catch (err) {
      console.error(`generate-tour-text error (attempt ${attempt}):`, err)
      if (attempt === maxAttempts) {
        return res.status(500).json({ error: 'internal_error' })
      }
      await new Promise(function(r) { setTimeout(r, attempt * 1000) })
    }
  }
}
