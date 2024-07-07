import { createServer } from './app'

function main() {
  const app = createServer()
  app.listen({ port: app.config.port }, err => {
    if (err) {
      app.log.error(err.message)
      process.exit(1)
    }
    app.log.info('http://127.0.0.1:8000/foo')
  })
}

main()
