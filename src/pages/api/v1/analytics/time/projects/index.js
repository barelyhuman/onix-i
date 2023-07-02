import { AnalyticsController } from '@/controllers'
import { initialRequestHandler } from '@/lib/utils/initialRequestHandler'

const handler = async (req, res) => {
  try {
    await initialRequestHandler({ req, res, auth: true })
    if (req.method === 'GET') {
      const response =
        await AnalyticsController.fetchProjectBasedTotalTimeSpent(req, res)
      res.send({ data: response })
    } else return res.status(404).end()
  } catch (err) {
    console.error(err)
    return res.status(500).send({ error: 'Oops! Something went wrong!' })
  }
}

export default handler
