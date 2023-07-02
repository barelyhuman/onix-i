import { ProjectsController } from '@/controllers'

import { initialRequestHandler } from '@/lib/utils/initialRequestHandler'

const handler = async (req, res) => {
  try {
    await initialRequestHandler({ req, res, auth: true })
    if (req.method === 'GET')
      return ProjectsController.fetchProjectUsers(req, res)

    if (req.method === 'POST')
      return ProjectsController.addUsersToProject(req, res)

    return res.status(404).end()
  } catch (err) {
    res.status(500).send({ error: 'Oops! Something went wrong!' })
  }
}

export default handler
