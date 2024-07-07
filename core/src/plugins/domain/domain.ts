import fp from 'fastify-plugin'
import { fetchUserById } from './knex/user'

export type Domain = ReturnType<typeof getDomain>

function getDomain(fastify) {
  return {
    user: {
      fetchUserById: (id: number) => fetchUserById(fastify.knex, id),
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
