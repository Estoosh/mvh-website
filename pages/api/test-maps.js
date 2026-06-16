export default function handler(req, res) {
  res.status(200).json({ 
    key_exists: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    key_preview: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 10) : 'missing'
  })
}
