import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'vite'
import { viteFastify } from 'vite-fastify'
import { resolve } from 'path'

loadEnv()

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: Number(process.env.PORT),
  },
  plugins: [viteFastify()],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
})
