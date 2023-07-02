import { options } from '@/lib/constants'

export default (req, res) => {
  if (req.method !== 'GET') {
    res.status(404)
    return res.end()
  }

  return res.json({
    options,
  })
}
