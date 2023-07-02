import { TasksController } from '@/controllers'

import { initialRequestHandler } from '@/lib/utils/initialRequestHandler'

const handler = async (req, res) => {
  try {
    await initialRequestHandler({ req, res, auth: true })
    if (req.method === 'GET')
      return await TasksController.fetchTaskById(req, res)

    if (req.method === 'POST') return await TasksController.editTask(req, res)

    if (req.method === 'DELETE')
      return await TasksController.deleteTask(req, res)

    return res.status(404).end()
  } catch (err) {
    return res.status(500).send({ error: 'Oops! Something went wrong!' })
  }
}

export default handler
