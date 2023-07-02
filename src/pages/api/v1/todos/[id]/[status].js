import { TodosController } from '@/controllers'

import { initialRequestHandler } from '@/lib/utils/initialRequestHandler'

const handler = async (req, res) => {
  try {
    await initialRequestHandler({ req, res, auth: true })
    if (req.method === 'POST') return TodosController.updateTaskStatus(req, res)

    return res.status(404).end()
  } catch (err) {
    console.error(err)
    res.status(500).send({ error: 'Oops! Something went wrong!' })
  }
}

export default handler
