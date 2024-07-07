import { Config } from './config.js'
import { Knex } from 'knex'
import { Domain } from './plugins/domain/domain.js'

declare module 'fastify' {
  interface FastifyInstance {
    config: Config
    knex: Knex
    domain: Domain
  }
}
