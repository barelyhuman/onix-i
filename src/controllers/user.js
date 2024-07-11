import { Response, UnhandledErrorResponse } from '@/lib/utils/response.js'
import { db } from '@/lib/db'
import { invariant } from '@/lib/invariant'
import { nestie } from 'nestie'

const controller = {
  name: 'UserController',
}


controller.fetchUser = async (req, res) => {
  try {
    const { currentUser } = req
    if (!currentUser) return

    const data = await req
      .db('users')
      .leftJoin('profiles as profile', 'users.id', 'profile.user_id')
      .where('users.id', currentUser.id)
      .select(
        'profile.name as profileName',
        'profile.id as profileId',
        'users.id ',
        'users.email'
      )
    return Response(200, data[0], res)
  } catch (err) {
    console.error(err)
    return Response(
      500,
      {
        error: 'Oops! Something went wrong',
        message: String(err),
      },
      res
    )
  }
}

controller.createProfile = async (req, res) => {
  let trx
  try {
    trx = await req.db.transaction()
    const { currentUser } = req
    const payload = req.body

    const record = {
      name: payload.name,
      user_id: currentUser.id,
    }

    const existingProfile = await trx('profiles').where({
      user_id: currentUser.id,
    })

    if (!existingProfile.length) await trx('profiles').insert(record)
    else await trx('profiles').where({ user_id: currentUser.id }).update(record)

    if (payload.email) {
      const emailExists = await trx('users')
        .where({
          email: payload.email,
        })
        .whereNot({
          id: currentUser.id,
        })

      if (emailExists.length) {
        await trx.rollback()
        return Response(
          400,
          {
            error: 'Email being used by another account',
          },
          res
        )
      }

      await trx('users')
        .where({ id: currentUser.id })
        .update({ email: payload.email })
    }

    await trx.commit()

    return Response(
      200,
      {
        message: 'Profile Updated',
      },
      res
    )
  } catch (err) {
    if (trx) await trx.rollback()

    return Response(
      500,
      {
        error: 'Oops! Something went wrong',
        message: String(err),
      },
      res
    )
  }
}

controller.deleteUser = async (req, res) => {
  let trx
  try {
    const { currentUser } = req
    trx = await req.db.transaction()
    await trx('users')
      .where({
        id: currentUser.id,
      })
      .del()
    await trx.commit()
    return Response(
      200,
      {
        message: 'Deleted User',
      },
      res
    )
  } catch (err) {
    trx && (await trx.rollback())
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

controller.searchUsers = async (req, res) => {
  try {
    const { currentUser } = req
    const { searchTerm } = req.query
    if (!searchTerm || !searchTerm.length) {
      return Response(
        400,
        {
          error: 'Search Terms is a required Parameter',
        },
        res
      )
    }

    const normalisedSearchTerm = `%${searchTerm.replace(/ /g, '%')}%`

    const users = await req
      .db('users')
      .where('users.email', 'ilike', normalisedSearchTerm)
      .orWhere('profiles.name', 'ilike', normalisedSearchTerm)
      .leftJoin('profiles', 'profiles.user_id', 'users.id')
      .select('users.email', 'users.id', 'profiles.name as profile_name')
    return Response(
      200,
      {
        data: users,
      },
      res
    )
  } catch (err) {
    console.error(err)
    return UnhandledErrorResponse(res)
  }
}

export const getUserDetails = async function (id) {
  invariant(id, '`id` is required')
  const userDetails = await db('users')
    .where('users.id', '=', id)
    .leftJoin('profiles', 'profiles.user_id', 'users.id')
    .select([
      'email',
      'users.id as id',
      'profiles.name as profiles.name',
      'profiles.id as profiles.id',
    ])
    .first()
  return nestie(userDetails, '.')
}

export async function getActiveUserCount() {
  const countRows = await db('users')
    .where({
      is_active: true,
    })
    .count()
    .first()

  const userCount = countRows.count

  return userCount
}

export default controller