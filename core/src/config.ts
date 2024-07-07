import knexConfig from '../knexfile.js'
import type { Knex } from 'knex'

export const config = {
  port: process.env.PORT || 3000,
  databaseConfig: knexConfig[
    process.env.NODE_ENV || 'development'
  ] as Knex.Config,
}

export type Config = typeof config
