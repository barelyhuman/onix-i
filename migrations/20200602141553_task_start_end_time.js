exports.up = function (knex) {
  return knex.schema.table('tasks', table => {
    table.datetime('start_time')
    table.datetime('end_time')
  })
}

exports.down = function (knex) {
  return knex.schema.table('tasks', table => {
    table.dropColumn('start_time')
    table.dropColumn('end_time')
  })
}
