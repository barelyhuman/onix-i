exports.up = function (knex) {
  return knex.schema.createTable('todos', table => {
    table.increments('id').unique().primary().notNullable()
    table.text('content')
    table
      .enu('status', ['done', 'pending', 'paused', 'not-started'])
      .notNullable()
      .defaultsTo('not-started')
    table.integer('project_id').nullable()
    table.integer('user_id').notNullable()

    table.timestamps(true, true)

    table
      .foreign('project_id')
      .references('projects.id')
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
  return knex.schema.dropTableIfExists('todos')
}
