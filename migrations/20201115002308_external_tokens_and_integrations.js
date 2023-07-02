exports.up = function (knex) {
  return knex.schema
    .createTable('integrations', table => {
      table.increments('id').unique().primary().notNullable()
      table.text('nonce').nullable()
      table.integer('internal_user_id').nullable()
      table.integer('provider').notNullable()
      table.integer('provider_user_id').notNullable()
      table.date('nonce_expiry').nullable()

      table.boolean('is_active').notNullable().default(true)

      table.timestamps(true, true)

      table
        .foreign('internal_user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    })
    .createTable('external_access_tokens', table => {
      table.increments('id').unique().primary().notNullable()
      table.text('token').unique().notNullable()
      table.text('token_pair').unique().notNullable()
      table.date('token_expiry').notNullable()

      table.integer('integration_id').notNullable()
      table.integer('user_id').notNullable()

      table.boolean('is_active').notNullable().default(true)

      table.timestamps(true, true)

      table
        .foreign('integration_id')
        .references('integrations.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table
        .foreign('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('external_access_tokens')
    .dropTableIfExists('integrations')
}
