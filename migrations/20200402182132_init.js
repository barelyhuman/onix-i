exports.up = function (knex) {
  return knex.schema
    .createTable('users', table => {
      table.increments('id').unique().primary().notNullable()
      table.string('email').unique().notNullable()
      table.boolean('is_verified').notNullable().default(false)
      table.boolean('is_active').notNullable().default(true)
      table.timestamps(true, true)
    })
    .createTable('profiles', table => {
      table.increments('id').unique().primary().notNullable()
      table.string('name').notNullable()
      table.integer('user_id').unique().notNullable()
      table.boolean('is_active').notNullable().default(true)

      table.timestamps(true, true)

      table
        .foreign('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    })
    .createTable('projects', table => {
      table.increments('id').unique().primary().notNullable()
      table.string('name').notNullable()
      table.text('description').notNullable()
      table.boolean('is_active').notNullable().default(true)
      table.bigInteger('time_spent').notNullable().default(0)
      table.integer('user_id').notNullable()

      table.timestamps(true, true)

      table
        .foreign('user_id')
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    })
    .createTable('project_user_mapping', table => {
      table.increments('id').unique().primary().notNullable()

      table.integer('user_id').notNullable()
      table.integer('project_id').notNullable()

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
    .createTable('tasks', table => {
      table.increments('id').unique().primary().notNullable()
      table.text('name').notNullable()
      table.bigInteger('time_spent').notNullable().default(0)
      table.boolean('is_active').notNullable().default(true)
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
    .createTable('tokens', table => {
      table.increments('id').primary().unique().notNullable()
      table.string('token_name').notNullable()
      table.text('token').unique().notNullable()
      table.boolean('is_verified').defaultTo('false').notNullable()
      table.string('email').notNullable()
      table.timestamps(true, true)
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('tokens')
    .dropTableIfExists('tasks')
    .dropTableIfExists('project_user_mapping')
    .dropTableIfExists('projects')
    .dropTableIfExists('role_mapping')
    .dropTableIfExists('roles')
    .dropTableIfExists('profiles')
    .dropTableIfExists('users')
}
