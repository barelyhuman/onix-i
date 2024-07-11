import { PROVIDERS } from '@/lib/constants'
import { getDatabaseConnector } from '@/lib/utils/db-injector'
import nonceGenerator from '@/lib/utils/nonce-generator'
import { Response, UnhandledErrorResponse } from '@/lib/utils/response'
import axios from 'axios'
import querystring from 'querystring'

const controller = {
  name: 'SlackController',
}

controller.login = async ({ req, res }) => {
  let trx
  try {
    const db = getDatabaseConnector()()

    const slackUserId = req.body.user_id

    const nonce = await nonceGenerator()

    const integrationExists = await db('integrations')
      .where({
        'provider_user_id': slackUserId,
        'integrations.is_active': true,
        'provider': PROVIDERS.SLACK,
      })
      .leftJoin('users', 'users.id', 'integrations.internal_user_id')
      .select(
        'integrations.id as integrationId',
        'integrations.nonce_expiry',
        'integrations.nonce',
        'users.id as userId',
        'users.email as userEmail'
      )

    trx = await db.transaction()

    let integrationDetails
    if (
      !integrationExists ||
      (integrationExists && !integrationExists.length)
    ) {
      const insertPayload = {
        provider: PROVIDERS.SLACK,
        nonce,
        provider_user_id: slackUserId,
      }

      insertPayload.nonce_expiry = new Date(
        new Date().setMinutes(new Date().getMinutes() + 60 * 5)
      )

      integrationDetails = await trx('integrations')
        .insert(insertPayload)
        .returning(['id', 'provider_user_id', 'internal_user_id', 'nonce'])
      integrationDetails = integrationDetails[0]
    } else {
      const updatePayload = {
        nonce,
      }

      updatePayload.nonce_expiry = new Date(
        new Date().setMinutes(new Date().getMinutes() + 60 * 5)
      )

      integrationDetails = await trx('integrations')
        .where({
          id: integrationExists[0].integrationId,
        })
        .update(updatePayload)
        .returning(['id', 'provider_user_id', 'internal_user_id', 'nonce'])

      integrationDetails = integrationDetails[0]
    }

    await trx.commit()

    const nonceCheckLink = `${process.env.ORIGIN_URL}/dashboard/integrations/${integrationDetails.nonce}`

    return Response(
      200,
      {
        response_type: 'ephermal',
        text: `
      To Connect Slack to your TillWhen account, please click on the link below
      ${nonceCheckLink}
      `,
      },
      res
    )
  } catch (err) {
    trx && (await trx.rollback())
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.acceptOAuth = async ({ req, res }) => {
  let trx
  try {
    const { currentUser } = req
    const payload = req.body
    trx = await req.db.transaction()

    const tokenArgs = querystring.stringify({
      code: payload.code,
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      redirect_uri: `${process.env.ORIGIN_URL}/dashboard/integrations/oauth/slack`,
    })

    console.log(
      `redirect_url:${process.env.ORIGIN_URL}/dashboard/integrations/oauth/slack`
    )

    const slackAccessTokens = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      tokenArgs
    )

    console.log(slackAccessTokens.data)

    if (!slackAccessTokens.data.ok)
      return Response(400, { error: 'Invalid Request' }, res)

    const botToken = slackAccessTokens.data.access_token
    const providerUserId = slackAccessTokens.data.authed_user.id

    await trx('integrations').insert({
      internal_user_id: currentUser.id,
      bot_token: botToken,
      provider: PROVIDERS.SLACK,
      provider_user_id: providerUserId,
    })

    await trx.commit()

    return Response(200, { data: { ok: true, message: 'Authorized.' } }, res)
  } catch (err) {
    trx && (await trx.rollback())
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.generateState = async ({ req, res }) => {
  let trx
  try {
    const { currentUser } = req.id
    const payload = req.body
    trx = await req.db.transaction()
    currentUser
  } catch (err) {
    trx && (await trx.rollback())
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.createLog = async ({ req, res }) => {
  let trx
  try {
  } catch (err) {}
}

export default controller;
