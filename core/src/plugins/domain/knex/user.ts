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

export const updateProfile = (db: Knex, email: string, name: string) => {
  return db('profile').update({ name }).where({ email }).returning(['id'])
}
