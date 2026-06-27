export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { profileInput } = req.body

  if (!profileInput || !profileInput.trim()) {
    return res.status(400).json({ error: 'profile_input_required' })
  }

  const cleanInput = profileInput.trim()
  const isUrl = cleanInput.startsWith('http')
  const isShortText = cleanInput.split(' ').length <= 4
  const needsSearch = isUrl || isShortText

  const searchQuery = isUrl
    ? 'מורה דרך ' + cleanInput
    : cleanInput + ' מורה דרך'

  const userMessage = needsSearch
    ? `חפש מידע על "${searchQuery}" וכתב טיוטת פרופיל קצרה למורה דרך באתר "מאז ועד היום". השתמש רק במידע שמצאת. אל תמציא פרטים. אם לא מצאת מידע, כתוב טיוטה צנועה ובקש מהמשתמש להוסיף משפט אישי.`
    : `כתוב טיוטת פרופיל קצרה למורה דרך באתר "מאז ועד היום" על בסיס הטקסט הבא בלבד:\n${cleanInput}\n\nאל תמציא פרטים שלא מופיעים בטקסט.`

  const systemPrompt = `אתה כותב טיוטות פרופיל למורי דרך באתר "מאז ועד היום".

כללים:
- כתוב בעברית טבעית ואנושית
- 2 פסקאות קצרות, 220-350 תווים סה"כ, מקסימום 400
- המטרה: לעזור למטייל להבין איזה סוג מספר סיפורים האדם הזה
- אל תמציא פרטים
- אסור: בעל ניסיון רב, חוויה בלתי נשכחת, מסע מרתק, חיבור אנושי, מומחה בתחומו, מורה דרך מוסמך

החזר JSON בלבד: {"bio":"..."}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        tools: needsSearch ? [{ type: 'web_search_20250305', name: 'web_search' }] : undefined,
        messages: [{ role: 'user', content: userMessage }]
      })
    })

    const data = await response.json()
    console.log('[generate-founder-bio] response content types:', data?.content?.map(c => c.type))

    const textBlocks = (data?.content || [])
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n')

    console.log('[generate-founder-bio] text output:', textBlocks.slice(0, 300))

    const cleaned = textBlocks.replace(/```json|```/g, '').trim()
    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch(e) {
      return res.status(200).json({ bio: cleaned.slice(0, 400) })
    }

    return res.status(200).json({ bio: (parsed.bio || '').slice(0, 400) })
  } catch(err) {
    console.error('[generate-founder-bio] error:', err.message)
    return res.status(500).json({ error: 'internal_error' })
  }
}
