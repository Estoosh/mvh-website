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

  // אם זה טקסט ארוך — שולחים ישירות ל-Gemini בלי search
  if (!isUrl && !isShortText) {
    return generateFromText(cleanInput, res)
  }

  // אם זה URL או שם קצר — מריצים web search דרך Anthropic API
  const searchQuery = isUrl ? cleanInput : cleanInput + ' מורה דרך'

  try {
    const searchRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `חפש מידע על "${searchQuery}" וסכם בעברית מה אתה יודע על האדם הזה כמורה דרך. אם לא מצאת מידע רלוונטי, אמור זאת במפורש.`
        }]
      })
    })

    const searchData = await searchRes.json()
    console.log('[generate-founder-bio] search response type:', searchData?.content?.map(c => c.type))

    const textBlocks = (searchData?.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n')
    console.log('[generate-founder-bio] search summary:', textBlocks.slice(0, 300))

    const contextToUse = textBlocks.length > 50 ? textBlocks : cleanInput
    return generateFromText(contextToUse, res)

  } catch(err) {
    console.error('[generate-founder-bio] search error:', err.message)
    return generateFromText(cleanInput, res)
  }
}

async function generateFromText(contextText, res) {
  const apiKey = process.env.GEMINI_API_KEY

  const prompt = `
אתה כותב טיוטת Bio למורה דרך באתר "מאז ועד היום".

מידע על המדריך:
${contextText}

כללים:
- השתמש רק במידע שמופיע לעיל.
- אל תמציא פרטים, תפקידים, הישגים או ניסיון.
- אל תכתוב ביוגרפיה גנרית.
- המטרה: לעזור למטייל להבין איזה סוג מספר סיפורים האדם הזה, ומה יגרום לו לרצות לצאת איתו.
- אם המידע דל, כתוב טיוטה צנועה ובסוף הצע: "רוצים שנדייק? הוסיפו משפט אחד על מה שאתם אוהבים לספר."

כתוב 2 פסקאות קצרות.
220 עד 350 תווים סה"כ.
מקסימום 400 תווים.

אסור להשתמש בביטויים:
בעל ניסיון רב, חוויה בלתי נשכחת, מסע מרתק, חיבור אנושי, מומחה בתחומו, מורה דרך מוסמך, לוקח אתכם למסע.

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
    console.log('[generate-founder-bio] gemini raw:', rawText.slice(0, 200))

    const cleaned = rawText.replace(/```json|```/g, '').trim()
    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch(e) {
      return res.status(200).json({ bio: cleaned.slice(0, 400) })
    }

    return res.status(200).json({ bio: (parsed.bio || '').slice(0, 400) })
  } catch(err) {
    console.error('[generate-founder-bio] gemini error:', err.message)
    return res.status(500).json({ error: 'internal_error' })
  }
}
