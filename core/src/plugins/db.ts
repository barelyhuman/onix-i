import fb from 'fastify-plugin'
import fknex from 'fastify-knexjs'
import knexConfig from '../../knexfile.js'

export default fb(
  function (fastify, options, done) {
    const connectionConfig = knexConfig[process.env.NODE_ENV || 'development']
    fastify.register(fknex, connectionConfig)
    done()
  },
  {
    name: 'database',
  }
)
