import underPressure from "@fastify/under-pressure";
import Fastify from "fastify";
import noIcon from "fastify-no-icon";
import fp from "fastify-plugin";
import fknex from "fastify-knexjs";
const knexConfig = {
  development: {
    client: "postgresql",
    connection: {
      database: "tillwhen",
      user: "postgres",
      password: "postgres"
    },
    pool: {
      min: 2,
      max: 2
    },
    migrations: {
      tableName: "migrations"
    }
  },
  staging: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 2
    },
    migrations: {
      tableName: "migrations"
    }
  },
  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 2
    },
    migrations: {
      tableName: "migrations"
    }
  }
};
const config = {
  port: 3e3,
  databaseConfig: knexConfig[process.env.NODE_ENV || "development"]
};
const routerPlugin = fp(
  function(fastify, options, done) {
    fastify.after(() => {
      fastify.get("/ping", async (req, res) => {
        await res.send({ pong: true });
      });
    });
    done();
  },
  {
    name: "routes"
  }
);
const db = fp(
  function(fastify, options, done) {
    const connectionConfig = knexConfig[process.env.NODE_ENV || "development"];
    fastify.register(fknex, connectionConfig);
    done();
  },
  {
    name: "database"
  }
);
function createServer() {
  const server = Fastify({
    logger: true
  });
  server.decorate("config", config);
  server.register(routerPlugin);
  server.register(db);
  server.register(underPressure, {
    maxEventLoopDelay: 1e3,
    maxHeapUsedBytes: 1e8,
    maxRssBytes: 1e8,
    maxEventLoopUtilization: 0.98
  });
  server.register(noIcon);
  return server;
}
function main() {
  const app = createServer();
  app.listen({ port: app.config.port }, (err) => {
    if (err) {
      app.log.error(err.message);
      process.exit(1);
    }
    app.log.info("http://127.0.0.1:8000/foo");
  });
}
main();
