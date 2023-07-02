import { IntegrationController } from '@/controllers'

import { initialRequestHandler } from '@/lib/utils/initialRequestHandler'

const handler = async (req, res) => {
  if (req.method.toLowerCase() !== 'delete') return res.status(404).send()

  await initialRequestHandler({ req, res, auth: true })
  return IntegrationController.revokeIntegration({ req, res })
}

export default handler
