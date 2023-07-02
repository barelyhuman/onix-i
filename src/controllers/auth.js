import { config } from '@/lib/config.mjs'
import { FACTORS } from '@/lib/constants'
import { generateTOTPSecret, generateTOTPURL, isValid } from '@/lib/totp'
import emailService from '@/lib/utils/email'
import isDev from '@/lib/utils/is-dev'
import randomToken from '@/lib/utils/random-token.js'
import { Response, UnhandledErrorResponse } from '@/lib/utils/response.js'
import SlackBot from '@/lib/utils/slack-bot'
import jwtGenerator from '@/lib/utils/token-generator'
import { serialize } from 'cookie'
import ms from 'ms'

const controller = {
  name: 'AuthController',
}

controller.register = async (req, res) => {
  const trx = await req.db.transaction()
  try {
    const payload = req.body

    if (!payload.tokenName || !payload.email)
      return Response(400, { error: 'Email and TokenName are required' }, res)

    const existingUser = await trx('users')
      .where({
        email: payload.email.toLowerCase().trim(),
      })
      .first()

    const token = randomToken()
    const tokenSecret = randomToken()
    const recordToInsert = {
      token,
      token_pair: tokenSecret,
      token_name: payload.tokenName,
      email: payload.email.toLowerCase().trim(),
    }

    const savedToken = await trx('tokens').insert(recordToInsert, [
      'token',
      'token_pair',
      'email',
    ])

    const verificationLink = `${config.originUrl}/confirm?email=${savedToken[0].email}&token=${savedToken[0].token_pair}`

    emailService.sendLoginVerification(
      savedToken[0].email,
      verificationLink,
      savedToken[0].token_pair
    )

    await trx.commit()

    return Response(
      200,
      {
        data: {
          token: savedToken[0].token,
        },
      },
      res
    )
  } catch (err) {
    console.error(err)
    return Response(err.code, err.message, res)
  }
}

controller.verify = async (req, res) => {
  let trx
  try {
    const payload = req.query

    if (!payload.email || !payload.token)
      return Response(400, { error: 'Bad Request' }, res)

    const tokens = await req
      .db('tokens')
      .where({
        email: payload.email.toLowerCase().trim(),
        token: payload.token,
      })
      .select('is_verified as isVerified')

    if (!tokens.length) return Response(400, { error: 'Invalid Token' }, res)

    const verified = tokens[0].isVerified || false

    if (verified) {
      let userDetails = await req.db('users').where({
        email: payload.email.toLowerCase().trim(),
      })

      if (!userDetails.length) {
        trx = await req.db.transaction()
        userDetails = await trx('users').insert(
          {
            email: payload.email.toLowerCase().trim(),
          },
          ['id', 'email']
        )

        await trx.commit()
      }

      const token = await jwtGenerator({
        ...userDetails[0],
      })

      const authFactor = await req
        .db('user_auth_factor')
        .where({
          factor_type: FACTORS.totp,
          user_id: userDetails[0].id,
        })
        .select(['id'])
        .first()

      if (authFactor) {
        const tokenDetails = await createTOTPVerifierToken(
          req.db,
          userDetails[0].email
        )
        return Response(
          200,
          {
            data: {
              verified: true,
              token: tokenDetails.token,
              auth: {
                secondary: true,
              },
            },
          },
          res
        )
      }

      res.setHeader(
        'Set-Cookie',
        serialize('auth', token, {
          expires: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          secure: !isDev(),
          path: '/',
          sameSite: 'lax',
        })
      )

      return Response(
        200,
        {
          data: {
            verified,
            token,
          },
        },
        res
      )
    }

    return Response(
      200,
      {
        data: {
          verified,
        },
      },
      res
    )
  } catch (err) {
    console.error(err)
    trx && (await trx.rollback())
    return Response(500, err.message, res)
  }
}

controller.accept = async (req, res) => {
  let trx
  try {
    const payload = req.query

    if (!payload.email || !payload.token)
      return Response(400, { error: 'Bad Request' }, res)

    const tokens = await req
      .db('tokens')
      .where({
        email: payload.email.toLowerCase().trim(),
        token_pair: payload.token,
      })
      .select('is_verified as isVerified')

    if (!tokens.length) return Response(400, { error: 'Invalid Token' }, res)

    const verified = tokens[0].isVerified || false

    if (verified) {
      return Response(
        400,
        {
          error: 'The token is no more valid, Please request for a new one',
        },
        res
      )
    }

    trx = await req.db.transaction()

    await trx('tokens')
      .where({
        email: payload.email.toLowerCase().trim(),
        token_pair: payload.token,
      })
      .update('is_verified', true)

    await trx.commit()

    return Response(
      200,
      {
        data: {
          verified: true,
        },
      },
      res
    )
  } catch (err) {
    trx && (await trx.rollback())
    console.error(err)
  }
}

controller.acceptIntegration = async ({ req, res }) => {
  let trx
  try {
    const { currentUser } = req
    const { nonce } = req.query

    if (!nonce.length)
      return Response(400, { error: 'Invalid Integration Request' }, res)

    trx = await req.db.transaction()

    const integrationDetails = await trx('integrations')
      .where({
        nonce,
        is_active: true,
      })
      .where('nonce_expiry', '>', new Date())
      .select('integrations.id', 'integrations.internal_user_id')

    if (!(integrationDetails && integrationDetails.length)) {
      await trx.rollback()
      console.log('fail')
      return Response(400, { error: 'Error Connecting to account' }, res)
    }

    if (
      integrationDetails[0].internal_user_id &&
      integrationDetails[0].internal_user_id !== currentUser.id
    ) {
      await trx.rollback()
      console.log('fail 2')
      return Response(400, { message: 'Error Connecting to account' }, res)
    }

    const integrationPayload = {
      internal_user_id: currentUser.id,
      nonce: null,
      nonce_expiry: null,
    }

    const updatedDetails = await trx('integrations')
      .where({ id: integrationDetails[0].id })
      .update(integrationPayload)
      .returning(['integrations.id', 'integrations.provider_user_id'])

    const userDetailsWRTIntegrations = await trx('integrations')
      .where({ 'integrations.id': integrationDetails[0].id })
      .leftJoin('users', 'users.id', 'integrations.internal_user_id')
      .select(['users.email as userEmail'])

    await trx.commit()

    /**
     * TODO:
     * Send DM on Slack from TillWhen that the connection was made.
     **/

    SlackBot.sendMessage(
      updatedDetails[0].provider_user_id,
      `Connected to Account: ${userDetailsWRTIntegrations[0].userEmail}`
    )

    return Response(
      200,
      {
        data: {
          id: updatedDetails[0].id,
        },
      },
      res
    )
  } catch (err) {
    trx && (await trx.rollback())
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.getTOTPSecret = async (req, res) => {
  try {
    const { currentUser } = req

    const userDetail = await req
      .db('users')
      .where({
        id: currentUser.id,
      })
      .select(['email'])
      .first()

    const secret = generateTOTPSecret()

    return Response(
      200,
      {
        url: generateTOTPURL(secret, {
          company: 'tillwhen',
          email: userDetail.email,
        }),
        secret,
      },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.enableTOTP = async (req, res) => {
  try {
    const { secret, otp } = req.body

    if (!isValid(secret, otp)) {
      return Response(
        400,
        {
          error: 'Invalid OTP, cannot valid',
        },
        res
      )
    }

    const generatedCodes = Array.from({ length: 5 }).map(x => randomToken())

    const payload = {
      factor_type: FACTORS.totp,
      secret: secret,
      meta: {
        recovery: generatedCodes,
      },
      user_id: req.currentUser.id,
    }

    await req.db('user_auth_factor').insert(payload).returning(['id'])

    return Response(
      200,
      { message: 'Enabled TOTP', recoveryCodes: generatedCodes },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.disableTOTP = async (req, res) => {
  try {
    const { otp } = req.body

    const authFactorDetails = await req
      .db('user_auth_factor')
      .where({
        user_id: req.currentUser.id,
      })
      .select(['secret'])
      .first()

    if (!authFactorDetails) {
      return Response(
        400,
        {
          error: 'Invalid OTP, cannot validate',
        },
        res
      )
    }

    if (!isValid(authFactorDetails.secret, otp)) {
      return Response(
        400,
        {
          error: 'Invalid OTP, cannot validate',
        },
        res
      )
    }

    await req
      .db('user_auth_factor')
      .where({
        user_id: req.currentUser.id,
        factor_type: FACTORS.totp,
      })
      .del()

    return Response(200, { message: 'Disabled TOTP' }, res)
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.validateTOTP = async (req, res) => {
  try {
    const { otp, token } = req.body
    let user = req.currentUser

    if (token) {
      user = await req
        .db('tokens')
        .where({
          'token': token,
          '2fa_token': true,
        })
        .clone()
        .leftJoin('users', 'users.email', 'tokens.email')
        .select([
          'users.id',
          'users.email',
          'tokens.id as token_id',
          'tokens.is_verified as is_verified',
          'users.auth_attempts',
          'users.last_auth_attempt',
        ])
        .first()

      if (user.is_verified) {
        return Response(
          400,
          {
            error: "Token already verified, can't use the same token twice.",
          },
          res
        )
      }

      const validAttemptPeriod =
        new Date().getTime() - new Date(user.last_auth_attempt).getTime() >
        ms('1m')

      if (user.auth_attempts > 5 && !validAttemptPeriod) {
        return Response(
          429,
          {
            error:
              'Too Many auth attempts, please wait for 2 mins before continuing',
          },
          res
        )
      }

      await req
        .db('users')
        .where({
          id: user.id,
        })
        .update({
          last_auth_attempt: new Date(),
        })
        .increment('auth_attempts', 1)
    }

    const userDetails = await req
      .db('user_auth_factor')
      .where({
        user_id: user.id,
        factor_type: FACTORS.totp,
      })
      .select(['id', 'secret', 'meta'])
      .first()

    if (!userDetails) {
      return Response(400, { error: 'No 2FA Enabled, Invalid Request' }, res)
    }

    const isRecoveryCode = userDetails.meta.recovery.includes(otp)

    if (!isValid(userDetails.secret, otp) && !isRecoveryCode) {
      return Response(400, { error: 'Invalid OTP Request' }, res)
    }

    if (isRecoveryCode) {
      await req
        .db('user_auth_factor')
        .where({
          user_id: user.id,
          factor_type: FACTORS.totp,
        })
        .del()
    }

    if (token) {
      await req
        .db('tokens')
        .update({
          is_verified: true,
        })
        .where({
          id: user.token_id,
        })

      await req
        .db('users')
        .update({
          last_auth_attempt: undefined,
          auth_attempts: 0,
        })
        .where({
          id: user.id,
        })

      const token = await jwtGenerator({
        ...user,
      })

      res.setHeader(
        'Set-Cookie',
        serialize('auth', token, {
          expires: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          secure: !isDev(),
          path: '/',
          sameSite: 'lax',
        })
      )
    }

    return Response(200, { valid: true }, res)
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.isTOTPEnabledFunc = async (db, userId) => {
  const authFactorDetails = await db('user_auth_factor')
    .where({
      user_id: userId,
      factor_type: FACTORS.totp,
    })
    .select(['id'])
    .first()
  return Boolean(authFactorDetails)
}

controller.totpGuardHashFunc = async (db, userId, hash) => {
  const authGuardHashes = await db('user_auth_factor')
    .where({
      'user_id': userId,
      'factor_type': FACTORS.totp,
      'user_auth_hashes.hash': hash,
    })
    .leftJoin(
      'user_auth_hashes',
      'user_auth_hashes.auth_factor_id',
      'user_auth_factor.id'
    )
    .select(['user_auth_hashes.id', 'user_auth_hashes.is_verified'])
    .first()

  return authGuardHashes || false
}

controller.createTOTPRequestHashFunc = async (db, userId) => {
  let trx
  try {
    trx = await db.transaction()
    const userFactorDetails = await trx('user_auth_factor')
      .where({
        user_id: userId,
      })
      .select(['id'])
      .first()

    if (!userFactorDetails) {
      return false
    }

    const inserted = await trx('user_auth_hashes')
      .insert({
        auth_factor_id: userFactorDetails.id,
        hash: randomToken(),
      })
      .returning(['id', 'hash'])

    await trx.commit()

    return inserted
  } catch (err) {
    trx && (await trx.rollback())
    throw err
  }
}

controller.acceptTOTPRequestHashFunc = async (db, hash) => {
  let trx

  if (!hash) {
    throw new Error('hash is a required argument')
  }

  try {
    trx = await db.transaction()
    const bQuery = trx('user_auth_hashes').where({
      hash,
    })

    const hashDetails = await bQuery.clone().select(['is_verified']).first()

    if (!hashDetails) {
      throw new Error('Invalid hash')
    }

    if (hashDetails.is_verified) {
      throw new Error(
        'TOTP request already verified, cannot use same request hash again'
      )
    }

    const inserted = await bQuery
      .clone()
      .update({
        is_verified: true,
      })
      .returning(['id'])

    await trx.commit()

    return inserted
  } catch (err) {
    trx && (await trx.rollback())
    throw err
  }
}

controller.isTOTPEnabled = async (req, res) => {
  try {
    const { currentUser } = req

    return Response(
      200,
      { enabled: await controller.isTOTPEnabledFunc(req.db, currentUser.id) },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.validateWithRecovery = async (req, res) => {
  try {
    const { recoveryCode } = req.body
    let user = req.currentUser

    const authFactorDetails = await req
      .db('user_auth_factor')
      .where({
        user_id: user.id,
      })
      .select(['id'])
      .first()

    if (!authFactorDetails) {
      return Response(
        400,
        {
          error: 'Cannot validate recovery request',
        },
        res
      )
    }

    if (!authFactorDetails.meta.recover.includes(recoveryCode)) {
      return Response(
        400,
        {
          error: 'Invalid recovery code, please try again',
        },
        res
      )
    }

    const token = await jwtGenerator({
      ...user,
    })

    res.setHeader(
      'Set-Cookie',
      serialize('auth', token, {
        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        secure: !isDev(),
        path: '/',
        sameSite: 'lax',
      })
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

async function createTOTPVerifierToken(db, email) {
  var error, payload, tokenData, tokenPair, trx
  try {
    trx = await db.transaction()
    tokenPair = [randomToken(), randomToken()]
    payload = {
      'token_name': '2FA | TOTP | Verifier',
      'token_pair': tokenPair[0],
      'token': tokenPair[1],
      '2fa_token': true,
      'email': email,
    }
    tokenData = await trx('tokens')
      .insert(payload)
      .returning(['id', 'token_pair', 'token'])
    await trx.commit()
    return tokenData[0]
  } catch (error1) {
    error = error1
    trx && (await trx.rollback())
    throw error
  }
}

export default controller
