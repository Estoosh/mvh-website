export default async function handler(req, res) {
  return res.status(200).json({
    method: req.method,
    body: req.body,
    record_id: req.body?.record_id,
    bio: req.body?.bio,
    bioLength: req.body?.bio?.length || 0
  })
}
