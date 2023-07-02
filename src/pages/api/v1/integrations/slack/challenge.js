export default async (req, res) => {
  if (req.method.toLowerCase() !== 'post') return res.status(404).send()

  return res.send(req.body.challenge)
}
