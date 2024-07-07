import underPressure from '@fastify/under-pressure'
import Fastify from 'fastify'
import noIcon from 'fastify-no-icon'
import { config } from './config'
import routerPlugin from './plugins/routes'
import db from './plugins/db'
import domain from './plugins/domain/domain'

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

  server.register(noIcon)

  return server
}

export default createServer
