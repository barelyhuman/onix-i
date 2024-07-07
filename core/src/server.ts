import { createServer } from './app.js'

function main() {
  const app = createServer()
  app.listen({ port: app.config.port }, err => {
    if (err) {
      app.log.error(err.message)
      process.exit(1)
    }
    app.log.info('http://127.0.0.1:8000/foo')
  })

  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeFullReload', async () => {
      await app.close()
    })

    import.meta.hot.dispose(async () => {
      await app.close()
    })
  }
}

main()
