exports.up = function (knex) {
  return knex.schema.table('tokens', table => {
    table.text('token_pair').unique().notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.table('tokens', table => {
    table.dropColumn('token_pair')
  })
}
