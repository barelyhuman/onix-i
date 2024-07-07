import Fastify from 'fastify'
import underPressure from '@fastify/under-pressure'
import noIconPlugin from 'fastify-no-icon'
import { config } from './config.js'
import routerPlugin from './plugins/routes.js'
import db from './plugins/db.js'
import domain from './plugins/domain/domain.js'

export function createServer() {
  const server = Fastify({
    logger: true,
  })

  server.decorate('config', config)

  server.register(routerPlugin)
  server.register(db)
  server.register(domain)

  server.register(underPressure, {
    maxEventLoopDelay: 1000,
    maxHeapUsedBytes: 100000000,
    maxRssBytes: 100000000,
    maxEventLoopUtilization: 0.98,
  })

  server.register(noIconPlugin.default)
  return server
}

export default createServer
