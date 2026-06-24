import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { data } = req.body
  if (!data) return res.status(400).json({ error: 'No file data' })
  try {
    const result = await cloudinary.uploader.upload(data, {
      folder: 'mvh-certificates',
      resource_type: 'auto',
      unique_filename: true,
    })
    return res.status(200).json({ url: result.secure_url })
  } catch(e) {
    console.error('Cloudinary error:', e)
    return res.status(500).json({ error: 'Upload failed' })
  }
}
