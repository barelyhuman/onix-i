import { AuthController } from '@/controllers'

import { initialRequestHandler } from '@/lib/utils/initialRequestHandler'

const handler = async (req, res) => {
  try {
    await initialRequestHandler({ req, res })
    if (req.method === 'GET') return AuthController.accept(req, res)

    return res.status(404).end()
  } catch (err) {
    res.status(500).send({ error: 'Oops! Something went wrong!' })
  }
}

export default handler
