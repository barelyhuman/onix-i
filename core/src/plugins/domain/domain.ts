import fp from 'fastify-plugin'
import { fetchUserById, createProfile } from './knex/user'

export type Domain = ReturnType<typeof getDomain>

function getDomain(fastify) {
  return {
    user: {
      fetchUserById: (id: number) => fetchUserById(fastify.knex, id),
      createUser: () => createProfile()
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
