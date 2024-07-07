import type { Knex } from 'knex'

export const fetchUserById = (db: Knex, id: number) => {
  return db('users')
    .leftJoin('profiles as profile', 'users.id', 'profile.user_id')
    .where('users.id', id)
    .select(
      'profile.name as profileName',
      'profile.id as profileId',
      'users.id ',
      'users.email'
    )
}

export const createProfile = (db: Knex, email: string, name?: string) => {
  return db('profile').insert({ email, name }).returning(['id'])
}

export const updateProfile = (
  db: Knex,
  id: number,
  email: string,
  name: string
) => {
  return db('profile').update({ name, email }).where({ id }).returning(['id'])
}

export const searchUsers = async (db: Knex, searchTerm: string) => {
  const normalisedSearchTerm = `%${searchTerm.replace(/\s*/g, '%')}%`

  const users = await db('users')
    .where('users.email', 'ilike', normalisedSearchTerm)
    .orWhere('profiles.name', 'ilike', normalisedSearchTerm)
    .leftJoin('profiles', 'profiles.user_id', 'users.id')
    .select('users.email', 'users.id', 'profiles.name as profile_name')

  return users
}

export const deleteUser = (db: Knex, id: string) => {
  return db('users').where({ id }).del()
}
