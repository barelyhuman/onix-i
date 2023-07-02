import { Response, UnhandledErrorResponse } from '@/lib/utils/response'

const controller = {
  name: 'IntegrationController',
}

controller.fetchIntegrations = async ({ req, res }) => {
  try {
    const { currentUser } = req
    const db = req.db

    console.log(currentUser.id)

    const integrationDetails = await db('integrations')
      .where({
        is_active: true,
        internal_user_id: currentUser.id,
      })
      .select('provider', 'is_active')

    const integrationMapping = integrationDetails.reduce((acc, item) => {
      acc[item.provider] = item.is_active
      return acc
    }, {})

    return Response(200, { data: integrationMapping }, res)
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.revokeIntegration = async ({ req, res }) => {
  try {
    const { currentUser } = req
    const payload = req.query
    const db = req.db

    const revoked = await db('integrations')
      .where({
        provider: payload.provider,
        internal_user_id: currentUser.id,
      })
      .update('is_active', false)
      .returning(['id'])

    return Response(200, { data: { count: revoked.length } }, res)
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

export default controller
