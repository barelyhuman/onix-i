import fp from 'fastify-plugin'

export default fp(
  function (fastify, options, done) {
    fastify.after(() => {
      fastify.get('/api/me', (req, res) => {
        //TODO: add authentication check
        const currentUserId = 1
        return fastify.domain.user.fetchUserById(currentUserId)
      })
    })
    done()
  },
  {
    name: 'routes',
  }
)
