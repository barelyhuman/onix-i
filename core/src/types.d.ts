import { auth } from 'firebase-admin'
import { Config } from './config'
import { Knex } from 'knex'
import { Domain } from './plugins/domain/domain'

declare module 'fastify' {
  interface FastifyInstance {
    config: Config
    knex: Knex
    domain: Domain
  }
}
