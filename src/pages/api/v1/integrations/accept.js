import { AuthController } from '@/controllers'

import { initialRequestHandler } from '@/lib/utils/initialRequestHandler'

const handler = async (req, res) => {
  if (req.method.toLowerCase() !== 'get') return res.status(404).send()

  await initialRequestHandler({ req, res, auth: true })
  return await AuthController.acceptIntegration({ req, res })
}

export default handler
