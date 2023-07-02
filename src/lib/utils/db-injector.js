const dbConfig = require('../../../knexfile.js')
const Knex = require('knex')

let connection
const config = dbConfig[process.env.NODE_ENV || 'development']

export const getDatabaseConnector = () => {
  return () => {
    connection = global.pg || ((global.pg = Knex(config)), global.pg)
    return connection
  }
}
