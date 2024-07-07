// Update with your config settings.

export default {
  development: {
    client: 'postgresql',
    connection: {
      database: 'tillwhen',
      user: 'postgres',
      password: 'postgres',
    },
    pool: {
      min: 2,
      max: 2,
    },
    migrations: {
      tableName: 'migrations',
    },
  },

  staging: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 2,
    },
    migrations: {
      tableName: 'migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 2,
    },
    migrations: {
      tableName: 'migrations',
    },
  },
}
