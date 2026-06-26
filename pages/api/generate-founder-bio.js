export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  console.log('[generate-founder-bio] body:', req.body)

  const { name, profileInput } = req.body

  console.log('[generate-founder-bio] input received:', {
    name,
    profileInput,
    profileInputLength: profileInput?.length,
    profileInputPreview: profileInput?.slice(0, 200),
  })

  if (!profileInput?.trim()) {
    console.warn('[generate-founder-bio] profileInput is empty or missing')
    return res.status(400).json({ error: 'missing_input' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  const prompt = `
אתה לא כותב קורות חיים.
אתה לא כותב דף אודות.
אתה מנסה להבין מה גורם לאנשים לבחור לצאת מהבית דווקא עם האדם הזה.

שם המדריך: ${name || 'לא ידוע'}

טקסט שהמדריך סיפק על עצמו:
${profileInput.trim()}

המטרה: לייצר טיוטת פרופיל שתעזור למטייל להבין:
- איזה סוג סיפורים האדם הזה אוהב לספר
- איזה סוג חוויה הוא יוצר
- מה הופך את נקודת המבט שלו לשונה

חובה:
- עברית טבעית
- שתי פסקאות קצרות
- בין 220 ל-350 תווים
- לא יותר מ-400 תווים

אסור להשתמש בביטויים:
בעל ניסיון רב, שנים רבות בתחום, מומחה ל, מרצה ומדריך, חיבור אנושי, חוויה בלתי נשכחת, מסע בזמן, לוקח אתכם למסע.

אם הקלט קצר מדי או כללי מדי, אל תמציא עובדות. כתוב טיוטה צנועה שמבוססת רק על מה שנאמר, ובקש מהמשתמש להוסיף עוד פרטים כדי לדייק.

אל תמציא עובדות, תפקידים, הישגים או ניסיון שלא מופיעים בטקסט שסופק.
החזר את הטקסט בלבד, ללא הסברים וללא JSON.
`

  console.log('[generate-founder-bio] prompt input length:', profileInput.trim().length)

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
    const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim()

    console.log('[generate-founder-bio] gemini response length:', text.length)
    console.log('[generate-founder-bio] gemini response preview:', text.slice(0, 200))

    return res.status(200).json({ bio: text.slice(0, 400) })
  } catch(err) {
    console.error('[generate-founder-bio] error:', err.message)
    return res.status(500).json({ error: 'internal_error' })
  }
}
