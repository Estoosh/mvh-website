export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profileInput } = req.body

  console.log('[generate-founder-bio] profileInput received:', profileInput)

  if (!profileInput || !profileInput.trim()) {
    return res.status(400).json({ error: 'profile_input_required' })
  }

  const cleanInput = profileInput.trim()
  const apiKey = process.env.GEMINI_API_KEY

  const prompt = `
אתה כותב טיוטת פרופיל למורה דרך באתר "מאז ועד היום".

חשוב מאוד:
הטקסט היחיד שמותר לך להשתמש בו הוא הטקסט הבא שהמשתמש כתב בשדה הנוכחי.
אסור להשתמש בשם המשתמש.
אסור להשתמש במידע משדות קודמים.
אסור להשלים פרטים שלא מופיעים בטקסט.
אסור להניח מי האדם.

טקסט המשתמש:
${cleanInput}

כתוב בעברית טבעית, קצרה ואנושית.
לא קורות חיים.
לא רשימת תפקידים.
לא שיווק גנרי.
המטרה היא לעזור למטייל להבין איזה סוג מספר סיפורים האדם הזה.

אם אין מספיק מידע, כתוב טיוטה צנועה שמבוססת רק על מה שיש, בלי להמציא.

החזר JSON בלבד, ללא markdown:
{"bio":"..."}
`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    )

    const data = await response.json()
    const rawText = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim()
    console.log('[generate-founder-bio] gemini raw:', rawText)

    const cleaned = rawText.replace(/```json|```/g, '').trim()
    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch(e) {
      console.error('[generate-founder-bio] parse error:', cleaned)
      return res.status(200).json({ bio: cleaned.slice(0, 400) })
    }

    return res.status(200).json({ bio: (parsed.bio || '').slice(0, 400) })
  } catch(err) {
    console.error('[generate-founder-bio] error:', err.message)
    return res.status(500).json({ error: 'internal_error' })
  }
}
