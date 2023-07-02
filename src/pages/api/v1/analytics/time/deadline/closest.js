import { AnalyticsController } from '@/controllers'

import { initialRequestHandler } from '@/lib/utils/initialRequestHandler'

const handler = async (req, res) => {
  try {
    await initialRequestHandler({ req, res, auth: true })
    if (req.method === 'GET') {
      await handleByQueryType(req, res)
      return
    } else {
      return res.status(404).end()
    }
  } catch (err) {
    return res.status(500).send({ error: 'Oops! Something went wrong!' })
  }
}

async function handleByQueryType(req, res) {
  switch (req.query.type) {
    case 'projects': {
      return await AnalyticsController.getClosestProjectDeadline(req, res)
    }
  }
}

export default handler
