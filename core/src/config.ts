import knexConfig from '../knexfile'
import type { Knex } from 'knex'

export const config = {
  port: 3000,
  databaseConfig: knexConfig[
    process.env.NODE_ENV || 'development'
  ] as Knex.Config,
}

export type Config = typeof config
