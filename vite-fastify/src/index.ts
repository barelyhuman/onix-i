// this is a super simple version of the plugin from here
// https://github.com/Vanilla-IceCream/vite-plugin-fastify.
//
// We've removed the stuff I don't need in the production version and this
// just exists to act as hot module version of the fastify server

import { Plugin } from 'vite'
import type { FastifyInstance } from 'fastify'

export function viteFastify(): Plugin {
  return {
    name: 'vite-fastify',
    config(_config) {
      let host = '0.0.0.0'
      let port = 3000
      if (_config.define?.['process.env.HOST']) {
        host = JSON.parse(_config.define?.['process.env.HOST'])
        port = JSON.parse(_config.define?.['process.env.PORT'])
      }
      return Object.assign(_config, {
        server: {
          host,
          port,
        },
        build: {
          ssr: true,
          rollupOptions: {
            input: {
              server: './src/server.ts',
            },
          },
        },
      })
    },
    configureServer(server) {
      server.middlewares.use(async function (req, res) {
        const appMod = await server.ssrLoadModule('./src/app.ts')
        if (!appMod) {
          throw new Error('App module missing')
        }
        const fastify: FastifyInstance = appMod.default()
        await fastify.ready()
        fastify.routing(req, res)
      })
    },
  }
}
