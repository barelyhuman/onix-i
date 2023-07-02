import { AuthController } from '@/controllers'

import { initialRequestHandler } from '@/lib/utils/initialRequestHandler'

const handler = async (req, res) => {
  try {
    await initialRequestHandler({ req, res, auth: false })
    if (req.method === 'POST') await AuthController.register(req, res)
    else return res.status(404).end()
  } catch (err) {
    console.error(err)
    return res.status(500).send({ error: 'Oops! Something went wrong!' })
  }
}

export default handler
