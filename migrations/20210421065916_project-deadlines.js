exports.up = function (knex) {
  return knex.schema.hasTable('projects').then(tableExists => {
    if (!tableExists) return false

    return knex.schema.table('projects', table => {
      table.date('deadline').nullable()
    })
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('projects', table => {
    table.dropColumn('deadline')
  })
}
