var config, connection, dbConfig, getDatabaseConnector

import assert from 'assert'

import Knex from 'knex'

import { types } from 'pg'

// disable date to convert to JS Date
types.setTypeParser(types.builtins.DATE, val => {
  return val
})

types.setTypeParser(types.builtins.TIME, val => {
  return val
})

types.setTypeParser(types.builtins.TIMETZ, val => {
  return val
})

types.setTypeParser(types.builtins.TIMESTAMP, val => {
  return val
})

types.setTypeParser(types.builtins.TIMESTAMPTZ, val => {
  return val
})

dbConfig = require('../../knexfile.js')

connection = void 0

config = dbConfig[process.env.NODE_ENV || 'development']

assert(
  config,
  `Failed to get knex configuration for env:${process.env.NODE_ENV}`
)

getDatabaseConnector = function () {
  if (global.pg) {
    return global.pg
  }
  if (!connection) {
    connection = Knex(config)
  }
  global.pg = connection
  return connection
}

export var db = getDatabaseConnector()
