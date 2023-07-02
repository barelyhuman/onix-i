exports.up = function (knex) {
  return knex.schema.alterTable('integrations', table => {
    table.text('provider_user_id').alter()
    table.datetime('nonce_expiry').alter()
    table.string('bot_token').nullable()
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('integrations', table => {
    table.integer('provider_user_id').alter()
    table.date('nonce_expiry').alter()
    table.dropColumn('bot_token')
  })
}
