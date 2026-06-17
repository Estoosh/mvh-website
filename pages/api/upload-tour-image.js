export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { image_base64 } = req.body
  if (!image_base64) return res.status(400).json({ error: 'image_base64 required' })

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    const timestamp = Math.floor(Date.now() / 1000)
    const paramsToSign = `timestamp=${timestamp}`

    const crypto = await import('crypto')
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex')

    const formData = new URLSearchParams()
    formData.append('file', image_base64)
    formData.append('timestamp', String(timestamp))
    formData.append('api_key', apiKey)
    formData.append('signature', signature)

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    )

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      console.error('Cloudinary upload error:', errText)
      return res.status(502).json({ error: 'upload_failed' })
    }

    const data = await uploadRes.json()

    // Build a compressed delivery URL: auto format + auto quality + max width 1600px
    var optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1600,c_limit/')

    return res.status(200).json({ url: optimizedUrl, public_id: data.public_id })
  } catch (err) {
    console.error('upload-tour-image error:', err)
    return res.status(500).json({ error: 'internal_error' })
  }
}
