exports.up = function (knex) {
  return knex.schema
    .createTable('options', table => {
      table.increments('id').unique().primary().notNullable()
      table.integer('value').notNullable()
      table.integer('seq').notNullable()
      table.text('label').notNullable()
      table.text('identifier').notNullable()
    })
    .alterTable('todos', table => {
      table.renameColumn('status', 'old_status')
    })
    .alterTable('todos', table => {
      table.integer('status').notNullable().default(0)
    })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('options').alterTable('todos', table => {
    table.dropColumn('status')
    table.renameColumn('old_status', 'status')
  })
}
