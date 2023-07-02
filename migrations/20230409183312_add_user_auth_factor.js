exports.up = function (knex) {
  return knex.schema
    .createTable('user_auth_factor', table => {
      table.increments('id').unique().primary().notNullable()
      table.boolean('is_active').notNullable().default(true)
      table.string('factor_type').notNullable()
      table.string('secret').notNullable()
      table.json('meta').notNullable().default('{}')
      table.timestamps(true, true)
      table
        .integer('user_id')
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    })
    .alterTable('tokens', table => {
      table.boolean('2fa_token').notNullable().default(false)
    })
    .alterTable('users', table => {
      table.datetime('last_auth_attempt').nullable()
      table.integer('auth_attempts').notNullable().default(0)
    })
}

exports.down = function (knex) {
  return knex.schema
    .alterTable('users', table => {
      table.dropColumn('last_auth_attempt')
      table.dropColumn('auth_attempts')
    })
    .alterTable('tokens', table => {
      table.dropColumn('2fa_token')
    })
    .dropTableIfExists('user_auth_factor')
}
