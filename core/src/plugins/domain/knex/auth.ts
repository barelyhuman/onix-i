import { Knex } from 'knex'
import { curry, takeFirst } from '~/lib/array.js'
import { randomToken } from '~/lib/crypto.js'
import { normalizeEmail } from '~/lib/email.js'
import { Maybe } from '~/types.js'

export const isExistingUser = curry(async (db: Knex, email: string) => {
  const user = await db('users')
    .where({
      email: normalizeEmail(email),
    })
    .select('id')
    .first()
  return Boolean(user)
})

export const createRegistrationToken = curry(
  async (db: Knex, userId: number, tokenName: string) => {
    const tokenPair = {
      public: randomToken(),
      private: randomToken(),
    }
    const userDetails = await db('users')
      .where({
        id: userId,
      })
      .first()

    const recordToInsert = {
      token: tokenPair.public,
      token_pair: tokenPair.private,
      token_name: tokenName,
      email: normalizeEmail(userDetails.email),
    }

    const savedToken = await db('tokens').insert(recordToInsert, [
      'token',
      'token_pair',
      'email',
    ])

    return takeFirst(savedToken)
  }
)

export const isTokenVerified = curry(
  async (db: Knex, email: string, publicToken: string) => {
    const tokenDetails: { isVerified: boolean } = await db('tokens')
      .where({
        email: normalizeEmail(email),
        token: publicToken,
      })
      .select('is_verified as isVerified')
      .first()

    if (!tokenDetails) {
      throw new Error('Invalid Token')
    }

    return tokenDetails?.isVerified ?? false
  }
)

export const acceptUserToken = curry(
  async (db: Knex, email: string, privateToken: string) => {
    const token: Maybe<{ isVerified: boolean }> = await db('tokens')
      .where({
        email: normalizeEmail(email),
        token_pair: privateToken,
      })
      .select('is_verified as isVerified')
      .first()

    if (!token) throw new Error('Invalid Token')
    if (token.isVerified) throw new Error('Token expired, please try again')

    await db('tokens')
      .where({
        email: normalizeEmail(email),
        token_pair: privateToken,
      })
      .update('is_verified', true)

    return true
  }
)
