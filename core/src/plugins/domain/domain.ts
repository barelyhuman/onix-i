import fp from 'fastify-plugin'
import {
  fetchUserById,
  createProfile,
  searchUsers,
  updateProfile,
} from './knex/user.js'

export type Domain = ReturnType<typeof getDomain>

function getDomain(fastify) {
  return {
    user: {
      fetchUserById: (id: number) => fetchUserById(fastify.knex, id),
      createProfile: (email: string, name?: string) =>
        createProfile(fastify.knex, email, name),
      updateProfile: (id: number, email: string, name: string) =>
        updateProfile(fastify.knex, id, email, name),
      searchUsers: (searchTerm: string) =>
        searchUsers(fastify.knex, searchTerm),
    },
  }
}

export default fp(
  function (fastify, _, done) {
    fastify.decorate('domain', getDomain(fastify))
    done()
  },
  {
    name: 'domain',
    dependencies: ['database'],
  }
)
