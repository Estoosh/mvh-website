export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, publicInput } = req.body
  if (!publicInput?.trim()) return res.status(400).json({ error: 'missing_input' })

  const apiKey = process.env.GEMINI_API_KEY
  let contextContent = publicInput.trim()

  // אם זה URL — ננסה לשלוף את התוכן
  const isUrl = publicInput.trim().startsWith('http')
  if (isUrl) {
    try {
      const pageRes = await fetch(publicInput.trim(), {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'he,en' },
        signal: AbortSignal.timeout(6000)
      })
      const html = await pageRes.text()
      // מנקים HTML ושומרים רק טקסט
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000)
      if (text.length > 100) contextContent = text
    } catch(err) {
      // אם הfetch נכשל — נמשיך עם ה-URL עצמו
      contextContent = publicInput.trim()
    }
  }

  const prompt = `
אתה לא כותב קורות חיים.
אתה לא כותב דף אודות.
אתה מנסה להבין מה גורם לאנשים לבחור לצאת מהבית דווקא עם האדם הזה.

שם המדריך: ${name || 'לא ידוע'}

מידע ציבורי שנמצא עבור המדריך:
${contextContent}

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

אם המידע שסופק לא מספיק כדי להסיק מה מייחד את האדם הזה, החזר בדיוק:
NOT_ENOUGH_PUBLIC_INFORMATION

אל תמציא עובדות, תפקידים, הישגים או ניסיון שלא מופיעים במידע שסופק.
החזר את הטקסט בלבד, ללא הסברים וללא JSON.
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
    const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim()

    if (text === 'NOT_ENOUGH_PUBLIC_INFORMATION') {
      return res.status(200).json({ bio: null, not_enough: true })
    }

    return res.status(200).json({ bio: text.slice(0, 400) })
  } catch(err) {
    return res.status(500).json({ error: 'internal_error' })
  }
}
