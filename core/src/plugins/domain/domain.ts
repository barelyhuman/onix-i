import fp from 'fastify-plugin'
import * as UserDomainKnex from './knex/user.js'
import * as AuthDomainKnex from './knex/auth.js'

export type Domain = ReturnType<typeof getDomainFromKnex>

function getDomainFromKnex(fastify) {
  return {
    auth: {
      acceptUserToken: AuthDomainKnex.acceptUserToken(fastify.knex),
      createRegistrationToken: AuthDomainKnex.createRegistrationToken(
        fastify.knex
      ),
      isExistingUser: AuthDomainKnex.isExistingUser(fastify.knex),
      isTokenVerified: AuthDomainKnex.isTokenVerified(fastify.knex),
    },
    user: {
      fetchUserById: UserDomainKnex.fetchUserById(fastify.knex),
      createProfile: UserDomainKnex.createProfile(fastify.knex),
      updateProfile: UserDomainKnex.updateProfile(fastify.knex),
      searchUsers: UserDomainKnex.searchUsers(fastify.knex),
    },
  }
}

export default fp(
  function (fastify, _, done) {
    fastify.decorate('domain', getDomainFromKnex(fastify))
    done()
  },
  {
    name: 'domain',
    dependencies: ['database'],
  }
)
