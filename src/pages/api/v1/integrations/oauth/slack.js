import { SlackController } from '@/controllers'

import { initialRequestHandler } from '@/lib/utils/initialRequestHandler'
import { UnhandledErrorResponse } from '@/lib/utils/response'

const handler = async (req, res) => {
  try {
    if (req.method.toLowerCase() !== 'post') return res.status(400).end()

    await initialRequestHandler({ req, res, auth: true })
    return SlackController.acceptOAuth({ req, res })
  } catch (err) {
    return UnhandledErrorResponse(res)
  }
}

export default handler
