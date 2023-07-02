exports.up = function (knex) {
  return knex.schema.table('project_user_mapping', table => {
    table.boolean('is_active').notNullable().default(true)
  })
}

exports.down = function (knex) {
  return knex.schema.table('project_user_mapping', table => {
    table.dropColumn('is_active')
  })
}
